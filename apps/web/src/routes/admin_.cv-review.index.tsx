import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock4,
  FileSearch,
  Flame,
  Inbox,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Avatar,
  DeadlineChip,
  GradeBadge,
  MiniBar,
  Pill,
  StageBadge,
  StatCard,
  timeAgo,
} from "@/components/admin/cv-review/ui";
import { useAdmin } from "@/lib/cv-review/store";
import {
  ADMIN_NOW,
  STAFF,
  STAGES,
  activeCases,
  avgAgeHours,
  caseLoadOf,
  clientOf,
  countByGrade,
  countByStage,
  deadlineInfo,
  isOverdue,
  overrideRate,
} from "@/lib/cv-review/data";

export const Route = createFileRoute("/admin_/cv-review/")({
  component: CvReviewDashboard,
});

const KIND_ICON: Record<string, React.ReactNode> = {
  intake: <Inbox className="size-3.5" />,
  ai: <Bot className="size-3.5" />,
  assign: <Users className="size-3.5" />,
  stage: <Layers className="size-3.5" />,
  note: <FileSearch className="size-3.5" />,
  deliverable: <FileSearch className="size-3.5" />,
  publish: <CheckCircle2 className="size-3.5" />,
  client: <Users className="size-3.5" />,
  sla: <AlertTriangle className="size-3.5" />,
};

