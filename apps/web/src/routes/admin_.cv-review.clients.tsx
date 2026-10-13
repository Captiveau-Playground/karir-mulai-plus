import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Search, Users } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

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
  EmptyState,
  GradeBadge,
  PackageBadge,
  Pill,
  StageBadge,
} from "@/components/admin/cv-review/ui";
import { useAdmin } from "@/lib/cv-review/store";
import {
  PLAN_MAP,
  casesOfClient,
  formatDate,
  type ClientPlan,
} from "@/lib/cv-review/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin_/cv-review/clients")({
  component: CvReviewClients,
});

function CvReviewClients() {
  const state = useAdmin();
  const [q, setQ] = useState("");
  const [plan, setPlan] = useState<ClientPlan | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.clients
      .filter((c) => (plan === "all" ? true : c.plan === plan))
      .filter((c) =>
        needle
          ? c.name.toLowerCase().includes(needle) ||
            c.email.toLowerCase().includes(needle) ||
            c.id.toLowerCase().includes(needle) ||
            c.city.toLowerCase().includes(needle)
          : true,
      )
      .map((c) => ({ client: c, cases: casesOfClient(state.cases, c.id) }))
      .sort((a, b) => b.client.joinedAt - a.client.joinedAt);
  }, [state.clients, state.cases, q, plan]);

  const totalRevenue = rows.reduce(
    (sum, r) => sum + r.cases.reduce((s, c) => s + (c.pkg === "intensive" ? 899000 : c.pkg === "standard" ? 449000 : 249000), 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, email, kota, atau ID klien…"
            className="pl-9 font-manrope text-sm"
          />
        </div>
        <Select value={plan} onValueChange={(v) => setPlan(v as ClientPlan | "all")}>
          <SelectTrigger className="w-40 font-manrope text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua paket</SelectItem>
            {(Object.keys(PLAN_MAP) as ClientPlan[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PLAN_MAP[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Pill tone="muted">{rows.length} klien</Pill>
        <Pill tone="navy">
          Nilai kasus: Rp {(totalRevenue / 1_000_000).toFixed(1)} jt
        </Pill>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Tidak ada klien yang cocok" hint="Ubah kata kunci atau filter paket." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-muted">
                  {["Klien", "Kontak", "Kota", "Paket", "Kasus", "Status akun", "Terdaftar", ""].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left font-manrope text-[11px] font-semibold tracking-wider text-text-muted uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(({ client, cases }) => {
                  const open = openId === client.id;
                  const activeCase = cases.find((c) => c.stage !== "published") ?? cases[0];
                  return (
                    <Fragment key={client.id}>
                      <tr
                        onClick={() => setOpenId(open ? null : client.id)}
                        className="cursor-pointer transition-colors hover:bg-muted/60"
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={client.name} size="sm" />
                            <div>
                              <p className="font-manrope text-sm font-semibold text-text-main">
                                {client.name}
                              </p>
                              <p className="font-manrope text-[11px] text-text-muted">{client.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-manrope text-xs text-text-muted">
                          {client.email}
                          <br />
                          {client.phone}
                        </td>
                        <td className="px-3 py-2.5 font-manrope text-xs text-text-main">{client.city}</td>
                        <td className="px-3 py-2.5">
                          <Pill tone={client.plan === "career-plus" ? "navy" : client.plan === "intensive" ? "warning" : "muted"}>
                            {PLAN_MAP[client.plan].label}
                          </Pill>
                        </td>
                        <td className="px-3 py-2.5 font-manrope text-xs text-text-main">
                          {cases.length}
                          {activeCase && (
                            <span className="ml-1.5">
                              <StageBadge stage={activeCase.stage} />
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <Pill tone={client.accountStatus === "aktif" ? "success" : "warning"}>
                            {client.accountStatus}
                          </Pill>
                        </td>
                        <td className="px-3 py-2.5 font-manrope text-xs text-text-muted">
                          {formatDate(client.joinedAt)}
                        </td>
                        <td className="px-3 py-2.5">
                          <ChevronDown
                            className={cn("size-4 text-text-muted transition-transform", open && "rotate-180")}
                          />
                        </td>
                      </tr>
                      {open && (
                        <tr className="bg-muted/40">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                              <div className="rounded-xl border border-gray-100 bg-white p-4">
                                <div className="flex items-center gap-2">
                                  <Users className="size-4 text-brand-navy" />
                                  <p className="font-bricolage text-sm font-bold text-text-main">
                                    Detail klien
                                  </p>
                                </div>
                                <dl className="mt-3 space-y-1.5 font-manrope text-xs">
                                  <Row label="Sumber" value={client.source} />
                                  <Row label="Paket" value={PLAN_MAP[client.plan].label} />
                                  <Row
                                    label="Nilai paket"
                                    value={`Rp ${PLAN_MAP[client.plan].priceIdr.toLocaleString("id-ID")}`}
                                  />
                                  <Row label="Kota" value={client.city} />
                                </dl>
                              </div>
                              <div className="space-y-2">
                                {cases.map((c) => (
                                  <Link
                                    key={c.id}
                                    to="/admin/cv-review/cases/$caseId"
                                    params={{ caseId: c.id }}
                                    className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:border-brand-navy/30"
                                  >
                                    <span className="font-manrope text-sm font-semibold text-text-main">
                                      {c.id}
                                    </span>
                                    <span className="font-manrope text-xs text-text-muted">
                                      {c.roleTarget} · {c.seniority}
                                    </span>
                                    <StageBadge stage={c.stage} />
                                    {c.classification && <GradeBadge grade={c.classification.grade} />}
                                    <PackageBadge pkg={c.pkg} />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-text-muted">{label}</dt>
      <dd className="font-semibold text-text-main">{value}</dd>
    </div>
  );
}

