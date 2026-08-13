import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileText,
  ImageDown,
  Loader2,
  Lock,
  Search,
  Share2,
  Sparkles,
  Target,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import { Progress } from "@karir-mulai-plus/ui/components/progress";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { cn } from "@/lib/utils";
import { useDb } from "@/hooks/use-db";
import { db } from "@/lib/db";
import {
  ROLE_OPTIONS,
  annotateCv,
  correlateCvToPaths,
  scoreCv,
  scoreGrade,
  FIX_DELTA,
  type AnnotLine,
  type CvFeedback,
  type CvResult,
} from "@/lib/engine";
import { drawScoreCard, drawScoreCardStory, downloadCanvas, shareIntents } from "@/lib/share";
import { pushAudit } from "@/lib/api";

export const Route = createFileRoute("/cv-audit")({
  head: () => ({
    meta: [
      { title: "CV Audit AI — MULAI+" },
      {
        name: "description",
        content:
          "Unggah CV kamu dan dapatkan skor, breakdown kategori, serta perbaikan per bagian.",
      },
    ],
  }),
  component: CvAuditPage,
});

const PROCESS_STEPS = [
  "Membaca struktur CV",
  "Mencocokkan keyword role",
  "Menilai dampak & metrik",
  "Menyusun rekomendasi",
];

const priorityStyle: Record<string, string> = {
  high: "bg-coral-soft text-coral",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

const SAMPLE_CV = `Ringkasan
Business Analyst dengan pengalaman 2 tahun yang menerjemahkan kebutuhan bisnis menjadi kebutuhan teknis.

Pengalaman
Business Analyst — PT Digital Nusantara (2024 - sekarang)
- Bertanggung jawab membuat laporan mingguan untuk tim.
- Berkomunikasi dengan stakeholder internal di berbagai divisi.
- Melakukan analisis data penjualan menggunakan Excel.

Pendidikan
S1 Manajemen, Universitas Indonesia (2018 - 2022)

Skill
Excel, SQL, Komunikasi, Stakeholder Management`;

/** Baca isi file (PDF/DOCX/TXT) di browser — jadi upload file benar-benar dianalisis. */
async function readFileContent(f: File): Promise<string> {
  const name = f.name.toLowerCase();
  if (name.endsWith(".txt")) return f.text();
  if (name.endsWith(".docx")) {
    const mammoth = (await import("mammoth/mammoth.browser")).default as {
      extractRawText: (o: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    };
    const res = await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
    return res.value;
  }
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({ data: await f.arrayBuffer() }).promise;
    let out = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      out +=
        content.items.map((it) => ("str" in it ? (it as { str: string }).str : "")).join(" ") +
        "\n";
    }
    return out;
  }
  return "";
}

