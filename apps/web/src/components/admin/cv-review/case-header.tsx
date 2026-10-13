import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ChevronRight, Clock4, Users } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { Avatar, DeadlineChip, MiniBar, Pill, PriorityBadge, StageBadge } from "./ui";
import { adminStore } from "@/lib/cv-review/store";
import {
  ADMIN_NOW,
  PRIORITY,
  STAGES,
  clientOf,
  deadlineInfo,
  slaProgress,
  type CaseFile,
  type PriorityKey,
  type StageKey,
} from "@/lib/cv-review/data";
import { cn } from "@/lib/utils";

const PKG_SLA: Record<CaseFile["pkg"], string> = {
  express: "Express · 3 hari",
  standard: "Standard · 5 hari",
  intensive: "Intensive · 7 hari",
};

export function CaseHeader({ c }: { c: CaseFile }) {
  const client = clientOf(c);
  const info = deadlineInfo(c.dueAt, c.stage, ADMIN_NOW);
  const progress = slaProgress(c, ADMIN_NOW);
  const currentIdx = STAGES.findIndex((s) => s.key === c.stage);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <Link
        to="/admin/cv-review/pipeline"
        className="inline-flex items-center gap-1 font-manrope text-xs font-semibold text-text-muted transition-colors hover:text-brand-navy"
      >
        <ArrowLeft className="size-3.5" /> Kembali ke pipeline
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-bricolage text-xl font-bold text-text-main md:text-2xl">
                {client.name}
              </h1>
              <PriorityBadge priority={c.priority} />
              <StageBadge stage={c.stage} />
            </div>
            <p className="mt-0.5 font-manrope text-sm text-text-muted">
              {c.id} · {c.roleTarget} · {c.seniority} · ref {c.airtableRef}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={c.priority}
            onValueChange={(v) => adminStore.setPriority(c.id, v as PriorityKey)}
          >
            <SelectTrigger className="h-9 w-32 font-manrope text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRIORITY) as PriorityKey[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {PRIORITY[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link
            to="/admin/cv-review/pipeline"
            className="inline-flex h-9 items-center gap-1 rounded-xl bg-brand-navy px-4 font-manrope text-xs font-semibold text-white transition-colors hover:bg-brand-navy/90"
          >
            Pipeline <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 font-manrope text-xs text-text-muted">
          <Clock4 className="size-3.5" /> SLA {PKG_SLA[c.pkg]}
        </div>
        <div className="min-w-40 max-w-64 flex-1">
          <MiniBar
            value={progress}
            tone={info.tone === "late" ? "danger" : info.tone === "soon" ? "warning" : "success"}
            className="h-2"
            trackClassName={info.tone === "late" ? "bg-brand-red/10" : undefined}
          />
        </div>
        <DeadlineChip info={info} />
        <div className="flex items-center gap-1.5">
          <Users className="size-3.5 text-text-muted" />
          <span className="font-manrope text-xs text-text-muted">
            Terkirim {Math.max(1, Math.round((ADMIN_NOW - c.submittedAt) / 3_600_000))} jam lalu
          </span>
        </div>
        {info.tone === "late" && (
          <Pill tone="danger">
            <AlertTriangle className="size-3" /> Lewat deadline
          </Pill>
        )}
      </div>

      <div className="mt-5 flex items-start overflow-x-auto pb-1">
        {STAGES.map((s, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={s.key} className="flex items-center">
              <button
                onClick={() => adminStore.moveStage(c.id, s.key as StageKey)}
                className="group flex flex-col items-center gap-1"
                title={`Pindah ke ${s.label}`}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full font-manrope text-[11px] font-bold transition-all",
                    isCurrent
                      ? "scale-110 bg-brand-navy text-white shadow-md ring-4 ring-brand-navy/15"
                      : isDone
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-text-muted group-hover:bg-brand-soft",
                  )}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap font-manrope text-[10px]",
                    isCurrent ? "font-bold text-brand-navy" : "text-text-muted",
                  )}
                >
                  {s.short}
                </span>
              </button>
              {i < STAGES.length - 1 && (
                <div
                  className={cn(
                    "mx-1 mb-4 h-0.5 w-6 sm:w-10",
                    i < currentIdx ? "bg-emerald-300" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}