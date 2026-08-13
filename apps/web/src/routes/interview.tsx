import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BookOpen, CheckCircle2, MessageSquare, Sparkles, Target, Trophy } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@my-better-t-app/ui/components/card";
import { Button } from "@my-better-t-app/ui/components/button";
import { Textarea } from "@my-better-t-app/ui/components/textarea";
import { Badge } from "@my-better-t-app/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@my-better-t-app/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@my-better-t-app/ui/components/select";
import { useDb } from "@/hooks/use-db";
import { db } from "@/lib/db";
import {
  evaluateAnswer,
  INTERVIEW_ROLE_QUESTIONS,
  ROLE_OPTIONS,
  STAR_TEMPLATE,
} from "@/lib/engine";

export const Route = createFileRoute("/interview")({
  head: () => ({
    meta: [
      { title: "Interview Prep — MULAI+" },
      {
        name: "description",
        content: "Latihan pertanyaan interview per role dengan metode STAR dan feedback instan.",
      },
    ],
  }),
  component: InterviewPage,
});

function InterviewPage() {
  const state = useDb();
  const [role, setRole] = useState(
    state.profile?.interest === "Data" ? "Data Analyst" : ROLE_OPTIONS[0]!,
  );
  const [mockMode, setMockMode] = useState(false);
  const [tab, setTab] = useState("practice");
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ score: number; tips: string[] } | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  const questions = INTERVIEW_ROLE_QUESTIONS[role] ?? INTERVIEW_ROLE_QUESTIONS["Product Manager"]!;

  const startMock = () => {
    setTab("mock");
    setMockMode(true);
    setIdx(0);
    setAnswer("");
    setFeedback(null);
    setScores([]);
  };

  const submit = () => {
    if (answer.trim().length < 10) {
      toast.error("Jawaban terlalu pendek", { description: "Coba ceritakan dengan 2-4 kalimat." });
      return;
    }
    const fb = evaluateAnswer(answer);
    setFeedback(fb);
    setScores((s) => [...s, fb.score]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length));
      db.addInterviewDone();
      toast.success("Mock interview selesai", {
        description: `Skor rata-rata ${avg}/100 · +10 XP`,
      });
      setMockMode(false);
      setScores([]);
      return;
    }
    setIdx((i) => i + 1);
    setAnswer("");
    setFeedback(null);
  };

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Career OS · Interview"
        title="Interview tidak dihafal, dilatih"
        description={`Pertanyaan spesifik role ${role} + feedback instan dengan metode STAR. ${state.interviewsDone} latihan selesai sejauh ini.`}
        action={
          !mockMode ? (
            <Button onClick={startMock}>
              <MessageSquare className="size-4" /> Mulai mock interview
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-brand" />
            <p className="text-sm font-semibold">Pilih role yang ingin kamu taklukkan</p>
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="mt-3">
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
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-warning" />
            <p className="text-sm font-semibold">Skor rata-rata latihanmu</p>
          </div>
          <p className="mt-2 font-display text-3xl font-bold">
            {avg || "—"}
            <span className="text-sm font-medium text-muted-foreground"> /100</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {state.interviewsDone} mock interview selesai
          </p>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="practice">
            <BookOpen className="size-4" /> Latihan soal
          </TabsTrigger>
          <TabsTrigger value="mock">
            <MessageSquare className="size-4" /> Mock interview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="mt-5">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              {questions.map((q, i) => (
                <details key={i} className="group rounded-2xl border border-border bg-card p-5">
                  <summary className="flex cursor-pointer list-none items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{q}</span>
                  </summary>
                  <div className="mt-4 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand">
                      Kerangka jawaban
                    </p>
                    <p className="mt-2 leading-relaxed">
                      Situasi (1-2 kalimat) → Tugas kamu → Aksi spesifik dengan verba berdampak →
                      Hasil terukur dengan angka. Latihan lisan, bukan hanya baca — lalu uji di tab
                      Mock interview.
                    </p>
                  </div>
                </details>
              ))}
            </div>

            <div>
              <Card className="p-5">
                <p className="font-display text-base font-semibold">{STAR_TEMPLATE.title}</p>
                <div className="mt-4 space-y-3">
                  {STAR_TEMPLATE.steps.map((s) => (
                    <div key={s.s} className="rounded-xl border border-border p-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-brand">
                        {s.s}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full" onClick={startMock}>
                  <MessageSquare className="size-4" /> Latihan sekarang
                </Button>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mock" className="mt-5">
          {!mockMode ? (
            <Card className="p-10 text-center">
              <MessageSquare className="mx-auto size-10 text-brand" />
              <h2 className="mt-4 font-display text-xl font-semibold">
                Mock interview untuk role {role}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {questions.length} pertanyaan. Jawab dengan metode STAR — kamu dapat skor & tips
                instan di tiap jawaban, lalu ringkasan di akhir.
              </p>
              <Button className="mt-6" onClick={startMock}>
                Mulai mock interview
              </Button>
            </Card>
          ) : (
            <Card className="mx-auto max-w-2xl p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <Badge variant="secondary">
                  Pertanyaan {idx + 1}/{questions.length}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {scores.length > 0 &&
                    `rata-rata ${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}`}
                </span>
              </div>

              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-brand to-coral transition-all"
                  style={{ width: `${((idx + (feedback ? 1 : 0)) / questions.length) * 100}%` }}
                />
              </div>

              <h2 className="mt-6 font-display text-lg font-semibold leading-snug">
                {questions[idx]}
              </h2>

              {!feedback ? (
                <>
                  <Textarea
                    className="mt-4 min-h-36"
                    placeholder="Jawab dengan STAR: situasi → tugas → aksi → hasil (sertakan angka)"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="ghost"
                      disabled={idx === 0}
                      onClick={() => setIdx((i) => i - 1)}
                    >
                      ← Sebelumnya
                    </Button>
                    <Button onClick={submit}>
                      <CheckCircle2 className="size-4" /> Kirim jawaban
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mt-6">
                  <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
                    <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-coral text-white">
                      <Target className="size-5" />
                    </div>
                    <div>
                      <p className="font-display text-2xl font-bold">{feedback.score}/100</p>
                      <p className="text-xs text-muted-foreground">feedback instan</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {feedback.tips.map((tip) => (
                      <li key={tip} className="flex gap-2 text-sm text-muted-foreground">
                        <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" onClick={next}>
                    {idx + 1 >= questions.length
                      ? "Selesai & lihat ringkasan"
                      : "Pertanyaan berikutnya"}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
