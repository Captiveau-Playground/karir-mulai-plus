import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowRight,
  Award,
  Bot,
  CalendarDays,
  Check,
  FileSearch,
  Flame,
  History,
  KanbanSquare,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Progress } from "@karir-mulai-plus/ui/components/progress";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { cn } from "@/lib/utils";
import { useDb } from "@/hooks/use-db";
import { db, defaultProfile, levelFromXp, type AppState } from "@/lib/db";
import { computeMatches } from "@/lib/engine";
import { LEADERBOARD_MOCK, OUTCOME_REPORTS } from "@/lib/engine";
import { skillSignals } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MULAI+" },
      {
        name: "description",
        content: "Dashboard pribadi MULAI+: skor CV, jalur karier, dan langkah berikutnya.",
      },
    ],
  }),
  component: Dashboard,
});

const QUESTS = [
  {
    key: "audit",
    label: "Audit CV (teks/upload)",
    check: (s: AppState) => s.audits.some((a) => sameDay(a.at)),
  },
  {
    key: "quiz",
    label: "Selesaikan 1 quiz skill",
    check: (s: AppState) => s.verifiedSkills.some((v) => sameDay(v.at)),
  },
  {
    key: "lamaran",
    label: "Catat 1 lamaran",
    check: (s: AppState) => s.applications.some((a) => sameDay(a.at)),
  },
  {
    key: "coach",
    label: "Tanya coach AI",
    check: (s: AppState) => s.coach.some((m) => m.role === "user" && sameDay(m.at)),
  },
];

const sameDay = (ts: number) =>
  new Date(ts).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);

function isQuestDone(key: string, state: AppState) {
  const q = QUESTS.find((x) => x.key === key);
  if (q?.check(state)) return true;
  return (
    state.questLog.done.includes(key) &&
    state.questLog.date === new Date().toISOString().slice(0, 10)
  );
}

