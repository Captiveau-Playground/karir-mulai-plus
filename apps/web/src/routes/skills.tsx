import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Award, ArrowRight, CheckCircle2, XCircle, Zap } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Progress } from "@karir-mulai-plus/ui/components/progress";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { useDb } from "@/hooks/use-db";
import { db } from "@/lib/db";
import { SKILL_QUIZZES, type Quiz } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skill Quiz — MULAI+" },
      {
        name: "description",
        content: "Buktikan skill-mu dengan quiz, dapatkan badge terverifikasi untuk profilmu.",
      },
    ],
  }),
  component: SkillsPage,
});

type Phase =
  | { mode: "list" }
  | { mode: "quiz"; quiz: Quiz; q: number; score: number; picked: number | null; wrong: number[] };

function SkillsPage() {
  const state = useDb();
  const [phase, setPhase] = useState<Phase>({ mode: "list" });

  const verifiedCount = state.verifiedSkills.filter((v) => v.score >= 70).length;

  const startQuiz = (quiz: Quiz) =>
    setPhase({ mode: "quiz", quiz, q: 0, score: 0, picked: null, wrong: [] });

  const pick = (i: number) => {
    if (phase.mode !== "quiz" || phase.picked !== null) return;
    const correct = i === phase.quiz.questions[phase.q]!.correct;
    setPhase({
      ...phase,
      picked: i,
      score: phase.score + (correct ? 1 : 0),
      wrong: correct ? phase.wrong : [...phase.wrong, phase.q],
    });
  };

  const next = () => {
    if (phase.mode !== "quiz") return;
    if (phase.q + 1 >= phase.quiz.questions.length) {
      const scorePct = Math.round((phase.score / phase.quiz.questions.length) * 100);
      const passed = scorePct >= 70;
      db.addQuiz(phase.quiz.skill, scorePct);
      toast.success(passed ? `${phase.quiz.skill} terverifikasi! 🏅` : "Quiz selesai", {
        description: `Skor ${scorePct}/100 · +20 XP`,
      });
      setPhase({ mode: "list" });
    } else {
      setPhase({ ...phase, q: phase.q + 1, picked: null });
    }
  };

  const quit = () => setPhase({ mode: "list" });

  if (phase.mode === "quiz") {
    const { quiz, q, picked, score } = phase;
    const question = quiz.questions[q]!;
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand">
                Quiz · {quiz.skill}
              </p>
              <h1 className="font-display text-2xl font-bold">
                Pertanyaan {q + 1} dari {quiz.questions.length}
              </h1>
            </div>
            <Button variant="ghost" size="sm" onClick={quit}>
              Keluar
            </Button>
          </div>
          <Progress
            value={((q + (picked !== null ? 1 : 0)) / quiz.questions.length) * 100}
            className="mb-6 h-2"
          />

          <Card className="p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold leading-snug">{question.q}</h2>
            <div className="mt-6 space-y-2.5">
              {question.options.map((opt, i) => {
                const isPicked = picked === i;
                const isCorrect = i === question.correct;
                return (
                  <button
                    key={i}
                    disabled={picked !== null}
                    onClick={() => pick(i)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                      picked === null && "border-border hover:border-brand hover:bg-brand-soft",
                      picked !== null && isCorrect && "border-success bg-success/10",
                      picked !== null && isPicked && !isCorrect && "border-coral bg-coral-soft",
                      picked !== null && !isPicked && !isCorrect && "border-border opacity-50",
                    )}
                  >
                    <span>{opt}</span>
                    {picked !== null && isCorrect && (
                      <CheckCircle2 className="size-4 shrink-0 text-success" />
                    )}
                    {picked !== null && isPicked && !isCorrect && (
                      <XCircle className="size-4 shrink-0 text-coral" />
                    )}
                  </button>
                );
              })}
            </div>

            {picked !== null && (
              <div className="mt-5 rounded-xl bg-muted/60 p-4 text-sm">
                <p className="font-semibold">
                  {picked === question.correct ? "Benar! 🎉" : "Belum tepat."}
                </p>
                <p className="mt-1 text-muted-foreground">{question.explain}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Skor: {score}/{phase.q + 1}
                  </span>
                  <Button onClick={next}>
                    {q + 1 >= quiz.questions.length ? "Lihat hasil" : "Lanjut"}{" "}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Career OS · Skill"
        title="Buktikan skill-mu, dapatkan badge"
        description="Badge skill terverifikasi menonjol di profil, dashboard, dan ke depan — ke employer. Skor ≥70 = terverifikasi."
        action={
          <Badge variant="secondary" className="bg-brand-soft px-3 py-2">
            <Award className="size-4" /> {verifiedCount} badge dimiliki
          </Badge>
        }
      />

      <div className="mb-6 rounded-2xl bg-brand-soft/60 p-5 text-sm">
        <p className="font-semibold">
          Data menunjukkan: user dengan badge terverifikasi 41% lebih sering direspons recruiter.
        </p>
        <p className="mt-1 text-muted-foreground">Ambil quiz — setiap selesai +20 XP.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKILL_QUIZZES.map((quiz) => {
          const verified = state.verifiedSkills.find((v) => v.skill === quiz.skill);
          const passed = verified && verified.score >= 70;
          return (
            <Card key={quiz.skill} className="flex flex-col p-6 card-hover">
              <div className="flex items-start justify-between">
                <div className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Zap className="size-5" />
                </div>
                {passed ? (
                  <Badge className="bg-success/15 text-success">
                    <Award className="size-3" /> Terverifikasi {verified!.score}/100
                  </Badge>
                ) : verified ? (
                  <Badge variant="secondary">Skor {verified!.score} — coba lagi</Badge>
                ) : (
                  <Badge variant="secondary">{quiz.questions.length} soal</Badge>
                )}
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold">{quiz.skill}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {quiz.questions.length} pertanyaan pilihan ganda · skor ≥70 untuk badge
                terverifikasi.
              </p>
              <Button
                className="mt-5"
                variant={passed ? "outline" : "default"}
                onClick={() => startQuiz(quiz)}
              >
                {passed ? "Ulangi quiz" : "Mulai quiz"} <ArrowRight className="size-4" />
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-5 text-sm text-muted-foreground">
        Ingin menambah skill? Cek{" "}
        <Link to="/market" className="font-semibold text-brand hover:underline">
          skill paling dicari
        </Link>{" "}
        dan pelajari gap-nya lewat{" "}
        <Link to="/career" className="font-semibold text-brand hover:underline">
          jalur kariermu
        </Link>
        .
      </Card>
    </AppShell>
  );
}
