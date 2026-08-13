import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Bookmark, FileSearch, Minus, TrendingUp, Wand2, X } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@my-better-t-app/ui/components/card";
import { Button } from "@my-better-t-app/ui/components/button";
import { Badge } from "@my-better-t-app/ui/components/badge";
import { Progress } from "@my-better-t-app/ui/components/progress";
import { Slider } from "@my-better-t-app/ui/components/slider";
import { Textarea } from "@my-better-t-app/ui/components/textarea";
import { Label } from "@my-better-t-app/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@my-better-t-app/ui/components/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@my-better-t-app/ui/components/dialog";
import { useDb } from "@/hooks/use-db";
import { db } from "@/lib/db";
import { computeMatches, correlateCvToPaths, type CvPathFit } from "@/lib/engine";
import { careerPaths, skillOptions, type CareerPath } from "@/lib/mock-data";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Rekomendasi Jalur Karier — MULAI+" },
      {
        name: "description",
        content:
          "Cocokkan profil, skill, dan asesmen kamu dengan jalur karier yang tumbuh di pasar Indonesia.",
      },
    ],
  }),
  component: CareerPage,
});

const ROLES = [
  "Business Analyst",
  "Fresh Graduate",
  "Marketing Associate",
  "Software Engineer",
  "Mahasiswa",
  "Masih menentukan",
];
const INTERESTS = ["Product", "Engineering", "Design", "Data", "Business", "Marketing"];

