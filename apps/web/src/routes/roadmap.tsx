import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, CheckCircle2, Map, Trophy } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { Progress } from "@karir-mulai-plus/ui/components/progress";
import { useDb } from "@/hooks/use-db";
import { db, levelFromXp } from "@/lib/db";
import { ROADMAP_WEEKS } from "@/lib/engine";
import { careerPaths } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap Karier — MULAI+" },
      {
        name: "description",
        content: "Checklist mingguan untuk menutup skill gap dan mencapai jalur karier impianmu.",
      },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  const state = useDb();
  const [activePath, setActivePath] = useState<string | null>(null);

  const saved = careerPaths.filter((p) => state.roadmap.includes(p.pathId));
  const pathId = activePath ?? saved[0]?.pathId ?? null;
  const path = pathId ? careerPaths.find((p) => p.pathId === pathId) : undefined;

  if (saved.length === 0) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Career OS · Roadmap"
          title="Roadmap mingguanmu"
          description="Simpan jalur karier di halaman Career, lalu kerjakan checklist mingguannya — tiap langkah memberi XP."
        />
        <Card className="p-12 text-center">
          <Map className="mx-auto size-10 text-brand" />
          <h2 className="mt-4 font-display text-xl font-semibold">Belum ada jalur tersimpan</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Lihat rekomendasi jalur kariermu, lalu simpan 1-2 jalur teratas ke roadmap.
          </p>
          <Link
            to="/career"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-coral-foreground"
          >
            Lihat rekomendasi jalur <ArrowRight className="size-4" />
          </Link>
        </Card>
      </AppShell>
    );
  }

  const items =
    pathId == null
      ? []
      : (state.roadmapProgress[pathId] ??
        ROADMAP_WEEKS[pathId]?.map((label) => ({ label, done: false })) ??
        []);
  const doneCount = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
  const completed = pathId != null && state.pathsCompleted.includes(pathId);
  const totalItems = saved.reduce((acc, p) => acc + (ROADMAP_WEEKS[p.pathId]?.length ?? 0), 0);
  const totalDone = saved.reduce(
    (acc, p) => acc + (state.roadmapProgress[p.pathId]?.filter((i) => i.done).length ?? 0),
    0,
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Career OS · Roadmap"
        title="Langkah minggu ini, arah 6 bulan ke depan"
        description="Checklist praktis untuk menutup skill gap. Tiap item selesai = +5 XP, jalur tuntas = +30 XP."
        action={
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5">
            <Trophy className="size-5 text-warning" />
            <div>
              <p className="font-display text-lg font-bold leading-none">
                Lv.{levelFromXp(state.xp)} · {state.xp} XP
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                🔥 streak {state.streak} hari
              </p>
            </div>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Jalur disimpan</p>
          <p className="font-display text-2xl font-bold">{saved.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Langkah selesai</p>
          <p className="font-display text-2xl font-bold">
            {totalDone}/{totalItems}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Jalur tuntas</p>
          <p className="font-display text-2xl font-bold">{state.pathsCompleted.length}</p>
        </Card>
      </div>

      {saved.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {saved.map((p) => {
            const d = state.roadmapProgress[p.pathId]?.filter((i) => i.done).length ?? 0;
            const t = ROADMAP_WEEKS[p.pathId]?.length ?? 0;
            return (
              <button
                key={p.pathId}
                onClick={() => setActivePath(p.pathId)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors",
                  pathId === p.pathId
                    ? "border-brand bg-brand-soft font-semibold"
                    : "border-border hover:bg-secondary",
                )}
              >
                {p.title}
                <span className="text-xs text-muted-foreground">
                  {d}/{t}
                </span>
                {state.pathsCompleted.includes(p.pathId) && (
                  <CheckCircle2 className="size-4 text-success" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {pathId != null && path && (
        <Card className="overflow-hidden">
          <div className="border-b border-border bg-muted/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold">{path.title}</p>
                <p className="text-sm text-muted-foreground">
                  {path.marketGrowth} · {path.salaryRange}
                </p>
              </div>
              {completed && (
                <Badge className="bg-success/15 text-success">
                  <Trophy className="size-3.5" /> Jalur tuntas — +30 XP
                </Badge>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Progress
                value={pct}
                className="h-2 flex-1"
                indicatorClassName="bg-gradient-to-r from-brand to-coral"
              />
              <span className="text-xs font-semibold">{pct}%</span>
            </div>
          </div>

          <div className="p-5">
            <div className="grid gap-2.5 md:grid-cols-2">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    if (pathId != null) {
                      db.toggleRoadmapItem(pathId, item.label);
                      if (!item.done) toast.success("Langkah selesai — +5 XP ⚡");
                    }
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 text-left text-sm transition-colors",
                    item.done
                      ? "border-success/40 bg-success/[0.06]"
                      : "border-border hover:border-brand hover:bg-brand-soft/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                      item.done ? "border-success bg-success text-white" : "border-border",
                    )}
                  >
                    {item.done && <Check className="size-3.5" />}
                  </span>
                  <span className={cn(item.done && "text-muted-foreground line-through")}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/career"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold card-hover"
        >
          Atur jalur lain <ArrowRight className="size-4" />
        </Link>
        <Link
          to="/mentors"
          className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-3 text-sm font-semibold text-coral-foreground card-hover"
        >
          Temukan mentor untuk jalur ini
        </Link>
      </div>
    </AppShell>
  );
}