function CvReviewDashboard() {
  const state = useAdmin();
  const now = ADMIN_NOW;

  const cases = state.cases;
  const byStage = countByStage(cases);
  const byGrade = countByGrade(cases);
  const active = activeCases(cases);
  const overdue = active.filter((c) => isOverdue(c, now));
  const soon = active.filter((c) => deadlineInfo(c.dueAt, c.stage, now).tone === "soon");
  const needsAction = [...overdue, ...soon].sort((a, b) => a.dueAt - b.dueAt);
  const published = cases.filter((c) => c.stage === "published");
  const maxStage = Math.max(...STAGES.map((s) => byStage[s.key]), 1);
  const gradeTotal = Math.max(1, Object.values(byGrade).reduce((a, b) => a + b, 0));
  const maxLoad = Math.max(...STAFF.map((s) => caseLoadOf(cases, s.id).length), 1);

  const recentActivity = cases
    .flatMap((c) => c.activity.map((a) => ({ ...a, caseId: c.id, client: clientOf(c).name })))
    .sort((a, b) => b.at - a.at)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Kasus Aktif"
          value={active.length}
          hint={`${byStage.intake + byStage.triage} menunggu triage awal`}
          icon={<Flame className="size-4" />}
          tone="navy"
        />
        <StatCard
          label="Lewat SLA"
          value={overdue.length}
          hint={soon.length ? `+${soon.length} mepet deadline` : "tidak ada yang mepet"}
          icon={<AlertTriangle className="size-4" />}
          tone="danger"
        />
        <StatCard
          label="Terbit"
          value={published.length}
          hint={`${cases.filter((c) => c.stage === "revision").length} kasus sedang direvisi klien`}
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <StatCard
          label="Umur Rata-Rata Kasus"
          value={`${avgAgeHours(cases, now)} jam`}
          hint="dari submit sampai kondisi sekarang"
          icon={<Clock4 className="size-4" />}
          tone="warning"
        />
      </div>

      {/* Distribusi tahapan */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bricolage text-base font-bold text-text-main">Distribusi Tahapan</h2>
          <span className="font-manrope text-xs text-text-muted">
            akurasi klasifikasi AI — {100 - overrideRate(cases)}% diterima reviewer
          </span>
        </div>
        <div className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s) => {
            const count = byStage[s.key];
            return (
              <Link
                key={s.key}
                to="/admin/cv-review/pipeline"
                search={{ stage: s.key }}
                className="rounded-xl border border-gray-100 p-3 transition-all hover:border-brand-navy/30 hover:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <StageBadge stage={s.key} />
                  <span className="font-bricolage text-lg font-bold text-text-main">{count}</span>
                </div>
                <p className="mt-1 font-manrope text-[11px] text-text-muted">{s.hint}</p>
                <MiniBar value={(count / maxStage) * 100} className="mt-2" />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Perlu tindakan */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-brand-red" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Perlu Tindakan</h2>
          </div>
          {needsAction.length === 0 && (
            <p className="mt-4 font-manrope text-sm text-text-muted">
              Tidak ada kasus lewat atau mepet deadline. 🎉
            </p>
          )}
          <div className="mt-3 space-y-2">
            {needsAction.slice(0, 6).map((c) => {
              const client = clientOf(c);
              const info = deadlineInfo(c.dueAt, c.stage, now);
              const reviewer = STAFF.find((s) => s.id === c.assignee.reviewer);
              return (
                <Link
                  key={c.id}
                  to="/admin/cv-review/cases/$caseId"
                  params={{ caseId: c.id }}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-all hover:border-brand-red/40 hover:bg-brand-red/5"
                >
                  <Avatar name={client.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-manrope text-sm font-semibold text-text-main">
                      {client.name}
                      <span className="font-normal text-text-muted"> · {c.roleTarget}</span>
                    </p>
                    <p className="font-manrope text-xs text-text-muted">
                      {c.id} · {STAGES.find((s) => s.key === c.stage)?.short} ·{" "}
                      {reviewer ? reviewer.name.split(" ")[0] : "belum di-assign"}
                    </p>
                  </div>
                  <DeadlineChip info={info} />
                  <ArrowRight className="size-4 shrink-0 text-text-muted" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tipe CV */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand-orange" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Tipe CV Masuk</h2>
          </div>
          <div className="mt-4 space-y-4">
            {(["rusak", "lumayan", "bagus"] as const).map((g) => {
              const count = byGrade[g];
              const pct = (count / gradeTotal) * 100;
              return (
                <div key={g}>
                  <div className="flex items-center justify-between">
                    <GradeBadge grade={g} />
                    <span className="font-manrope text-xs font-semibold text-text-muted">
                      {count} kasus · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <MiniBar value={pct} className="mt-2 h-2" />
                </div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-muted p-3">
            <p className="font-manrope text-[11px] text-text-muted">
              <TrendingUp className="mr-1 inline size-3 text-emerald-600" />
              Estimasi beban penulisan:{" "}
              <b className="text-text-main">{Math.ceil(active.length * 2.4)} jam</b> untuk kasus aktif.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Beban tim */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Beban Tim</h2>
          </div>
          <div className="mt-3 space-y-3">
            {STAFF.map((s) => {
              const load = caseLoadOf(cases, s.id).length;
              const over = load > s.capacity;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <Avatar name={s.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-manrope text-sm font-medium text-text-main">
                        {s.name}
                        <span className="ml-1.5 text-xs text-text-muted">{s.title}</span>
                      </p>
                      <span
                        className={
                          over
                            ? "font-manrope text-xs font-bold text-brand-red"
                            : "font-manrope text-xs text-text-muted"
                        }
                      >
                        {load}/{s.capacity}
                      </span>
                    </div>
                    <MiniBar value={(load / Math.max(s.capacity, maxLoad)) * 100} tone={over ? "danger" : "navy"} className="mt-1.5 h-2" />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            to="/admin/cv-review/team"
            className="mt-4 inline-flex items-center gap-1 font-manrope text-xs font-semibold text-brand-navy hover:underline"
          >
            Lihat detail tim <ArrowRight className="size-3" />
          </Link>
        </div>

        {/* Aktivitas */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <Clock4 className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Aktivitas Terbaru</h2>
          </div>
          <div className="mt-3 space-y-1">
            {recentActivity.map((a) => (
              <Link
                key={a.id}
                to="/admin/cv-review/cases/$caseId"
                params={{ caseId: a.caseId }}
                className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
              >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-text-muted">
                  {KIND_ICON[a.kind] ?? <Layers className="size-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-manrope text-sm text-text-main">
                    <span className="font-semibold">{a.actor}</span> · {a.text}
                  </p>
                  <p className="font-manrope text-[11px] text-text-muted">
                    {a.caseId} · {a.client} · {timeAgo(a.at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="navy">Data contoh</Pill>
        <p className="font-manrope text-[11px] text-text-muted">
          Klasifikasi AI & dokumen produksi dibuat deterministik dari teks CV — siap diganti endpoint AI
          sungguhan.
        </p>
      </div>
    </div>
  );
}