function timeAgo(ts: number) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.round(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.round(s / 3600)} jam lalu`;
  return `${Math.round(s / 86400)} hari lalu`;
}

function Dashboard() {
  const state = useDb();
  const profile = state.profile ?? defaultProfile();

  const matches = computeMatches(profile);
  const topPath = matches[0];
  const latestAudit = state.audits[0];
  const upcomingBookings = state.bookings.filter((b) => b.status === "booked");
  const demandSkills = skillSignals.slice(0, 4);
  const firstName = profile.name.split(" ")[0];

  const needsOnboarding = !state.profile;

  const shareText = latestAudit
    ? `Skor CV saya ${latestAudit.score}/100 💪 Cek skor CV kamu gratis di MULAI+ Career Compass!`
    : "Cek skor CV kamu gratis di MULAI+ Career Compass 🚀";

  return (
    <AppShell>
      <section className="mb-8 overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-12">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold">
          <Sparkles className="size-3.5" /> Karier kamu, dibaca lewat data
        </p>
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          {needsOnboarding ? "Siap mulai?" : `Halo, ${firstName} 👋`}
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {needsOnboarding
            ? "Lengkapi profil 60 detik dan dapatkan rekomendasi yang benar-benar untuk kamu."
            : `Berdasarkan profil, asesmen, dan sinyal pasar kerja, ini langkah paling berdampak untuk minggu ini.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {needsOnboarding ? (
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-coral-foreground card-hover"
            >
              Mulai onboarding <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/cv-audit"
                className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-coral-foreground card-hover"
              >
                {latestAudit ? "Audit ulang CV" : "Mulai CV Audit"}{" "}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/career"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold card-hover"
              >
                Lihat rekomendasi karier
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="mb-10 grid gap-5 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-secondary font-display text-lg font-bold">
              {profile.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-sm text-muted-foreground">
                {profile.currentRole} · {profile.yearsExp} thn
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">
              <Sparkles className="mr-1 size-3 text-brand" /> Lv.{levelFromXp(state.xp)} ·{" "}
              {state.xp} XP
            </Badge>
            <Badge variant="secondary">🔥 {state.streak} hari streak</Badge>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Skor CV terakhir</span>
              {latestAudit ? (
                <span className="font-semibold">{latestAudit.score}/100</span>
              ) : (
                <span className="text-xs text-muted-foreground">Belum ada audit</span>
              )}
            </div>
            <Progress value={latestAudit?.score ?? 0} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="secondary">RIASEC · {profile.riasec}</Badge>
            <Badge variant="secondary">{profile.interest}</Badge>
          </div>
          <div className="mt-5 space-y-2 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Skill
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => {
                const verified = state.verifiedSkills.find(
                  (v) => v.skill.toLowerCase() === s.toLowerCase(),
                );
                return (
                  <span
                    key={s}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      verified && verified.score >= 70 ? "bg-success/15 text-success" : "bg-muted"
                    }`}
                  >
                    {verified && verified.score >= 70 ? "🏅 " : ""}
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Jalur teratas
          </p>
          {topPath ? (
            <>
              <p className="mt-2 font-display text-2xl font-bold">{topPath.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {topPath.matchScore}% match dengan profil kamu
              </p>
              <Progress className="mt-4" value={topPath.matchScore} />
              <p className="mt-4 text-sm text-muted-foreground">{topPath.summary}</p>
              <Link
                to="/career"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
              >
                Lihat detail jalur <ArrowRight className="size-4" />
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Lengkapi onboarding untuk melihat jalur kariermu.
            </p>
          )}
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Skill paling dicari untuk bidangmu
          </p>
          <ul className="mt-4 space-y-3">
            {demandSkills.map((s) => (
              <li key={s.skill} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{s.skill}</span>
                <span className="inline-flex items-center gap-1 text-success">
                  <TrendingUp className="size-3.5" />
                  {s.trend}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to="/market"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Semua sinyal pasar <ArrowRight className="size-4" />
          </Link>
        </Card>
      </div>

      <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            to: "/cv-audit" as const,
            title: "CV Audit",
            desc: "Skor + perbaikan yang bisa langsung dipakai.",
            icon: FileSearch,
            tone: "coral" as const,
          },
          {
            to: "/coach" as const,
            title: "AI Coach",
            desc: "Tanya apa saja soal kariermu — sudah baca profilmu.",
            icon: Bot,
            tone: "brand" as const,
          },
          {
            to: "/tracker" as const,
            title: "Tracker Lamaran",
            desc: "Lacak lamaran dari draft sampai offer.",
            icon: KanbanSquare,
            tone: "brand" as const,
          },
          {
            to: "/skills" as const,
            title: "Skill Quiz",
            desc: "Buktikan skill, dapatkan badge terverifikasi.",
            icon: Award,
            tone: "coral" as const,
          },
        ].map((f) => (
          <Link key={f.to} to={f.to}>
            <Card className="h-full p-6 card-hover">
              <div
                className={
                  f.tone === "coral"
                    ? "grid size-11 place-items-center rounded-2xl bg-coral-soft text-coral"
                    : "grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand"
                }
              >
                <f.icon className="size-5" />
              </div>
              <h2 className="mt-4 font-display text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                Buka <ArrowRight className="size-4" />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mb-10 grid gap-5 lg:grid-cols-3">
        {/* Quest harian */}
        <Card className="p-6">
          <p className="flex items-center gap-2 font-display text-base font-semibold">
            <Target className="size-4 text-coral" /> Quest harian
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Selesaikan 4 quest, +30 XP bonus.</p>
          <div className="mt-4 space-y-2.5">
            {QUESTS.map((q) => {
              const done = isQuestDone(q.key, state);
              return (
                <button
                  key={q.key}
                  disabled={done}
                  onClick={() => {
                    const res = db.completeQuest(q.key);
                    if (res === "all")
                      toast.success("Semua quest selesai! 🎉", { description: "+30 XP bonus" });
                    else if (res === "repeat") return;
                    else toast.success(`Quest: ${q.label}`, { description: "+10 XP" });
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                    done
                      ? "border-success/40 bg-success/[0.06] text-muted-foreground"
                      : "border-border hover:border-brand hover:bg-brand-soft/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-md border",
                      done ? "border-success bg-success text-white" : "border-border",
                    )}
                  >
                    {done && <Check className="size-3.5" />}
                  </span>
                  <span className="flex-1">{q.label}</span>
                  {!done && <span className="text-xs font-semibold text-brand">+10 XP</span>}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Aktivitas terakhir */}
        <Card className="p-6">
          <p className="font-display text-base font-semibold">Aktivitas terakhirmu</p>
          {state.activity.length > 0 ? (
            <ul className="mt-4 space-y-2.5">
              {state.activity.slice(0, 7).map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <History className="mt-0.5 size-3.5 shrink-0 text-brand" />
                  <span className="flex-1">{a.label}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {timeAgo(a.at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Belum ada aktivitas. Mulai dari audit CV atau quiz skill!
            </p>
          )}
        </Card>

        <Card className="p-6">
          <p className="font-display text-base font-semibold">Bagikan skor CV-mu</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Undang teman dengan kartu skor — setiap teman yang masuk membuka akses premium untukmu.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={!latestAudit}
              onClick={() => {
                const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + window.location.origin + "/?ref=" + state.referralCode)}`;
                window.open(url, "_blank");
              }}
            >
              Bagikan ke WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard
                  ?.writeText(`${window.location.origin}/?ref=${state.referralCode}`)
                  .then(() =>
                    toast.success("Link referral disalin", {
                      description: "Kode kamu: " + state.referralCode,
                    }),
                  );
              }}
            >
              Salin link
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {latestAudit
              ? `Skor terakhirmu: ${latestAudit.score}/100`
              : "Audit CV dulu untuk membuat kartu skor."}
          </p>
        </Card>

        <Card className="p-6">
          <p className="font-display text-base font-semibold">Sesi mentor mendatang</p>
          {upcomingBookings.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {upcomingBookings.slice(0, 2).map((b) => (
                <li key={b.id} className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm">
                  <CalendarDays className="size-4 shrink-0 text-brand" />
                  <div>
                    <p className="font-medium">{b.mentorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.date} · {b.slot} WIB
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Belum ada booking. Cari mentor untuk jalurmu.
            </p>
          )}
          <Link
            to="/mentors"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Cari mentor <ArrowRight className="size-4" />
          </Link>
        </Card>

        <Card className="p-6">
          <p className="font-display text-base font-semibold">Market Digest mingguan</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Skill & role yang sedang naik di bidangmu, dikirim tiap Senin pagi.
          </p>
          <div className="mt-4 flex gap-2">
            <Input placeholder="email kamu" disabled={state.digest} />
            <Button
              size="sm"
              disabled={state.digest}
              onClick={() => {
                db.setDigest(true);
                toast.success("Berlangganan digest aktif", {
                  description: "Email pertama Senin depan.",
                });
              }}
            >
              {state.digest ? "Aktif ✓" : "Subscribe"}
            </Button>
          </div>
          {!state.premium && !state.referralBonus && (
            <div className="mt-4 rounded-xl bg-brand-soft p-3 text-xs">
              <span className="font-semibold">MULAI+ Premium</span> — buka semua rewrite CV,
              perbandingan jalur penuh, dan akses mentor prioritas.
              <Button
                size="sm"
                className="ml-2"
                onClick={() => {
                  db.setPremium(true);
                  toast.success("Premium aktif 🎉");
                }}
              >
                Coba gratis
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="mb-10 grid gap-5 lg:grid-cols-3">
        {/* Apa yang berhasil (data moat) */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
            <Trophy className="size-5 text-warning" /> Apa yang berhasil (dari data 1.200+ lamaran)
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {OUTCOME_REPORTS.map((r) => (
              <Card key={r.title} className="p-5">
                <p className="font-display text-3xl font-bold text-brand">{r.stat}</p>
                <p className="mt-1 text-sm font-semibold leading-snug">{r.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Leaderboard kampus */}
        <Card className="p-5">
          <p className="flex items-center gap-2 font-display text-base font-semibold">
            <Flame className="size-4 text-coral" /> Leaderboard kampus
          </p>
          <ul className="mt-4 space-y-2.5">
            {LEADERBOARD_MOCK.map((u, i) => (
              <li key={u.name} className="flex items-center gap-3 text-sm">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-md text-xs font-bold ${
                    i === 0 ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-medium">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.campus}</span>
                <span className="ml-auto text-xs font-semibold">{u.xp} XP</span>
                <span className="text-[11px] text-muted-foreground">🔥{u.streak}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
            Kamu:{" "}
            <span className="font-semibold text-foreground">
              Lv.{levelFromXp(state.xp)} · {state.xp} XP
            </span>{" "}
            — raih streak dan XP lewat audit, quiz, roadmap, dan lamaran.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Lamaran dicatat",
            value: String(state.applications.length),
            to: "/tracker" as const,
          },
          {
            label: "Skill terverifikasi",
            value: String(state.verifiedSkills.filter((v) => v.score >= 70).length),
            to: "/skills" as const,
          },
          {
            label: "Jalur di roadmap",
            value: String(state.roadmap.length),
            to: "/roadmap" as const,
          },
          {
            label: "Booking mentor",
            value: String(state.bookings.length),
            to: "/mentors" as const,
          },
        ].map((s) => (
          <Link key={s.label} to={s.to}>
            <Card className="p-5 card-hover">
              <p className="font-display text-3xl font-bold">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
