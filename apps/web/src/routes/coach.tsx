import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Eraser, Send, Sparkles, User } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { cn } from "@/lib/utils";
import { useDb } from "@/hooks/use-db";
import { useConfigValue } from "@/hooks/use-server-data";
import { db, defaultProfile, levelFromXp } from "@/lib/db";
import { coachReply, computeMatches, type CoachReply } from "@/lib/engine";
import { shareIntents } from "@/lib/share";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Career Coach — MULAI+" },
      {
        name: "description",
        content:
          "Tanya apa saja tentang kariermu — coach AI yang sudah membaca profil, CV, dan data pasar.",
      },
    ],
  }),
  component: CoachPage,
});

const STARTERS = [
  "Cara naikin skor CV-ku?",
  "Jalur karier yang cocok buatku?",
  "Gaji Product Manager berapa?",
  "Gimana persiapan interview?",
];

function CoachPage() {
  const state = useDb();
  const starters = useConfigValue<string[]>("coach.starters", STARTERS);
  const profile = state.profile ?? defaultProfile();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chips, setChips] = useState<CoachReply["chips"]>(
    STARTERS.map((label) => ({ label, to: "/coach" })),
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  const matches = computeMatches(profile);
  const top = matches[0];
  const latestAudit = state.audits[0];
  const ctx = {
    name: profile.name,
    role: profile.currentRole,
    interest: profile.interest,
    topPathTitle: top?.title ?? "",
    topPathMatch: top?.matchScore ?? 0,
    cvScore: latestAudit?.score ?? null,
    verifiedSkills: state.verifiedSkills.map((v) => v.skill),
    xp: state.xp,
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.coach.length, typing]);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || typing) return;
    db.addCoachMessage("user", text);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = coachReply(text, ctx);
      db.addCoachMessage("assistant", reply.text);
      setChips(reply.chips);
      setTyping(false);
    }, 700);
  };

  const transcript = state.coach
    .map((m) => `${m.role === "user" ? "👤" : "🤖"}: ${m.text}`)
    .join("\n\n");

  return (
    <AppShell>
      <PageHeader
        eyebrow="AI Career Coach"
        title="Coach karier yang sudah baca profilmu"
        description="Aku tahu skor CV-mu, jalur teratasmu, dan tren pasar Indonesia. Tanya apa saja."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={state.coach.length === 0}
              onClick={() => {
                const url = shareIntents.whatsapp(
                  `Percakapan career coach-ku:\n\n${transcript}\n\n— MULAI+ Career Compass`,
                );
                window.open(url, "_blank");
              }}
            >
              Kirim chat ke WhatsApp
            </Button>
            <Button
              variant="outline"
              disabled={state.coach.length === 0}
              onClick={() => {
                db.clearCoach();
                setChips(starters.map((label) => ({ label, to: "/coach" })));
              }}
            >
              <Eraser className="size-4" /> Mulai ulang
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <Card className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-5 py-3">
            <div className="grid size-9 place-items-center rounded-full bg-brand text-white">
              <Bot className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Coach MULAI+</p>
              <p className="text-xs text-muted-foreground">online · membaca pasar Indonesia</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {state.coach.length === 0 && (
              <div className="rounded-2xl bg-brand-soft/60 p-5 text-sm leading-relaxed">
                <p className="font-semibold">Halo {profile.name.split(" ")[0]}! 👋</p>
                <p className="mt-2 text-muted-foreground">
                  Aku sudah membaca profilmu ({profile.currentRole}, fokus {profile.interest}
                  {latestAudit ? `, skor CV ${latestAudit.score}` : ""}
                  {top ? `, jalur teratas: ${top.title} ${top.matchScore}%` : ""}). Tanya apa saja,
                  atau mulai dari salah satu di bawah:
                </p>
              </div>
            )}

            {state.coach.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                {m.role === "assistant" && (
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white">
                    <Bot className="size-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-md bg-brand text-brand-foreground"
                      : "rounded-bl-md border border-border bg-card",
                  )}
                >
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary">
                    <User className="size-4" />
                  </div>
                )}
              </div>
            ))}

            {typing && (
              <div className="flex gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                      style={{ animationDelay: `${d * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
              {chips.map((c) => (
                <button
                  key={c.label}
                  onClick={() => (c.to === "/coach" ? ask(c.label) : (window.location.href = c.to))}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-brand hover:bg-brand-soft"
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 border-t border-border p-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              placeholder="Tanya soal karier, gaji, skill, interview…"
              className="min-h-11 flex-1 resize-none"
              rows={1}
            />
            <Button
              className="shrink-0"
              disabled={!input.trim() || typing}
              onClick={() => ask(input)}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </Card>

        {/* Konteks */}
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Yang coach tahu tentangmu
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profil</span>
                <span className="font-medium">{profile.currentRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fokus</span>
                <span className="font-medium">{profile.interest}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skor CV</span>
                <span className="font-medium">
                  {latestAudit ? `${latestAudit.score}/100` : "belum audit"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jalur teratas</span>
                <span className="font-medium">
                  {top ? `${top.title} (${top.matchScore}%)` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skill terverifikasi</span>
                <span className="font-medium">{state.verifiedSkills.length || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Progresmu</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="font-display text-2xl font-bold">
                  Lv.{levelFromXp(state.xp)}{" "}
                  <span className="text-sm font-medium text-muted-foreground">· {state.xp} XP</span>
                </p>
                <p className="text-xs text-muted-foreground">🔥 streak {state.streak} hari</p>
              </div>
              <Sparkles className="size-6 text-brand" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Audit CV (+15 XP) · Quiz skill (+20 XP) · Item roadmap (+5 XP) · Lamaran dicatat (+5
              XP) · Interview (+10 XP)
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">
              Mulai cepat
            </p>
            <div className="mt-3 space-y-2">
              {[
                { label: "Audit CV ulang", to: "/cv-audit" },
                { label: "Lihat rekomendasi jalur", to: "/career" },
                { label: "Uji skill-mu", to: "/skills" },
                { label: "Latihan interview", to: "/interview" },
              ].map((l) => (
                <a
                  key={l.to}
                  href={l.to}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:border-brand hover:bg-brand-soft"
                >
                  {l.label}
                  <span className="text-brand">→</span>
                </a>
              ))}
            </div>
          </Card>

          <Badge variant="secondary" className="w-full justify-center py-2">
            <Sparkles className="size-3" /> Jawaban heuristic lokal — siap ditingkatkan ke AI
            sungguhan
          </Badge>
        </div>
      </div>
    </AppShell>
  );
}
