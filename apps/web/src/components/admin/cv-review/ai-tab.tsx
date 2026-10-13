import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@karir-mulai-plus/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { EmptyState, GradeBadge, MiniBar, Pill, ScoreRing, gradeTone } from "./ui";
import { adminStore } from "@/lib/cv-review/store";
import {
  GRADES,
  GRADE_MAP,
  formatDateTime,
  relTime,
  type AiSeverity,
  type CaseFile,
  type CvGradeKey,
} from "@/lib/cv-review/data";
import { cn } from "@/lib/utils";

const SEVERITY_LABEL: Record<AiSeverity, string> = {
  blocker: "Blocker",
  major: "Mayor",
  minor: "Minor",
};

export function AiTab({ c }: { c: CaseFile }) {
  const [overrideOpen, setOverrideOpen] = useState(false);
  const ai = c.classification;

  if (!ai) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          title="Kasus ini belum diklasifikasi AI"
          hint="Jalankan klasifikasi untuk menilai tipe CV (rusak / lumayan / bagus) sebelum masuk review."
        />
        <div>
          <Button
            onClick={() => adminStore.rerunClassification(c.id)}
            className="gap-2 rounded-xl bg-brand-navy font-manrope text-sm font-semibold hover:bg-brand-navy/90"
          >
            <Sparkles className="size-4" /> Jalankan klasifikasi AI
          </Button>
        </div>
      </div>
    );
  }

  const grade = GRADE_MAP[ai.grade];
  const strengths = ai.signals.filter((s) => s.kind === "strength");
  const risks = ai.signals.filter((s) => s.kind === "risk");
  const blockers = ai.issues.filter((i) => i.severity === "blocker");
  const breakdown = [
    { key: "Struktur", value: ai.breakdown.structure },
    { key: "Keyword ATS", value: ai.breakdown.keywords },
    { key: "Dampak", value: ai.breakdown.impact },
    { key: "Kustomisasi role", value: ai.breakdown.customization },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Kartu hasil AI */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScoreRing score={ai.score} tone={gradeTone(ai.grade)} label="skor" size={104} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <GradeBadge grade={ai.grade} />
                <Pill tone="muted">
                  <Bot className="size-3" /> {ai.model}
                </Pill>
                <Pill tone={ai.confidence >= 80 ? "success" : ai.confidence >= 65 ? "warning" : "danger"}>
                  keyakinan {ai.confidence}%
                </Pill>
                {ai.humanConfirmed && (
                  <Pill tone="success">
                    <ShieldCheck className="size-3" /> dikonfirmasi reviewer
                  </Pill>
                )}
              </div>
              <p className="mt-2 font-bricolage text-lg font-bold text-text-main">{grade.headline}</p>
              <p className="mt-1 max-w-xl font-manrope text-sm text-text-muted">{grade.description}</p>
              <p className="mt-2 font-manrope text-[11px] text-text-muted">
                dianalisis {relTime(ai.at)} · kualitas ekstraksi teks: {ai.extractionQuality} · estimasi
                kerja {ai.effortHours} jam
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => adminStore.rerunClassification(c.id)}
              className="gap-1.5 rounded-xl font-manrope text-xs"
            >
              <RefreshCw className="size-3.5" /> Klasifikasi ulang
            </Button>
            {!ai.humanConfirmed && (
              <Button
                size="sm"
                onClick={() => adminStore.confirmClassification(c.id)}
                className="gap-1.5 rounded-xl bg-emerald-600 font-manrope text-xs font-semibold hover:bg-emerald-700"
              >
                <CheckCircle2 className="size-3.5" /> Konfirmasi
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOverrideOpen(true)}
              className="gap-1.5 rounded-xl border-brand-orange/40 font-manrope text-xs text-amber-700"
            >
              <TriangleAlert className="size-3.5" /> Override
            </Button>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gray-100 bg-muted/50 p-4">
          <p className="font-manrope text-[10px] font-bold tracking-widest text-text-muted uppercase">
            Kesimpulan AI
          </p>
          <p className="mt-1.5 font-manrope text-[13px] text-text-main">{ai.verdict}</p>
        </div>

        {ai.overrideNote && (
          <div className="mt-3 rounded-xl border border-brand-orange/30 bg-brand-orange/10 p-3">
            <p className="font-manrope text-[11px] font-semibold text-amber-800">
              Reviewer menimpa hasil AI
            </p>
            <p className="font-manrope text-xs text-text-main">{ai.overrideNote}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Breakdown */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <h2 className="font-bricolage text-base font-bold text-text-main">Breakdown Penilaian</h2>
          <div className="mt-4 space-y-3">
            {breakdown.map((b) => (
              <div key={b.key}>
                <div className="flex items-center justify-between font-manrope text-xs">
                  <span className="text-text-muted">{b.key}</span>
                  <span className="font-semibold text-text-main">{b.value}/100</span>
                </div>
                <MiniBar
                  value={b.value}
                  tone={b.value >= 75 ? "success" : b.value >= 55 ? "warning" : "danger"}
                  className="mt-1.5 h-2"
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 font-manrope text-[11px] text-text-muted">
            <span>{ai.metricsFound} metrik terukur terdeteksi</span>
            <span>·</span>
            <span>
              keyword role: {ai.foundKeywords.length} ada / {ai.missingKeywords.length} hilang
            </span>
          </div>
        </div>

        {/* Sinyal */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <h2 className="font-bricolage text-base font-bold text-text-main">Sinyal Kualitas</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="font-manrope text-[10px] font-bold tracking-widest text-emerald-700 uppercase">
                Kekuatan
              </p>
              <ul className="mt-2 space-y-2">
                {strengths.length === 0 && (
                  <li className="font-manrope text-xs text-text-muted">Belum ada kekuatan menonjol.</li>
                )}
                {strengths.map((s) => (
                  <li key={s.label} className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-2.5">
                    <p className="font-manrope text-xs font-semibold text-text-main">{s.label}</p>
                    <p className="font-manrope text-[11px] text-text-muted">{s.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-manrope text-[10px] font-bold tracking-widest text-brand-red uppercase">
                Risiko
              </p>
              <ul className="mt-2 space-y-2">
                {risks.length === 0 && (
                  <li className="font-manrope text-xs text-text-muted">Tidak ada risiko besar.</li>
                )}
                {risks.map((s) => (
                  <li key={s.label} className="rounded-lg border border-brand-red/20 bg-brand-red/5 p-2.5">
                    <p className="font-manrope text-xs font-semibold text-text-main">{s.label}</p>
                    <p className="font-manrope text-[11px] text-text-muted">{s.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Temuan */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bricolage text-base font-bold text-text-main">
            Temuan & Rencana Perbaikan
          </h2>
          <div className="flex items-center gap-1.5">
            <Pill tone="danger">{blockers.length} blocker</Pill>
            <Pill tone="warning">{ai.issues.length - blockers.length} lain</Pill>
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {ai.issues.map((iss) => (
            <div
              key={iss.code}
              className={cn(
                "rounded-xl border p-3",
                iss.severity === "blocker"
                  ? "border-brand-red/25 bg-brand-red/5"
                  : "border-gray-100",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Pill
                  tone={iss.severity === "blocker" ? "danger" : iss.severity === "major" ? "warning" : "muted"}
                >
                  {SEVERITY_LABEL[iss.severity]}
                </Pill>
                <span className="font-manrope text-xs font-bold text-text-main">{iss.section}</span>
                <span className="font-manrope text-[10px] text-text-muted">{iss.code}</span>
              </div>
              <p className="mt-1.5 font-manrope text-[13px] text-text-main">{iss.detail}</p>
              <p className="mt-1 font-manrope text-xs text-text-muted">
                <span className="font-semibold text-brand-navy">Perbaikan:</span> {iss.fix}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 font-manrope text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" /> Keyword role terdeteksi
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ai.foundKeywords.length === 0 && (
              <span className="font-manrope text-xs text-text-muted">Tidak ada</span>
            )}
            {ai.foundKeywords.map((k) => (
              <span
                key={k}
                className="rounded-md bg-emerald-100 px-2 py-0.5 font-manrope text-[11px] text-emerald-800"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="flex items-center gap-2 font-manrope text-xs font-semibold text-brand-red">
            <AlertTriangle className="size-3.5" /> Keyword ATS hilang
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ai.missingKeywords.map((k) => (
              <span
                key={k}
                className="rounded-md bg-brand-red/10 px-2 py-0.5 font-manrope text-[11px] text-brand-red"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <OverrideDialog c={c} open={overrideOpen} onClose={() => setOverrideOpen(false)} />
    </div>
  );
}

function OverrideDialog({
  c,
  open,
  onClose,
}: {
  c: CaseFile;
  open: boolean;
  onClose: () => void;
}) {
  const [grade, setGrade] = useState<CvGradeKey>(c.classification?.grade ?? "lumayan");
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Override klasifikasi AI</DialogTitle>
          <DialogDescription>
            Dipakai saat penilaian reviewer berbeda dari model. Perubahan tercatat di riwayat kasus.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label className="font-manrope text-xs">Tipe CV menurut reviewer</Label>
            <Select value={grade} onValueChange={(v) => setGrade(v as CvGradeKey)}>
              <SelectTrigger className="font-manrope text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => (
                  <SelectItem key={g.key} value={g.key}>
                    {g.label} — {g.headline}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="font-manrope text-xs">Alasan (wajib agar bisa diaudit)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="cth. Isi sebenarnya cukup kuat, tapi PDF hasil scan membuat AI salah membaca struktur."
              className="min-h-20 font-manrope text-sm"
            />
          </div>
          {c.classification && (
            <p className="font-manrope text-[11px] text-text-muted">
              Hasil AI: {GRADE_MAP[c.classification.grade].label} (skor {c.classification.score}) ·
              dianalisis {formatDateTime(c.classification.at)}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-manrope text-sm">
            Batal
          </Button>
          <Button
            onClick={() => {
              adminStore.overrideGrade(c.id, grade, note);
              onClose();
            }}
            className="font-manrope text-sm font-semibold"
          >
            Simpan override
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}