function CvAuditPage() {
  const nav = useNavigate();
  const state = useDb();
  const [stage, setStage] = useState<"upload" | "processing" | "result">("upload");
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [roleTarget, setRoleTarget] = useState(ROLE_OPTIONS[0]!);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<CvResult | null>(null);
  const [auditText, setAuditText] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const hasFullAccess = state.premium || state.referralBonus;

  const run = (label: string, source: string) => {
    setFileName(label);
    setStage("processing");
    setStep(0);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    PROCESS_STEPS.forEach((_, i) => timers.current.push(setTimeout(() => setStep(i), i * 620)));
    timers.current.push(
      setTimeout(
        () => {
          const res = scoreCv(source, roleTarget);
          setResult(res);
          setAuditText(source);
          const auditRec = db.addAudit({
            inputType: label.includes("teks") || label.includes("Contoh") ? "text" : "file",
            ...(label.includes("teks") || label.includes("Contoh") ? {} : { fileName: label }),
            textSample: source.slice(0, 160),
            text: source.slice(0, 4000),
            roleTarget,
            score: res.overallScore,
            breakdown: res.breakdown,
          });
          pushAudit(auditRec);
          setStage("result");
          toast.success("Audit selesai", { description: `Skor CV kamu ${res.overallScore}/100` });
        },
        PROCESS_STEPS.length * 620 + 400,
      ),
    );
  };

  const onFile = async (f: File) => {
    setFileName(f.name);
    setStage("processing");
    setStep(0);
    let source = "";
    try {
      source = await readFileContent(f);
    } catch (e) {
      console.error("gagal baca file", e);
    }
    if (source.trim().length < 40) {
      toast.error("File tidak terbaca otomatis", {
        description: "Tempel isi CV sebagai teks di kolom sebelah kanan ya.",
      });
      setStage("upload");
      return;
    }
    run(f.name, source);
  };

  if (stage === "processing") {
    return <ProcessingScreen fileName={fileName} step={step} />;
  }

  if (stage === "result" && result) {
    return (
      <AppShell>
        <ResultView
          result={result}
          fullAccess={hasFullAccess}
          refCode={state.referralCode}
          auditText={auditText}
          roleTarget={roleTarget}
          fileName={fileName}
          userName={state.profile?.name ?? "CV saya"}
          onReset={() => {
            timers.current.forEach(clearTimeout);
            setStage("upload");
            setText("");
          }}
          onUpgrade={() => {
            db.setPremium(true);
            toast.success("Premium aktif 🎉", {
              description: "Semua contoh rewrite & rekomendasi terbuka.",
            });
          }}
          onCareer={() => nav({ to: "/career" })}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="CV Audit"
        title="Unggah CV, dapatkan perbaikan yang bisa langsung dipakai"
        description="Skor struktur, keyword ATS, dampak terukur, dan kustomisasi — dengan saran perbaikan di dalam aplikasi."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Dropzone */}
        <Card
          className={cn(
            "group relative overflow-hidden border-2 border-dashed p-10 text-center transition-all lg:col-span-3",
            dragging ? "border-brand bg-brand-soft/60" : "border-border hover:border-brand/50",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void onFile(f);
          }}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-0 transition-opacity",
              dragging && "opacity-100",
            )}
            style={{
              background:
                "radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--brand) 12%, transparent), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand transition-transform group-hover:scale-105">
              <UploadCloud className="size-8" />
            </div>
            <h2 className="mt-5 font-display text-xl font-semibold">Drag & drop CV kamu</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              PDF, DOCX, atau TXT — dibaca langsung di browser, tidak diupload ke server.
            </p>
            <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-coral-foreground card-hover">
              Pilih file
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                }}
              />
            </label>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {["Keyword ATS", "Metrik dampak", "Struktur bagian", "Kustomisasi role"].map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" /> {k}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Paste + role target */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-brand" />
              <h2 className="font-display text-lg font-semibold">Tempel teks CV</h2>
            </div>
            <button
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
              onClick={() => {
                setText(SAMPLE_CV);
                toast.info("Contoh CV dimuat", {
                  description: "Tekan Analisis teks untuk melihat cara kerjanya.",
                });
              }}
            >
              <Wand2 className="size-3.5" /> Coba contoh CV
            </button>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Role target (mempengaruhi scoring)
            </p>
            <Select value={roleTarget} onValueChange={setRoleTarget}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            className="mt-4 min-h-40 font-mono text-xs leading-relaxed"
            placeholder="Tempel isi CV kamu di sini... (semakin detail semakin akurat)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            className="mt-4 w-full"
            disabled={text.trim().length < 20}
            onClick={() => run("CV (teks)", text)}
          >
            <Search className="size-4" /> Analisis teks
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Minimal 20 karakter. Diproses di perangkatmu — CV tidak disimpan.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}

/* ---------------- Processing ---------------- */

