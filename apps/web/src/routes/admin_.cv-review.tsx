import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, KanbanSquare, Users, UserCog, FileSearch } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { CvReviewGuard } from "@/components/admin/cv-review/guard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin_/cv-review")({
  head: () => ({
    meta: [
      { title: "Intensive CV Review — Ops MULAI+ Career" },
      {
        name: "description",
        content:
          "Pipeline review CV intensif: klasifikasi AI, review staff, produksi CV ID/EN, surat lamaran ID/EN, sampai terbit.",
      },
    ],
  }),
  component: CvReviewLayout,
});

const TABS = [
  { to: "/admin/cv-review", label: "Ikhtisar", icon: LayoutDashboard, exact: true },
  { to: "/admin/cv-review/pipeline", label: "Pipeline", icon: KanbanSquare, exact: false },
  { to: "/admin/cv-review/clients", label: "Klien", icon: Users, exact: false },
  { to: "/admin/cv-review/team", label: "Tim", icon: UserCog, exact: false },
] as const;

function CvReviewLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isCaseDetail = pathname.includes("/cases/");

  return (
    <AppShell>
      <CvReviewGuard>
        {isCaseDetail ? (
          <Outlet />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="font-manrope text-xs font-semibold tracking-widest text-brand-orange uppercase">
                  Ops Internal
                </p>
                <h1 className="mt-1 flex items-center gap-2 font-bricolage text-3xl font-bold text-brand-navy sm:text-4xl">
                  <FileSearch className="size-7 text-brand-navy" />
                  Intensive CV Review
                </h1>
                <p className="mt-3 font-manrope text-sm text-text-muted sm:text-base">
                  Kelola kasus review CV dari klien: klasifikasi AI (rusak / lumayan / bagus), catatan
                  reviewer, penyempurnaan CV ID + EN, surat lamaran ID + EN, sampai terbit.
                </p>
              </div>
            </div>

            <nav className="mb-6 flex flex-wrap items-center gap-1.5 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-sm">
              {TABS.map((t) => {
                const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3.5 py-2 font-manrope text-sm font-semibold transition-colors",
                      active
                        ? "bg-brand-navy text-white shadow-sm"
                        : "text-text-muted hover:bg-muted hover:text-text-main",
                    )}
                  >
                    <t.icon className="size-4" />
                    {t.label}
                  </Link>
                );
              })}
            </nav>

            <Outlet />
          </>
        )}
      </CvReviewGuard>
    </AppShell>
  );
}