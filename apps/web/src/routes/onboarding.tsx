import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@my-better-t-app/ui/components/card";
import { Button } from "@my-better-t-app/ui/components/button";
import { Input } from "@my-better-t-app/ui/components/input";
import { Label } from "@my-better-t-app/ui/components/label";
import { Slider } from "@my-better-t-app/ui/components/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@my-better-t-app/ui/components/select";
import { db } from "@/lib/db";
import { RIASEC_QUESTIONS, scoreRiasec } from "@/lib/engine";
import { pushProfile } from "@/lib/api";
import { skillOptions } from "@/lib/mock-data";
import type { Profile } from "@/lib/db";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Mulai — MULAI+" },
      {
        name: "description",
        content: "Isi profil singkat dan dapatkan rekomendasi karier yang dipersonalisasi.",
      },
    ],
  }),
  component: OnboardingPage,
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

function OnboardingPage() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentRole, setCurrentRole] = useState(ROLES[0]!);
  const [years, setYears] = useState([0]);
  const [gradYear, setGradYear] = useState("");

  const [interest, setInterest] = useState("Product");
  const [skills, setSkills] = useState<string[]>(["Excel", "SQL"]);

  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const toggleSkill = (s: string) =>
    setSkills((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const pick = (idx: number, code: string) => {
    const next = [...answers];
    next[idx] = code;
    setAnswers(next);
  };

  const finish = () => {
    const r = scoreRiasec(answers);
    const p: Profile = {
      id: Math.random().toString(36).slice(2, 10),
      name: name.trim() || "Pengguna Baru",
      email: email.trim(),
      currentRole,
      yearsExp: years[0]!,
      interest,
      skills,
      riasec: r.code,
      onboardedAt: Date.now(),
    };
    if (gradYear.trim()) p.gradYear = Number(gradYear);
    db.setProfile(p);
    pushProfile(p);
    setDone(true);
    setTimeout(() => nav({ to: "/dashboard" }), 1400);
  };

  const steps = ["Profil kamu", "Minat & skill", "Kepribadian (RIASEC)"];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        {!done ? (
          <>
            <div className="mb-8">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold">
                <Sparkles className="size-3.5" /> Onboarding 60 detik
              </p>
              <h1 className="font-display text-3xl font-bold">{steps[step]}</h1>
              <div className="mt-5 flex gap-2">
                {steps.map((s, i) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= step ? "bg-brand" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Card className="p-6 sm:p-8">
              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label className="mb-2 block">Nama</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="cth: Dina Putri"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="kamu@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Status / role sekarang</Label>
                    <Select value={currentRole} onValueChange={setCurrentRole}>
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
                    <Label className="mb-3 block">Pengalaman kerja: {years[0]} tahun</Label>
                    <Slider value={years} onValueChange={setYears} min={0} max={15} step={1} />
                  </div>
                  <div>
                    <Label className="mb-2 block">Tahun lulus (opsional)</Label>
                    <Input
                      type="number"
                      min={2015}
                      max={2032}
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      placeholder="cth: 2026"
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Bidang yang paling menarik</Label>
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
                    <Label className="mb-3 block">
                      Skill yang kamu punya ({skills.length} dipilih)
                    </Label>
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
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Pilih yang lebih mendekati kamu di tiap pasangan. Jawaban ini memberi kode
                    kepribadian (RIASEC) yang ikut menentukan rekomendasi jalur karier.
                  </p>
                  {RIASEC_QUESTIONS.map((q, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-2">
                      {[
                        { label: q.a, code: q.aCode },
                        { label: q.b, code: q.bCode },
                      ].map((opt) => (
                        <button
                          key={opt.code + i}
                          onClick={() => pick(i, opt.code)}
                          className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                            answers[i] === opt.code
                              ? "border-brand bg-brand-soft font-semibold"
                              : "border-border hover:bg-secondary"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="size-4" /> Kembali
                </Button>
                {step < 2 ? (
                  <Button onClick={() => setStep((s) => s + 1)}>
                    Lanjut <ArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button
                    disabled={answers.length < RIASEC_QUESTIONS.length}
                    onClick={finish}
                    className="bg-coral text-coral-foreground"
                  >
                    Lihat hasil saya <Check className="size-4" />
                  </Button>
                )}
              </div>
            </Card>
          </>
        ) : (
          <Card className="p-10 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft">
              <Check className="size-7 text-brand" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold">Profil kamu siap!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Mengarahkan ke dashboard yang dipersonalisasi...
            </p>
            <Link
              to="/dashboard"
              className="mt-5 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Langsung ke dashboard →
            </Link>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
