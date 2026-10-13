import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Inbox, UserCog } from "lucide-react";

import { Avatar, MiniBar, Pill, PriorityBadge, StageBadge } from "@/components/admin/cv-review/ui";
import { useAdmin } from "@/lib/cv-review/store";
import {
  ADMIN_NOW,
  STAGES,
  caseLoadOf,
  clientOf,
  deadlineInfo,
  unassignedCases,
  type CaseFile,
  type Staff,
} from "@/lib/cv-review/data";

export const Route = createFileRoute("/admin_/cv-review/team")({
  component: CvReviewTeam,
});

const ROLE_LABEL: Record<Staff["role"], string> = {
  reviewer: "Reviewer",
  writer: "Writer",
  qa: "QA",
};

function CvReviewTeam() {
  const state = useAdmin();
  const now = ADMIN_NOW;
  const unassigned = unassignedCases(state.cases);
  const totalCapacity = state.staff.reduce((s, x) => s + x.capacity, 0);
  const totalLoad = state.staff.reduce((s, x) => s + caseLoadOf(state.cases, x.id).length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <p className="font-manrope text-xs font-semibold tracking-wider text-text-muted uppercase">
            Kapasitas tim
          </p>
          <p className="mt-1 font-bricolage text-2xl font-bold text-text-main">
            {totalLoad}/{totalCapacity}
          </p>
          <MiniBar
            value={(totalLoad / Math.max(totalCapacity, 1)) * 100}
            tone={totalLoad > totalCapacity ? "danger" : "navy"}
            className="mt-2 h-2"
          />
          <p className="mt-1.5 font-manrope text-xs text-text-muted">
            kasus aktif dibagi seluruh kapasitas harian
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <p className="font-manrope text-xs font-semibold tracking-wider text-text-muted uppercase">
            Belum di-assign
          </p>
          <p className="mt-1 font-bricolage text-2xl font-bold text-brand-red">{unassigned.length}</p>
          <p className="mt-1.5 font-manrope text-xs text-text-muted">
            kasus butuh reviewer/writer sebelum bisa lanjut
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <p className="font-manrope text-xs font-semibold tracking-wider text-text-muted uppercase">
            Anggota online
          </p>
          <p className="mt-1 font-bricolage text-2xl font-bold text-emerald-600">
            {state.staff.filter((s) => s.online).length}/{state.staff.length}
          </p>
          <p className="mt-1.5 font-manrope text-xs text-text-muted">siap menerima penugasan baru</p>
        </div>
      </div>

      {unassigned.length > 0 && (
        <div className="rounded-2xl border border-brand-red/20 bg-brand-red/5 p-4 md:p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-brand-red" />
            <h2 className="font-bricolage text-base font-bold text-text-main">
              Antrean belum ditugaskan
            </h2>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {unassigned.map((c) => (
              <CaseRow key={c.id} c={c} now={now} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.staff.map((s) => {
          const load = caseLoadOf(state.cases, s.id);
          const over = load.length > s.capacity;
          return (
            <div key={s.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start gap-3">
                <Avatar name={s.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-manrope text-sm font-bold text-text-main">{s.name}</p>
                  <p className="font-manrope text-xs text-text-muted">{s.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <Pill tone="navy">{ROLE_LABEL[s.role]}</Pill>
                    <Pill tone={s.online ? "success" : "muted"}>{s.online ? "online" : "offline"}</Pill>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between font-manrope text-xs">
                  <span className="text-text-muted">Beban aktif</span>
                  <span className={over ? "font-bold text-brand-red" : "font-semibold text-text-main"}>
                    {load.length}/{s.capacity}
                  </span>
                </div>
                <MiniBar
                  value={(load.length / Math.max(s.capacity, 1)) * 100}
                  tone={over ? "danger" : "navy"}
                  className="mt-1.5 h-2"
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {s.specialties.map((sp) => (
                  <span
                    key={sp}
                    className="rounded-md bg-muted px-1.5 py-0.5 font-manrope text-[10px] text-text-muted"
                  >
                    {sp}
                  </span>
                ))}
              </div>

              <div className="mt-4 space-y-1.5">
                {load.length === 0 && (
                  <p className="font-manrope text-xs text-text-muted">Belum ada kasus aktif.</p>
                )}
                {load.slice(0, 4).map((c) => (
                  <Link
                    key={c.id}
                    to="/admin/cv-review/cases/$caseId"
                    params={{ caseId: c.id }}
                    className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-2.5 py-1.5 transition-colors hover:border-brand-navy/30 hover:bg-muted/60"
                  >
                    <span className="min-w-0 truncate font-manrope text-xs text-text-main">
                      {clientOf(c).name}
                      <span className="text-text-muted"> · {c.roleTarget}</span>
                    </span>
                    <StageBadge stage={c.stage} />
                  </Link>
                ))}
                {load.length > 4 && (
                  <p className="font-manrope text-[11px] text-text-muted">
                    +{load.length - 4} kasus lain
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <UserCog className="size-4 text-text-muted" />
        <p className="font-manrope text-[11px] text-text-muted">
          Penugasan dilakukan dari halaman kasus (tab Ringkasan) atau dari pipeline.
        </p>
      </div>
    </div>
  );
}

function CaseRow({ c, now }: { c: CaseFile; now: number }) {
  const info = deadlineInfo(c.dueAt, c.stage, now);
  const client = clientOf(c);
  return (
    <Link
      to="/admin/cv-review/cases/$caseId"
      params={{ caseId: c.id }}
      className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-brand-navy/30"
    >
      <Avatar name={client.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-manrope text-sm font-semibold text-text-main">
          {client.name}
          <span className="font-normal text-text-muted"> · {c.roleTarget}</span>
        </p>
        <p className="font-manrope text-[11px] text-text-muted">
          {c.id} · {STAGES.find((s) => s.key === c.stage)?.short} · {info.label}
        </p>
      </div>
      <PriorityBadge priority={c.priority} />
      <Inbox className="size-3.5 text-text-muted" />
    </Link>
  );
}