function CareerPage() {
  const state = useDb();
  const [manualText, setManualText] = useState<string | null>(null);
  const [cvChecked, setCvChecked] = useState<CvPathFit[] | null>(null);

  // Reaktif: begitu state lokal (dengan audit) tiba, auto-cek CV dari audit terakhir
  const auditText = state.audits[0]?.text ?? "";
  const cvText = manualText ?? auditText;
  useEffect(() => {
    if (auditText && !manualText && !cvChecked) {
      setCvChecked(correlateCvToPaths(auditText));
    }
  }, [auditText, manualText, cvChecked]);
  const [role, setRole] = useState(state.profile?.currentRole ?? "Fresh Graduate");
  const [interest, setInterest] = useState(state.profile?.interest ?? "Product");
  const [years, setYears] = useState([state.profile?.yearsExp ?? 0]);
  const [skills, setSkills] = useState<string[]>(state.profile?.skills ?? ["Excel", "SQL"]);
  const [riasec, setRiasec] = useState(state.profile?.riasec ?? "IES");
  const [compare, setCompare] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const matches = useMemo(
    () => computeMatches({ skills, interest, riasec, yearsExp: years[0]! }),
    [skills, interest, riasec, years],
  );

  const top = matches.slice(0, 3);
  const similar = matches.slice(3);

  const toggleSkill = (s: string) =>
    setSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const toggleCompare = (id: string) =>
    setCompare((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id],
    );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Career Recommend"
        title="Jalur karier mana yang paling masuk akal untuk kamu?"
        description="Ubah input di bawah — hasil match score dihitung ulang secara langsung dari skill, minat, RIASEC, dan pengalamanmu."
      />

      {/* CV Check: korelasi CV ↔ jalur */}
      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-brand-soft/40 px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <FileSearch className="size-4 text-brand" /> CV Check — seberapa cocok CV-mu dengan tiap
            jalur?
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                setCvChecked(cvText.trim().length > 40 ? correlateCvToPaths(cvText) : null)
              }
            >
              <Wand2 className="size-3.5" /> Cek CV
            </Button>
          </div>
        </div>
        <div className="p-5">
          {cvChecked ? (
            <div className="space-y-3">
              {cvChecked.slice(0, 3).map((f, i) => (
                <div
                  key={f.pathId}
                  className={`rounded-xl border p-4 ${i === 0 ? "border-brand/50 bg-brand-soft/30" : "border-border"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-semibold">
                      {f.title}
                      {i === 0 && <Badge className="bg-brand-soft">Cocok terbaik</Badge>}
                    </span>
                    <span className="text-sm font-bold">{f.match}% cocok</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={f.match} className="h-2 flex-1" />
                    <span className="text-[11px] text-muted-foreground">
                      {f.hitCount}/{f.total} keyword
                    </span>
                  </div>
                  {f.missing.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Kurang di CV:</span>
                      {f.missing.slice(0, 4).map((m) => (
                        <span
                          key={m}
                          className="rounded-md bg-coral-soft px-1.5 py-0.5 text-[10px] font-medium text-coral"
                        >
                          + {m}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    to="/cv-builder"
                    search={{ role: f.title }}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand hover:bg-brand-soft"
                  >
                    Buat CV untuk jalur ini <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <Textarea
                className="min-h-24 font-mono text-xs"
                placeholder="Tempel isi CV-mu di sini — hasil audit terakhirmu sudah terisi otomatis jika ada…"
                value={cvText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {cvText.trim().length > 40
                  ? "Klik 'Cek CV' untuk melihat jalur mana yang paling cocok dengan kata-kata di CV-mu."
                  : "Tempel minimal 40 karakter, lalu klik 'Cek CV'."}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label className="mb-2 block">Role sekarang</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Tertarik di bidang</Label>
            <Select value={interest} onValueChange={setInterest}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERESTS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-3 block">Pengalaman: {years[0]} tahun</Label>
            <Slider value={years} onValueChange={setYears} min={0} max={15} step={1} />
          </div>
          <div>
            <Label className="mb-2 block">Kode RIASEC (hasil asesmen)</Label>
            <Select value={riasec} onValueChange={setRiasec}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "R",
                  "I",
                  "A",
                  "S",
                  "E",
                  "C",
                  "RI",
                  "RA",
                  "RS",
                  "RE",
                  "RC",
                  "IA",
                  "IS",
                  "IE",
                  "IC",
                  "AS",
                  "AE",
                  "AC",
                  "SE",
                  "SC",
                  "EC",
                  "IES",
                  "EIS",
                  "IRC",
                  "RIA",
                ].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Label className="mb-3 block">Skill yang kamu punya ({skills.length})</Label>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((s) => (
              <button
                key={s}
                onClick={() => toggleSkill(s)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  skills.includes(s)
                    ? "border-brand bg-brand-soft font-medium"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={() =>
              toast.success("Rekomendasi diperbarui", {
                description: `${skills.length} skill dianalisis`,
              })
            }
          >
            Perbarui rekomendasi
          </Button>
          <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? "Sembunyikan detail" : "Tampilkan semua jalur"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {state.profile ? "Terhubung dengan profilmu" : "Hasil belum tersimpan ke profil"}
          </span>
        </div>
      </Card>

      <div className="mb-4 mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Top jalur untuk kamu</h2>
        <Button variant="outline" disabled={compare.length < 2} onClick={() => setOpen(true)}>
          Bandingkan ({compare.length})
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {top.map((p) => (
          <PathCard
            key={p.pathId}
            path={p}
            userSkills={skills}
            selected={compare.includes(p.pathId)}
            saved={state.roadmap.includes(p.pathId)}
            onCompare={() => toggleCompare(p.pathId)}
            onSave={() => {
              db.toggleRoadmap(p.pathId);
              toast.success(
                state.roadmap.includes(p.pathId) ? "Dihapus dari roadmap" : "Disimpan ke roadmap",
                {
                  description: "Terlihat di dashboardmu.",
                },
              );
            }}
          />
        ))}
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl font-bold">Explore jalur serupa</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {similar.map((p) => (
          <Card key={p.pathId} className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-display text-lg font-semibold">{p.title}</p>
              <p className="text-sm text-muted-foreground">
                {p.matchScore}% match · {p.marketGrowth}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggleCompare(p.pathId)}>
                {compare.includes(p.pathId) ? "Batal" : "Bandingkan"}
              </Button>
              <Button
                variant={state.roadmap.includes(p.pathId) ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  db.toggleRoadmap(p.pathId);
                  toast.success("Roadmap diperbarui");
                }}
              >
                <Bookmark className="size-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-display">Perbandingan jalur karier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {careerPaths
              .filter((p) => compare.includes(p.pathId))
              .map((p) => (
                <div key={p.pathId} className="rounded-2xl border border-border p-4">
                  <p className="font-display text-lg font-semibold">{p.title}</p>
                  <p className="mt-1 text-sm text-brand">{p.matchScore}% match</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Pertumbuhan</dt>
                      <dd className="font-medium">{p.marketGrowth}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Gaji</dt>
                      <dd className="font-medium">{p.salaryRange}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Skill perlu dikejar</dt>
                      <dd className="font-medium">{p.skillsGap.need.join(", ")}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Estimasi belajar</dt>
                      <dd className="font-medium">
                        {p.learning.reduce((a, b) => a + b.weeks, 0)} minggu
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function PathCard({
  path,
  userSkills,
  selected,
  saved,
  onCompare,
  onSave,
}: {
  path: CareerPath & { matched: string[]; gap: string[] };
  userSkills: string[];
  selected: boolean;
  saved: boolean;
  onCompare: () => void;
  onSave: () => void;
}) {
  const have = path.skillsGap.have.filter((s) =>
    userSkills.some((u) => u.toLowerCase().includes(s.split(" ")[0]!.toLowerCase())),
  );

  return (
    <Card className="flex h-full flex-col p-6 card-hover">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-semibold">{path.title}</h3>
        <Badge variant="secondary" className="bg-brand-soft">
          {path.matchScore}%
        </Badge>
      </div>
      <Progress className="mt-3" value={path.matchScore} />
      <p className="mt-3 text-sm text-muted-foreground">{path.summary}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Pertumbuhan</p>
          <p className="mt-1 inline-flex items-center gap-1 font-semibold">
            {path.trend === "up" ? (
              <TrendingUp className="size-3.5 text-success" />
            ) : (
              <Minus className="size-3.5 text-muted-foreground" />
            )}
            {path.marketGrowth}
          </p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Gaji</p>
          <p className="mt-1 text-xs font-semibold">{path.salaryRange}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Skill gap
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(have.length ? have : path.skillsGap.have).map((s) => (
            <span key={s} className="rounded-lg bg-brand-soft px-2 py-1 text-xs font-medium">
              ✓ {s}
            </span>
          ))}
          {path.gap.length
            ? path.gap.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-coral-soft px-2 py-1 text-xs font-medium text-coral"
                >
                  + {s}
                </span>
              ))
            : path.skillsGap.need.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-coral-soft px-2 py-1 text-xs font-medium text-coral"
                >
                  + {s}
                </span>
              ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Learning pathway
        </p>
        <ul className="mt-2 space-y-1.5 text-sm">
          {path.learning.map((l) => (
            <li key={l.name} className="flex justify-between gap-2">
              <span>{l.name}</span>
              <span className="text-muted-foreground">{l.weeks} mg</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Contoh lowongan
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {path.sampleJobs.map((j) => (
            <li key={j}>· {j}</li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link
          to="/mentors"
          className="inline-flex items-center gap-1 rounded-xl bg-coral px-3 py-2 text-sm font-semibold text-coral-foreground"
        >
          Cari mentor <ArrowRight className="size-3.5" />
        </Link>
        <Button variant="outline" size="sm" onClick={onCompare}>
          {selected ? (
            <>
              <X className="size-3.5" /> Batal
            </>
          ) : (
            "Bandingkan"
          )}
        </Button>
        <Button
          variant={saved ? "secondary" : "ghost"}
          size="sm"
          onClick={onSave}
          title="Simpan ke roadmap"
        >
          <Bookmark className={saved ? "size-3.5 fill-brand text-brand" : "size-3.5"} />
        </Button>
      </div>
    </Card>
  );
}
