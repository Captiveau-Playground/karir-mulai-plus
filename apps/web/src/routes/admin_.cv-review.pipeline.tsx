import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, GripVertical, LayoutGrid, List, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@karir-mulai-plus/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import {
  Avatar,
  DeadlineChip,
  GradeBadge,
  PackageBadge,
  Pill,
  PriorityBadge,
  StageBadge,
} from "@/components/admin/cv-review/ui";
import { adminStore, useAdmin } from "@/lib/cv-review/store";
import {
  ADMIN_NOW,
  DELIVERABLE_DEFS,
  PRIORITY,
  STAGES,
  clientOf,
  countByStage,
  deadlineInfo,
  searchCases,
  type CaseFile,
  type CvGradeKey,
  type PriorityKey,
  type StageKey,
} from "@/lib/cv-review/data";

type PipelineSearch = { stage?: StageKey };

export const Route = createFileRoute("/admin_/cv-review/pipeline")({
  validateSearch: (s: Record<string, unknown>): PipelineSearch => {
    const stage =
      typeof s.stage === "string" && STAGES.some((x) => x.key === s.stage)
        ? (s.stage as StageKey)
        : undefined;
    return stage ? { stage } : {};
  },
  component: CvReviewPipeline,
});

function CvReviewPipeline() {
  const state = useAdmin();
  const search = Route.useSearch();

  const [view, setView] = useState<"board" | "table">("board");
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState<CvGradeKey | "all">("all");
  const [priority, setPriority] = useState<PriorityKey | "all">("all");
  const [assignee, setAssignee] = useState<string>("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<StageKey | null>(null);

  const stageFilter = search.stage ?? "all";

  const filtered = useMemo(() => {
    let list = searchCases(state.cases, q);
    if (stageFilter !== "all") list = list.filter((c) => c.stage === stageFilter);
    if (grade !== "all") list = list.filter((c) => c.classification?.grade === grade);
    if (priority !== "all") list = list.filter((c) => c.priority === priority);
    if (assignee !== "all")
      list = list.filter(
        (c) =>
          c.assignee.reviewer === assignee ||
          c.assignee.writer === assignee ||
          c.assignee.qa === assignee,
      );
    return list;
  }, [state.cases, q, stageFilter, grade, priority, assignee]);

  const byStage = countByStage(filtered);
  const dirty = q !== "" || grade !== "all" || priority !== "all" || assignee !== "all";

  const drop = (stage: StageKey) => {
    if (dragId) adminStore.moveStage(dragId, stage);
    setDragId(null);
    setOverStage(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama klien, ID kasus, role target, tag…"
            className="pl-9 font-manrope text-sm"
          />
        </div>
        <Select value={grade} onValueChange={(v) => setGrade(v as CvGradeKey | "all")}>
          <SelectTrigger className="w-36 font-manrope text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua tipe</SelectItem>
            <SelectItem value="rusak">Rusak</SelectItem>
            <SelectItem value="lumayan">Lumayan</SelectItem>
            <SelectItem value="bagus">Bagus</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={(v) => setPriority(v as PriorityKey | "all")}>
          <SelectTrigger className="w-32 font-manrope text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Prioritas</SelectItem>
            {(Object.keys(PRIORITY) as PriorityKey[]).map((k) => (
              <SelectItem key={k} value={k}>
                {PRIORITY[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="w-40 font-manrope text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua assignee</SelectItem>
            {state.staff.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dirty && (
          <button
            onClick={() => {
              setQ("");
              setGrade("all");
              setPriority("all");
              setAssignee("all");
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 font-manrope text-xs font-semibold text-text-muted transition-colors hover:text-brand-red"
          >
            <X className="size-3.5" /> Reset
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Pill tone="muted">{filtered.length} kasus</Pill>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1">
            <button
              onClick={() => setView("board")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-manrope text-xs font-semibold transition-colors ${
                view === "board" ? "bg-brand-navy text-white" : "text-text-muted"
              }`}
            >
              <LayoutGrid className="size-3.5" /> Papan
            </button>
            <button
              onClick={() => setView("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-manrope text-xs font-semibold transition-colors ${
                view === "table" ? "bg-brand-navy text-white" : "text-text-muted"
              }`}
            >
              <List className="size-3.5" /> Tabel
            </button>
          </div>
        </div>
      </div>

      {stageFilter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="font-manrope text-xs text-text-muted">
            Filter tahap aktif:
          </span>
          <StageBadge stage={stageFilter} />
          <Link
            to="/admin/cv-review/pipeline"
            className="font-manrope text-xs font-semibold text-brand-navy hover:underline"
          >
            hapus filter
          </Link>
        </div>
      )}

      {view === "board" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((s) => {
            const list = filtered.filter((c) => c.stage === s.key);
            const highlight = overStage === s.key;
            return (
              <div
                key={s.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStage(s.key);
                }}
                onDragLeave={() => setOverStage((p) => (p === s.key ? null : p))}
                onDrop={() => drop(s.key)}
                className={`flex min-h-40 flex-col rounded-2xl border bg-white/70 p-3 transition-all ${
                  highlight ? "border-brand-navy bg-brand-navy/5" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <StageBadge stage={s.key} />
                    <span className="font-manrope text-[11px] text-text-muted">{s.hint}</span>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-bricolage text-xs font-bold text-text-main">
                    {byStage[s.key]}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {list.map((c) => (
                    <CaseCard
                      key={c.id}
                      c={c}
                      onDragStart={() => setDragId(c.id)}
                      onDragEnd={() => setDragId(null)}
                    />
                  ))}
                  {list.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 px-3 py-6 text-center font-manrope text-[11px] text-text-muted">
                      Tidak ada kasus
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-muted">
                  {["Kasus", "Role", "Tipe CV", "Tahap", "Prioritas", "Deadline", "Paket", "Assignee"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left font-manrope text-[11px] font-semibold tracking-wider text-text-muted uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <TableRow key={c.id} c={c} />
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center font-manrope text-sm text-text-muted">
              Tidak ada kasus yang cocok dengan filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CaseCard({
  c,
  onDragStart,
  onDragEnd,
}: {
  c: CaseFile;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const client = clientOf(c);
  const info = deadlineInfo(c.dueAt, c.stage, ADMIN_NOW);
  const next = c.stage === "published" ? null : nextStageOf(c.stage);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group relative cursor-grab rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-brand-navy/30 hover:shadow active:cursor-grabbing"
    >
      <div
        className={`absolute top-0 right-3 left-3 h-0.5 rounded-full ${
          c.priority === "urgent"
            ? "bg-brand-red"
            : c.priority === "high"
              ? "bg-brand-orange"
              : "bg-gray-200"
        }`}
      />
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/admin/cv-review/cases/$caseId"
          params={{ caseId: c.id }}
          className="min-w-0"
        >
          <p className="font-manrope text-sm font-bold text-text-main group-hover:underline">
            {client.name}
          </p>
          <p className="truncate font-manrope text-[11px] text-text-muted">
            {c.id} · {c.roleTarget}
          </p>
        </Link>
        <GripVertical className="size-4 shrink-0 cursor-grab text-gray-300" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {c.classification ? (
          <GradeBadge grade={c.classification.grade} />
        ) : (
          <Pill tone="muted">Belum diklasifikasi</Pill>
        )}
        <PriorityBadge priority={c.priority} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <PackageBadge pkg={c.pkg} />
        <DeadlineChip info={info} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          <AssigneeAvatars c={c} />
        </div>
        <ProgressDots c={c} />
      </div>
      {next && (
        <button
          onClick={() => adminStore.moveStage(c.id, next)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-1.5 font-manrope text-[11px] font-semibold text-brand-navy transition-colors hover:border-brand-navy/40 hover:bg-brand-navy/5"
        >
          Lanjut ke {STAGES.find((s) => s.key === next)?.short}
          <ArrowRight className="size-3" />
        </button>
      )}
    </div>
  );
}

function AssigneeAvatars({ c }: { c: CaseFile }) {
  const state = useAdmin();
  const ids = [c.assignee.reviewer, c.assignee.writer, c.assignee.qa].filter(Boolean) as string[];
  if (!ids.length)
    return <span className="font-manrope text-[10px] text-text-muted">belum ada assignee</span>;
  return (
    <>
      {ids.map((id) => (
        <Avatar
          key={id}
          name={state.staff.find((s) => s.id === id)?.name}
          size="sm"
          className="ring-2 ring-white"
        />
      ))}
    </>
  );
}

function ProgressDots({ c }: { c: CaseFile }) {
  const enabled = DELIVERABLE_DEFS.filter((d) => c.pkg !== "express" || d.lang === "id");
  const done = enabled.filter((d) => {
    const st = c.deliverables[d.key].status;
    return st === "published" || st === "approved";
  }).length;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5" title="Progress deliverable">
        {enabled.map((d) => {
          const st = c.deliverables[d.key].status;
          return (
            <span
              key={d.key}
              className={`size-1.5 rounded-full ${
                st === "published"
                  ? "bg-emerald-500"
                  : st === "approved" || st === "review"
                    ? "bg-brand-orange"
                    : st === "drafting"
                      ? "bg-brand-navy"
                      : "bg-gray-200"
              }`}
            />
          );
        })}
      </div>
      <span className="font-manrope text-[10px] text-text-muted">
        {done}/{enabled.length}
      </span>
    </div>
  );
}

function TableRow({ c }: { c: CaseFile }) {
  const client = clientOf(c);
  const info = deadlineInfo(c.dueAt, c.stage, ADMIN_NOW);
  return (
    <tr className="transition-colors hover:bg-muted/60">
      <td className="px-3 py-2.5">
        <Link
          to="/admin/cv-review/cases/$caseId"
          params={{ caseId: c.id }}
          className="flex items-center gap-2"
        >
          <Avatar name={client.name} size="sm" />
          <div>
            <p className="font-manrope text-sm font-semibold text-text-main">{client.name}</p>
            <p className="font-manrope text-[11px] text-text-muted">{c.id}</p>
          </div>
        </Link>
      </td>
      <td className="px-3 py-2.5 font-manrope text-sm text-text-main">{c.roleTarget}</td>
      <td className="px-3 py-2.5">
        {c.classification ? <GradeBadge grade={c.classification.grade} /> : <Pill tone="muted">—</Pill>}
      </td>
      <td className="px-3 py-2.5">
        <Select value={c.stage} onValueChange={(v) => adminStore.moveStage(c.id, v as StageKey)}>
          <SelectTrigger className="h-8 w-32 font-manrope text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.short}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2.5">
        <PriorityBadge priority={c.priority} />
      </td>
      <td className="px-3 py-2.5">
        <DeadlineChip info={info} />
      </td>
      <td className="px-3 py-2.5">
        <PackageBadge pkg={c.pkg} />
      </td>
      <td className="px-3 py-2.5">
        <AssigneeAvatars c={c} />
      </td>
    </tr>
  );
}

function nextStageOf(stage: StageKey): StageKey | null {
  const i = STAGES.findIndex((s) => s.key === stage);
  if (i < 0 || i >= STAGES.length - 1) return null;
  return STAGES[i + 1]?.key ?? null;
}