import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowRight, ClipboardCopy, Plus, Printer, Sparkles, Trash2, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { useDb, useHydrated } from "@/hooks/use-db";
import { db, defaultProfile, type CvDraft } from "@/lib/db";
import { ROLE_KEYWORDS, ROLE_OPTIONS } from "@/lib/engine";
import { cn } from "@/lib/utils";

const CvBuilderSearch = z.object({
  role: z.string().optional(),
  from: z.string().optional(),
});

export const Route = createFileRoute("/cv-builder")({
  validateSearch: CvBuilderSearch,
  head: () => ({
    meta: [
      { title: "CV Builder — MULAI+" },
      {
        name: "description",
        content: "Buat CV profesional dari saran audit — template, preview live, dan ekspor PDF.",
      },
    ],
  }),
  component: CvBuilderPage,
});

const ACCENTS = {
  brand: "#0e7c86",
  coral: "#e07a5f",
  ink: "#1c2430",
} as const;

type Accent = keyof typeof ACCENTS;

function CvBuilderPage() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl py-24 text-center text-sm text-muted-foreground">
          Memuat CV Builder…
        </div>
      </AppShell>
    );
  }
  return <CvBuilderInner />;
}

function CvBuilderInner() {
  const state = useDb();
  const profile = state.profile ?? defaultProfile();
  const latestAudit = state.audits[0];
  const saved = state.cvDraft;
  const { role: roleParam } = useSearch({ from: "/cv-builder" });

  const role =
    saved?.roleTarget ??
    roleParam ??
    latestAudit?.roleTarget ??
    (profile.interest === "Data" ? "Data Analyst" : "Product Manager");

  const initialSummary = useMemo(() => {
    if (saved) return saved.summary;
    return latestAudit
      ? `Spesialis ${latestAudit.roleTarget} dengan pengalaman yang menerjemahkan data dan kebutuhan bisnis menjadi keputusan — memangkas waktu reporting 40% untuk 3 tim bisnis.`
      : `${profile.currentRole} dengan pengalaman ${profile.yearsExp} tahun yang fokus pada ${profile.interest.toLowerCase()}, terbiasa bekerja lintas tim dan berbasis data.`;
  }, [saved, latestAudit, profile]);

  const [draft, setDraft] = useState<CvDraft>(() => {
    if (saved) return saved;
    const extraSkills = roleParam
      ? (ROLE_KEYWORDS[roleParam]?.filter(
          (k) => !profile.skills.some((s) => s.toLowerCase().includes(k)),
        ) ?? [])
      : [];
    return {
      roleTarget: role,
      summary: initialSummary,
      experiences: latestAudit
        ? [
            {
              title: latestAudit.roleTarget,
              company: "PT Contoh Nusantara",
              period: "2024 — sekarang",
              bullets: [
                "Mengotomasi 12 laporan mingguan lewat SQL + Sheets, menghemat ~15 jam kerja tim per bulan.",
                "Memimpin koordinasi 3 tim bisnis dan menurunkan waktu pengambilan keputusan 30%.",
              ],
            },
          ]
        : [
            {
              title: profile.currentRole,
              company: "Perusahaan / Organisasi",
              period: "2024 — sekarang",
              bullets: [
                "Tulis pencapaian dengan format Aksi + Metrik + Dampak (cth: menghemat 15 jam/bulan).",
              ],
            },
          ],
      skills: [
        ...new Set([
          ...profile.skills,
          ...state.verifiedSkills.map((v) => v.skill),
          ...extraSkills.slice(0, 4),
        ]),
      ],
      education: {
        degree: "S1 — " + (profile.interest || "Manajemen"),
        school: "Universitas",
        period: "2020 — 2024",
      },
      template: "modern",
      accent: "brand",
      updatedAt: Date.now(),
    };
  });

  const accent = ACCENTS[draft.accent];

  const set = (patch: Partial<CvDraft>) =>
    setDraft((d) => ({ ...d, ...patch, updatedAt: Date.now() }));

  const addKeyword = () => {
    const missing = ROLE_KEYWORDS[draft.roleTarget] ?? [];
    const add =
      missing.find((k) => !draft.skills.some((s) => s.toLowerCase().includes(k))) ??
      "Problem Solving";
    if (!draft.skills.includes(add)) set({ skills: [...draft.skills, add] });
  };

  const save = () => {
    db.saveCvDraft({ ...draft, updatedAt: Date.now() });
    toast.success("Draft CV tersimpan", { description: "Tersedia di dashboardmu." });
  };

  const printCv = () => {
    db.saveCvDraft({ ...draft, updatedAt: Date.now() });
    window.print();
  };

  const copyText = () => {
    const text = cvToText(draft, profile.name);
    navigator.clipboard
      ?.writeText(text)
      .then(() =>
        toast.success("CV disalin sebagai teks", { description: "Tempel ke aplikasi apa pun." }),
      );
  };

  const initials = profile.name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Career OS · CV Builder"
        title="Buat CV yang langsung bisa dipakai"
        description="Saran dari audit otomatis masuk ke template. Edit kiri, preview kanan, unduh PDF."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyText}>
              <ClipboardCopy className="size-4" /> Salin teks
            </Button>
            <Button variant="outline" onClick={save}>
              Simpan draft
            </Button>
            <Button onClick={printCv}>
              <Printer className="size-4" /> Unduh PDF
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-brand" />
          <span className="text-sm font-semibold">Role target:</span>
        </div>
        <Select value={draft.roleTarget} onValueChange={(v) => set({ roleTarget: v })}>
          <SelectTrigger className="w-56">
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

        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Template
            </span>
            <div className="flex gap-1.5">
              {(["minimal", "modern", "bold"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => set({ template: t })}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                    draft.template === t
                      ? "border-brand bg-brand-soft"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            {(Object.keys(ACCENTS) as Accent[]).map((a) => (
              <button
                key={a}
                onClick={() => set({ accent: a })}
                aria-label={`Warna ${a}`}
                className={cn(
                  "size-7 rounded-full border-2 transition-transform",
                  draft.accent === a ? "scale-110 border-foreground" : "border-transparent",
                )}
                style={{ backgroundColor: ACCENTS[a] }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Next-step CTA: builder → tracker */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand-soft/50 p-4">
        <div>
          <p className="font-display text-sm font-semibold text-brand-navy">
            CV-mu sudah siap dilamar? 🎯
          </p>
          <p className="mt-0.5 font-manrope text-xs text-text-muted">
            Lacak lamaran dari draft sampai offer di Tracker Lamaran.
          </p>
        </div>
        <Link
          to="/tracker"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-manrope text-sm font-bold text-brand-foreground shadow-sm transition-all hover:bg-brand/90"
        >
          Lacak lamaran <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FORM */}
        <div className="space-y-5">
          {/* Summary */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <Label className="font-display text-base font-semibold">Ringkasan</Label>
              <Badge variant="secondary">paling dibaca recruiter</Badge>
            </div>
            <Textarea
              className="mt-3 min-h-24"
              value={draft.summary}
              onChange={(e) => set({ summary: e.target.value })}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Tips: sebut role, tahun pengalaman, 1 pencapaian terukur. Target 2–3 kalimat.
            </p>
          </Card>

          {/* Pengalaman */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <Label className="font-display text-base font-semibold">Pengalaman</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  set({
                    experiences: [
                      ...draft.experiences,
                      { title: "Role", company: "Perusahaan", period: "Tahun", bullets: [""] },
                    ],
                  })
                }
              >
                <Plus className="size-3.5" /> Tambah
              </Button>
            </div>
            <div className="mt-4 space-y-5">
              {draft.experiences.map((exp, ei) => (
                <div key={ei} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <Input
                        value={exp.title}
                        placeholder="Job title"
                        onChange={(e) => {
                          const experiences = [...draft.experiences];
                          experiences[ei] = { ...exp, title: e.target.value };
                          set({ experiences });
                        }}
                      />
                      <Input
                        value={exp.company}
                        placeholder="Perusahaan"
                        onChange={(e) => {
                          const experiences = [...draft.experiences];
                          experiences[ei] = { ...exp, company: e.target.value };
                          set({ experiences });
                        }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        set({ experiences: draft.experiences.filter((_, i) => i !== ei) })
                      }
                      className="grid size-8 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                      aria-label="Hapus pengalaman"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <Input
                    className="mt-2"
                    value={exp.period}
                    placeholder="Periode (cth: 2024 — sekarang)"
                    onChange={(e) => {
                      const experiences = [...draft.experiences];
                      experiences[ei] = { ...exp, period: e.target.value };
                      set({ experiences });
                    }}
                  />
                  <div className="mt-3 space-y-2">
                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2">
                        <Input
                          value={b}
                          placeholder="Aksi + Metrik + Dampak (cth: Mengotomasi 12 laporan, hemat 15 jam/bulan)"
                          onChange={(e) => {
                            const experiences = [...draft.experiences];
                            const bullets = [...exp.bullets];
                            bullets[bi] = e.target.value;
                            experiences[ei] = { ...exp, bullets };
                            set({ experiences });
                          }}
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            onClick={() => {
                              const experiences = [...draft.experiences];
                              experiences[ei] = {
                                ...exp,
                                bullets: exp.bullets.filter((_, i) => i !== bi),
                              };
                              set({ experiences });
                            }}
                            className="grid size-9 shrink-0 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                            aria-label="Hapus bullet"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      set({
                        experiences: draft.experiences.map((e, i) =>
                          i === ei ? { ...e, bullets: [...e.bullets, ""] } : e,
                        ),
                      })
                    }
                  >
                    <Plus className="size-3.5" /> Tambah poin
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Skill */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <Label className="font-display text-base font-semibold">Skill</Label>
              <Button variant="outline" size="sm" onClick={addKeyword}>
                <Wand2 className="size-3.5" /> Tambah keyword {draft.roleTarget}
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium"
                >
                  {s}
                  <button
                    onClick={() => set({ skills: draft.skills.filter((x) => x !== s) })}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Hapus ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Keyword ATS untuk {draft.roleTarget} otomatis bisa ditambahkan — biar lolos penyaring
              pertama.
            </p>
          </Card>

          {/* Pendidikan */}
          <Card className="p-5">
            <Label className="font-display text-base font-semibold">Pendidikan</Label>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Input
                className="sm:col-span-1"
                value={draft.education.degree}
                placeholder="Gelar"
                onChange={(e) => set({ education: { ...draft.education, degree: e.target.value } })}
              />
              <Input
                value={draft.education.school}
                placeholder="Universitas"
                onChange={(e) => set({ education: { ...draft.education, school: e.target.value } })}
              />
              <Input
                value={draft.education.period}
                placeholder="Periode"
                onChange={(e) => set({ education: { ...draft.education, period: e.target.value } })}
              />
            </div>
          </Card>
        </div>

        {/* PREVIEW */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Preview live
            </p>
            <Badge variant="secondary">A4</Badge>
          </div>
          <div className="max-h-[80vh] overflow-auto rounded-2xl border border-border bg-muted/40 p-4">
            <div
              id="cv-print"
              className="mx-auto w-full max-w-[794px] bg-white text-ink shadow-sm"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              <CvPreview name={profile.name} initials={initials} draft={draft} accent={accent} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------------- Preview CV (3 template) ---------------- */

function CvPreview({
  name,
  initials,
  draft,
  accent,
}: {
  name: string;
  initials: string;
  draft: CvDraft;
  accent: string;
}) {
  const t = draft.template;
  const headerBg = t === "bold" ? "#1c2430" : t === "modern" ? accent : "transparent";
  const headerColor = t === "bold" ? "#fff" : t === "modern" ? "#fff" : "#1c2430";

  return (
    <div className="p-8 text-[13px] leading-relaxed">
      {/* Header */}
      {t === "minimal" ? (
        <div className="border-b-2 pb-4" style={{ borderColor: accent }}>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ fontFamily: "Sora, sans-serif" }}
          >
            {name}
          </h1>
          <p className="mt-1 font-semibold" style={{ color: accent }}>
            {draft.roleTarget}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Jakarta, Indonesia · kamu@email.com · +62 812-3456-7890 · linkedin.com/in/kamu
          </p>
        </div>
      ) : (
        <div
          className="-mx-8 -mt-8 mb-6 px-8 py-6"
          style={{ backgroundColor: headerBg, color: headerColor }}
        >
          <div className="flex items-center gap-4">
            <div
              className="grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold"
              style={{
                backgroundColor: t === "modern" ? "rgba(255,255,255,.18)" : accent,
                color: "#fff",
              }}
            >
              {initials}
            </div>
            <div>
              <h1
                className="text-2xl font-extrabold tracking-tight"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                {name}
              </h1>
              <p className="text-sm font-semibold opacity-90">{draft.roleTarget}</p>
              <p className="mt-0.5 text-[10px] opacity-70">
                Jakarta · kamu@email.com · linkedin.com/in/kamu
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <Section title="Ringkasan" accent={accent} minimal={t === "minimal"}>
        <p className="text-muted-foreground">
          {draft.summary || "Tulis ringkasan singkat — siapa kamu dan pencapaian utamamu."}
        </p>
      </Section>

      {/* Experience */}
      <Section title="Pengalaman" accent={accent} minimal={t === "minimal"}>
        {draft.experiences
          .filter((e) => e.title.trim() || e.company.trim())
          .map((e, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-bold">{e.title || "Role"}</p>
                <p className="shrink-0 text-[11px] text-muted-foreground">{e.period}</p>
              </div>
              <p className="text-[11px] font-semibold" style={{ color: accent }}>
                {e.company}
              </p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-muted-foreground">
                {e.bullets.filter(Boolean).map((b, bi) => (
                  <li key={bi}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
      </Section>

      {/* Skills */}
      <Section title="Skill" accent={accent} minimal={t === "minimal"}>
        <div className="flex flex-wrap gap-1.5">
          {draft.skills.map((s) => (
            <span
              key={s}
              className="rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* Education */}
      <Section title="Pendidikan" accent={accent} minimal={t === "minimal"}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-bold">{draft.education.degree || "Gelar"}</p>
          <p className="shrink-0 text-[11px] text-muted-foreground">{draft.education.period}</p>
        </div>
        <p className="text-[11px] font-semibold" style={{ color: accent }}>
          {draft.education.school}
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  accent,
  minimal,
  children,
}: {
  title: string;
  accent: string;
  minimal: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      {minimal ? (
        <>
          <h2 className="text-[11px] font-extrabold uppercase tracking-[0.15em]">{title}</h2>
          <div className="mt-1 h-0.5 w-8" style={{ backgroundColor: accent }} />
        </>
      ) : (
        <h2
          className="mb-2 border-b pb-1 text-[11px] font-extrabold uppercase tracking-[0.15em]"
          style={{ borderColor: `${accent}44`, color: accent }}
        >
          {title}
        </h2>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ---------------- Utils ---------------- */

function cvToText(draft: CvDraft, name: string): string {
  const lines = [
    name.toUpperCase(),
    draft.roleTarget,
    "",
    "RINGKASAN",
    draft.summary,
    "",
    "PENGALAMAN",
    ...draft.experiences.flatMap((e) => [
      `${e.title} — ${e.company} (${e.period})`,
      ...e.bullets.filter(Boolean).map((b) => `- ${b}`),
      "",
    ]),
    "SKILL",
    draft.skills.join(", "),
    "",
    "PENDIDIKAN",
    `${draft.education.degree} — ${draft.education.school} (${draft.education.period})`,
  ];
  return lines.join("\n");
}