function ProcessingScreen({ fileName, step }: { fileName: string | null; step: number }) {
  const pct = Math.round(((step + 1) / PROCESS_STEPS.length) * 100);
  return (
    <AppShell>
      <div className="mx-auto max-w-lg py-14 text-center">
        <div className="relative mx-auto grid size-16 place-items-center">
          <Loader2 className="size-10 animate-spin text-brand" />
          <Sparkles className="absolute -right-2 -top-2 size-4 text-coral" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Menganalisis {fileName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Biasanya selesai dalam kurang dari 30 detik.
        </p>

        <div className="mt-8">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Memproses</span>
            <span>{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <div className="mt-8 space-y-3 text-left">
          {PROCESS_STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-all",
                i <= step ? "bg-brand-soft" : "opacity-50",
              )}
            >
              {i < step ? (
                <CheckCircle2 className="size-4 text-success" />
              ) : (
                <Loader2
                  className={cn(
                    "size-4",
                    i === step ? "animate-spin text-brand" : "text-muted-foreground",
                  )}
                />
              )}
              <span className={cn(i === step && "font-semibold")}>{s}</span>
              {i === step && <Sparkles className="ml-auto size-3.5 animate-pulse text-brand" />}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

/* ---------------- Hasil audit ---------------- */

type Suggestion = CvFeedback & { id: number; delta: number };

function ResultView({
  result: r,
  fullAccess,
  refCode,
  auditText,
  roleTarget,
  fileName,
  userName,
  onReset,
  onUpgrade,
  onCareer,
}: {
  result: CvResult;
  fullAccess: boolean;
  refCode: string;
  auditText: string;
  roleTarget: string;
  fileName: string | null;
  userName: string;
  onReset: () => void;
  onUpgrade: () => void;
  onCareer: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringId = useId();
  const grade = scoreGrade(r.overallScore);

  const items: Suggestion[] = useMemo(
    () => r.feedback.map((f, i) => ({ ...f, id: i, delta: FIX_DELTA[f.priority] ?? 3 })),
    [r],
  );

  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [checked, setChecked] = useState<number[]>(() =>
    items.filter((i) => i.priority === "high").map((i) => i.id),
  );

  const visible = items.filter((f) => filter === "all" || f.priority === filter);
  const checkedDelta = checked.reduce(
    (sum, id) => sum + (items.find((i) => i.id === id)?.delta ?? 0),
    0,
  );
  const estimated = Math.min(97, r.overallScore + checkedDelta);
  const canPreview = auditText.trim().length > 60;

  const lines: AnnotLine[] = useMemo(
    () => (canPreview ? annotateCv(auditText, roleTarget) : []),
    [auditText, roleTarget, canPreview],
  );

  const fits = useMemo(
    () => (canPreview ? correlateCvToPaths(auditText) : []),
    [auditText, canPreview],
  );

  const toggle = (id: number) =>
    setChecked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const copy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(() => toast.success(`Disalin: ${label}`));
  };

  const copyAll = () => {
    const all = items
      .filter((i) => i.rewrite)
      .map((i) => `${i.section}:\n${i.rewrite!.after}`)
      .join("\n\n");
    copy(all, "semua perbaikan");
  };

  const shareText = `Skor CV saya ${r.overallScore}/100 💪 Cek skor CV kamu gratis di MULAI+ Career Compass!`;

  const cats = [
    { key: "Struktur", value: r.breakdown.structure, hint: "6 bagian standar" },
    { key: "Keyword", value: r.breakdown.keywords, hint: `${r.foundKeywords.length} terdeteksi` },
    { key: "Dampak", value: r.breakdown.impact, hint: `${r.metricsFound} metrik` },
    { key: "Kustomisasi", value: r.breakdown.customization, hint: "sesuai role target" },
  ];

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />

      {/* Header hasil */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">
            Hasil audit · {roleTarget}
            {fileName && !fileName.includes("teks") && !fileName.includes("Contoh") && (
              <span className="text-muted-foreground"> · dari {fileName}</span>
            )}
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            Ini yang perlu kamu ubah lebih dulu
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Laporan PDF sedang disiapkan")}
          >
            <Download className="size-4" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCard}>
            <ImageDown className="size-4" /> Kartu skor
          </Button>
          <Button variant="outline" size="sm" onClick={downloadStory}>
            <ImageDown className="size-4" /> Story 9:16
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            Audit lain
          </Button>
        </div>
      </div>

      {/* Hero skor */}
      <Card className="relative mb-6 overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(600px 240px at 12% -10%, color-mix(in oklab, var(--brand) 14%, transparent), transparent), radial-gradient(500px 220px at 95% 110%, color-mix(in oklab, var(--coral) 12%, transparent), transparent)",
          }}
        />
        <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
          <div className="mx-auto text-center">
            <ScoreRing score={r.overallScore} ringId={ringId} />
            <span
              className={cn(
                "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                grade.tone === "success" && "bg-success/15 text-success",
                grade.tone === "brand" && "bg-brand-soft text-brand",
                grade.tone === "warning" && "bg-warning/20 text-warning",
                grade.tone === "destructive" && "bg-coral-soft text-coral",
              )}
            >
              {grade.label}
            </span>
            <p className="mt-2 text-xs text-muted-foreground">
              Rata-rata kandidat 2 thn: 64 · Dipanggil interview: 81
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/70 p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
                <Sparkles className="size-3.5" /> Ringkasan AI
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.reasoning}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success/15 text-success">
                ✓ {r.foundKeywords.length} keyword {roleTarget}
              </Badge>
              <Badge className="bg-brand-soft">
                <Target className="size-3" /> {r.metricsFound} metrik terukur
              </Badge>
              <Badge variant="secondary">✗ {r.missingKeywords.length} keyword ATS hilang</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((c) => (
          <Card key={c.key} className="p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {c.key}
              </p>
              <p className="font-display text-lg font-bold">{c.value}</p>
            </div>
            <Progress className="mt-2 h-1.5" value={c.value} />
            <p className="mt-1.5 text-[11px] text-muted-foreground">{c.hint}</p>
          </Card>
        ))}
      </div>

      {/* Estimasi + filter saran */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Saran perbaikan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tandai saran yang mau kamu terapkan — skor perkiraan dihitung langsung.
          </p>
        </div>
        <div className="flex gap-1.5">
          {(["all", "high", "medium", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                filter === f
                  ? "border-brand bg-brand-soft"
                  : "border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              {f === "all" ? "Semua" : f}
            </button>
          ))}
        </div>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground line-through">{r.overallScore}</span>
            <ArrowRight className="size-4 text-brand" />
            <span className="font-display text-3xl font-bold text-brand">{estimated}</span>
            <span className="text-xs text-muted-foreground">skor perkiraan</span>
          </div>
          <div className="min-w-40 flex-1">
            <Progress
              value={estimated}
              className="h-2.5"
              indicatorClassName="bg-gradient-to-r from-brand to-coral"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {checked.length}/{items.length} saran ditandai · +{checkedDelta} poin
          </p>
        </div>
      </Card>

      {/* Kartu saran */}
      <div className="mb-10 space-y-4">
        {visible.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground">
            Tidak ada saran di kategori ini.
          </Card>
        )}
        {visible.map((f) => {
          const isChecked = checked.includes(f.id);
          return (
            <Card
              key={f.section + f.issue}
              className={cn(
                "p-5 transition-all sm:p-6",
                isChecked && "border-success/50 bg-success/[0.03]",
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggle(f.id)}
                  aria-label="Tandai selesai"
                  className={cn(
                    "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition-colors",
                    isChecked
                      ? "border-success bg-success text-success-foreground"
                      : "border-border hover:border-success",
                  )}
                >
                  {isChecked && <Check className="size-4" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold">{f.section}</h3>
                    <Badge className={priorityStyle[f.priority]} variant="secondary">
                      {f.priority}
                    </Badge>
                    {f.rewrite && fullAccess && (
                      <span className="text-[11px] font-medium text-success">
                        +{f.delta} poin jika diterapkan
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Masalah:</span> {f.issue}
                  </p>
                  <p className="mt-1.5 text-sm">
                    <span className="font-semibold text-foreground">Saran:</span> {f.suggestion}
                  </p>

                  {f.rewrite && (
                    <div
                      className={cn(
                        "relative mt-4 rounded-xl border border-border",
                        !fullAccess && "overflow-hidden",
                      )}
                    >
                      <div className="grid gap-3 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-coral">
                            Sebelum
                          </p>
                          <p className="mt-1.5 text-sm text-muted-foreground line-through decoration-coral/60">
                            {f.rewrite.before}
                          </p>
                        </div>
                        <div className="sm:border-l sm:border-border sm:pl-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-success">
                            Sesudah — siap pakai
                          </p>
                          <p className="mt-1.5 text-sm font-medium text-foreground">
                            {f.rewrite.after}
                          </p>
                        </div>
                      </div>
                      {fullAccess ? (
                        <button
                          onClick={() =>
                            copy(f.rewrite!.after, "perbaikan " + f.section.toLowerCase())
                          }
                          className="flex w-full items-center justify-center gap-1.5 border-t border-border bg-muted/50 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand-soft"
                        >
                          <ClipboardCopy className="size-3.5" /> Salin versi perbaikan
                        </button>
                      ) : (
                        <div className="absolute inset-0 grid place-items-center bg-background/70 backdrop-blur-[2px]">
                          <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-semibold shadow-sm">
                            <Lock className="size-3.5 text-coral" /> Contoh rewrite terkunci —
                            premium
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {fullAccess && items.some((i) => i.rewrite) && (
          <Button variant="outline" className="w-full" onClick={copyAll}>
            <ClipboardCopy className="size-4" /> Salin semua perbaikan sekaligus
          </Button>
        )}
      </div>

      {/* Pratinjau CV inline */}
      <h2 className="mb-4 font-display text-2xl font-bold">CV kamu, dibaca AI</h2>
      {canPreview ? (
        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
            <span className="text-xs font-semibold text-muted-foreground">Legenda:</span>
            <span className="rounded-md bg-success/15 px-2 py-0.5 text-[11px] font-medium">
              metrik & dampak
            </span>
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[11px] font-medium">
              keyword role
            </span>
            <span className="rounded-md bg-coral-soft px-2 py-0.5 text-[11px] font-medium text-coral">
              perlu angka
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
              judul bagian
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto p-5 font-mono text-[13px] leading-7">
            {lines.map((l, i) => (
              <div
                key={i}
                className={cn(
                  "whitespace-pre-wrap break-words px-1.5 py-0.5 -mx-1.5 rounded-md",
                  annotStyle(l.kind),
                )}
              >
                {l.text}
                {l.kind === "generic" && (
                  <span className="ml-2 text-[10px] font-semibold text-coral">
                    ⟵ tambah angka/verba dampak
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="mb-6 p-6 text-sm text-muted-foreground">
          Pratinjau inline tersedia untuk CV yang dianalisis dari teks (tempel atau contoh). Unggah
          file PDF/DOCX juga didukung — isinya dibaca langsung di browser.
        </Card>
      )}

      {/* Gate premium */}
      {!fullAccess && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 border-coral/40 bg-coral-soft/50 p-6">
          <div className="flex items-center gap-3">
            <Lock className="size-5 shrink-0 text-coral" />
            <div>
              <p className="font-semibold">
                Buka {items.filter((i) => i.rewrite).length} contoh rewrite & rekomendasi per role.
              </p>
              <p className="text-sm text-muted-foreground">
                Gratis untuk kamu sekarang — atau undang teman dengan link referral.
              </p>
            </div>
          </div>
          <Button onClick={onUpgrade} className="bg-coral text-coral-foreground">
            Buka premium — gratis
          </Button>
        </Card>
      )}

      {fullAccess && (
        <Card className="mb-6 p-6">
          <h2 className="font-display text-lg font-semibold">Rekomendasi spesifik per role</h2>
          <ul className="mt-4 space-y-3">
            {r.roleSpecific.map((x) => (
              <li key={x} className="flex gap-2 text-sm">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
                {x}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Korelasi: CV → jalur karier */}
      {fits.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-bold">
            CV-mu paling cocok untuk jalur ini
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {fits.slice(0, 3).map((f, i) => (
              <Card
                key={f.pathId}
                className={cn("flex flex-col p-5", i === 0 && "border-brand/50 bg-brand-soft/40")}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-semibold">{f.title}</p>
                  {i === 0 && <Badge className="bg-brand-soft">Terbaik</Badge>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={f.match} className="h-2 flex-1" />
                  <span className="text-xs font-bold">{f.match}%</span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {f.hitCount}/{f.total} keyword role terdeteksi
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.missing.slice(0, 3).map((m) => (
                    <span
                      key={m}
                      className="rounded-md bg-coral-soft px-1.5 py-0.5 text-[10px] font-medium text-coral"
                    >
                      + {m}
                    </span>
                  ))}
                </div>
                <Link
                  to="/cv-builder"
                  search={{ role: f.title }}
                  className="mt-3 inline-flex items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition-colors hover:border-brand hover:bg-brand-soft"
                >
                  Buat CV untuk jalur ini <ArrowRight className="size-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="mb-10 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() =>
            window.open(
              shareIntents.whatsapp(shareText + " " + window.location.origin + "/?ref=" + refCode),
              "_blank",
            )
          }
        >
          <Share2 className="size-4" /> Bagikan hasil
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(shareIntents.x(shareText, window.location.origin), "_blank")}
        >
          Share ke X
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(shareIntents.linkedin(window.location.origin), "_blank")}
        >
          Share ke LinkedIn
        </Button>
      </div>

      {/* Next steps */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Link
          to="/cv-builder"
          search={{ role: roleTarget, from: "audit" }}
          className="card-hover flex items-center justify-between rounded-2xl bg-brand p-5 text-brand-foreground"
        >
          <div>
            <p className="font-display text-base font-semibold">
              Buat CV baru dengan perbaikan ini
            </p>
            <p className="text-xs opacity-80">Saran & rewrite langsung diterapkan ke template CV</p>
          </div>
          <ArrowRight className="size-5" />
        </Link>
        <Link
          to="/career"
          className="card-hover flex items-center justify-between rounded-2xl bg-coral p-5 text-coral-foreground"
        >
          <div>
            <p className="font-display text-base font-semibold">
              Lihat jalur karier untuk profilmu
            </p>
            <p className="text-xs opacity-80">Cocokkan skill & kepribadianmu</p>
          </div>
          <ArrowRight className="size-5" />
        </Link>
        <Link
          to="/mentors"
          className="card-hover flex items-center justify-between rounded-2xl border border-border bg-card p-5"
        >
          <div>
            <p className="font-display text-base font-semibold">Booking review CV dengan mentor</p>
            <p className="text-xs text-muted-foreground">Dapatkan masukan langsung dari praktisi</p>
          </div>
          <ArrowRight className="size-5 text-brand" />
        </Link>
        <Link
          to="/cv-audit"
          className="card-hover flex items-center justify-between rounded-2xl border border-border bg-card p-5"
        >
          <div>
            <p className="font-display text-base font-semibold">Audit CV lain</p>
            <p className="text-xs text-muted-foreground">Uji teks atau file lain</p>
          </div>
          <ArrowRight className="size-5 text-brand" />
        </Link>
      </div>

      {!fullAccess && (
        <div className="mt-6 flex justify-center">
          <Button variant="ghost" onClick={onCareer}>
            Lewati dulu — lihat rekomendasi karier <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </>
  );

  function downloadCard() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawScoreCard(canvas, {
      name: userName,
      role: roleTarget,
      score: r.overallScore,
      breakdown: r.breakdown,
      topTips: r.feedback.slice(0, 3).map((f) => f.issue),
      refCode,
    });
    downloadCanvas(canvas, "skor-cv-mulai-plus.png");
    toast.success("Kartu skor diunduh", { description: "Bagikan ke temanmu!" });
  }

  function downloadStory() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawScoreCardStory(canvas, {
      name: userName,
      role: roleTarget,
      score: r.overallScore,
      breakdown: r.breakdown,
      topTips: r.feedback.slice(0, 3).map((f) => f.issue),
      refCode,
    });
    downloadCanvas(canvas, "skor-cv-story-mulai-plus.png");
    toast.success("Kartu story diunduh", { description: "Format 9:16 untuk IG/TikTok/WA status." });
  }
}

function annotStyle(kind: AnnotLine["kind"]): string {
  switch (kind) {
    case "heading":
      return "bg-muted font-sans text-xs font-bold uppercase tracking-widest text-foreground";
    case "metric":
      return "bg-success/15";
    case "keyword":
      return "bg-brand-soft";
    case "generic":
      return "bg-coral-soft/70";
    default:
      return "";
  }
}

function ScoreRing({ score, ringId }: { score: number; ringId: string }) {
  const size = 176;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--coral)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${ringId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-6xl font-extrabold tracking-tight">{score}</div>
          <div className="text-[11px] font-medium text-muted-foreground">dari 100</div>
        </div>
      </div>
    </div>
  );
}
