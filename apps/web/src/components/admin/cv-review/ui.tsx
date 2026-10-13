/* ============================================================
 * Blok UI bersama panel "Intensive CV Review" (ops internal).
 * Memakai token tema MULAI+ Career: brand-navy, brand-orange,
 * brand-red, font-bricolage/manrope.
 * ============================================================ */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DELIVERABLE_STATUS,
  GRADE_MAP,
  NOTE_SEVERITY,
  PACKAGES,
  PRIORITY,
  STAGE_MAP,
  initialsOf,
  relTime,
  type CasePackage,
  type CvGradeKey,
  type DeadlineInfo,
  type DeliverableStatus,
  type NoteSeverity,
  type PriorityKey,
  type StageKey,
} from "@/lib/cv-review/data";

export type Tone = "muted" | "navy" | "warning" | "danger" | "success";

type ToneClass = { chip: string; dot: string; bar: string; text: string };

export const TONE: Record<Tone, ToneClass> = {
  muted: {
    chip: "bg-muted text-text-muted",
    dot: "bg-gray-400",
    bar: "bg-gray-300",
    text: "text-text-muted",
  },
  navy: {
    chip: "bg-brand-navy/10 text-brand-navy",
    dot: "bg-brand-navy",
    bar: "bg-brand-navy",
    text: "text-brand-navy",
  },
  warning: {
    chip: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
    text: "text-amber-700",
  },
  danger: {
    chip: "bg-brand-red/10 text-brand-red",
    dot: "bg-brand-red",
    bar: "bg-brand-red",
    text: "text-brand-red",
  },
  success: {
    chip: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    text: "text-emerald-700",
  },
};

export function stageTone(stage: StageKey): Tone {
  switch (STAGE_MAP[stage].tone) {
    case "brand":
      return "navy";
    case "coral":
      return "warning";
    case "warning":
      return "warning";
    case "success":
      return "success";
    default:
      return "muted";
  }
}

export function gradeTone(g: CvGradeKey): Tone {
  const t = GRADE_MAP[g].tone;
  if (t === "destructive") return "danger";
  if (t === "warning") return "warning";
  return "success";
}

/* ---------------------------- Badge ---------------------------- */

export function Pill({
  tone = "muted",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 font-manrope text-[11px] font-semibold",
        TONE[tone].chip,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: StageKey }) {
  return <Pill tone={stageTone(stage)}>{STAGE_MAP[stage].short}</Pill>;
}

export function GradeBadge({ grade, className }: { grade: CvGradeKey; className?: string }) {
  return (
    <Pill tone={gradeTone(grade)} className={className}>
      <span className="size-1.5 rounded-full bg-current" />
      {GRADE_MAP[grade].label}
    </Pill>
  );
}

export function PriorityBadge({ priority }: { priority: PriorityKey }) {
  const tone: Tone =
    priority === "urgent" ? "danger" : priority === "high" ? "warning" : "muted";
  return <Pill tone={tone}>{PRIORITY[priority].label}</Pill>;
}

export function SeverityBadge({ severity }: { severity: NoteSeverity }) {
  const tone: Tone =
    severity === "blocker"
      ? "danger"
      : severity === "major"
        ? "warning"
        : severity === "praise"
          ? "success"
          : "muted";
  return <Pill tone={tone}>{NOTE_SEVERITY[severity].label}</Pill>;
}

export function DeliverableStatusBadge({ status }: { status: DeliverableStatus }) {
  const t = DELIVERABLE_STATUS[status].tone;
  const tone: Tone = t === "success" ? "success" : t === "warning" || t === "coral" ? "warning" : "muted";
  return <Pill tone={tone}>{DELIVERABLE_STATUS[status].label}</Pill>;
}

export function DeadlineChip({ info }: { info: DeadlineInfo }) {
  const tone: Tone =
    info.tone === "late" ? "danger" : info.tone === "soon" ? "warning" : info.tone === "done" ? "success" : "muted";
  return (
    <Pill tone={tone}>
      {info.tone === "late" ? "⏰ " : info.tone === "soon" ? "🕐 " : ""}
      {info.label}
    </Pill>
  );
}

export function PackageBadge({ pkg }: { pkg: CasePackage }) {
  const tone: Tone = pkg === "intensive" ? "navy" : pkg === "express" ? "warning" : "muted";
  return <Pill tone={tone}>{PACKAGES[pkg].label}</Pill>;
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const c = size === "lg" ? "size-10 text-sm" : size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs";
  return (
    <span
      title={name ?? undefined}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-brand-soft font-manrope font-bold text-brand-navy ring-1 ring-black/5",
        c,
        className,
      )}
    >
      {name ? initialsOf(name) : "?"}
    </span>
  );
}

/* ------------------------ Layout & stats ------------------------ */

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="font-manrope text-xs font-semibold tracking-widest text-brand-orange uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-bricolage text-2xl font-bold text-text-main md:text-3xl">{title}</h1>
        {description && <p className="mt-2 font-manrope text-sm text-text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "navy",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-manrope text-xs font-semibold tracking-wider text-text-muted uppercase">{label}</p>
        {icon && <span className={cn("grid size-8 place-items-center rounded-lg", TONE[tone].chip)}>{icon}</span>}
      </div>
      <p className="mt-1 font-bricolage text-2xl font-bold text-text-main md:text-3xl">{value}</p>
      {hint && <p className="mt-0.5 font-manrope text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function MiniBar({
  value,
  tone = "navy",
  className,
  trackClassName,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  trackClassName?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", trackClassName)}>
      <div
        className={cn("h-full rounded-full transition-all", TONE[tone].bar, className)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ScoreRing({
  score,
  size = 112,
  tone = "navy",
  label,
}: {
  score: number;
  size?: number;
  tone?: Tone;
  label?: string;
}) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0f6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={cn("transition-all duration-500", TONE[tone].text)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div
            className={cn("font-bricolage font-bold", TONE[tone].text)}
            style={{ fontSize: size / 4.5 }}
          >
            {score}
          </div>
          {label && <div className="font-manrope text-[9px] text-text-muted">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <p className="font-manrope text-sm font-semibold text-text-main">{title}</p>
      {hint && <p className="font-manrope text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function timeAgo(at: number) {
  return relTime(at);
}