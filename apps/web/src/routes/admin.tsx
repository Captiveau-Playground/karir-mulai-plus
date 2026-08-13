import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Ban, RotateCcw, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Skeleton } from "@karir-mulai-plus/ui/components/skeleton";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — MULAI+ Career" },
      { name: "description", content: "Panel admin MULAI+ Career." },
    ],
  }),
  component: AdminPage,
});

const doUpdateRole = async (userId: string, role: "user" | "admin") => {
  try {
    await orpc.admin.updateRole.call({ userId, role });
    toast.success("Role user diperbarui");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Gagal update role");
  }
};

const doSetBan = async (userId: string, banned: boolean) => {
  try {
    await orpc.admin.setBan.call({ userId, banned, reason: "Manajemen admin" });
    toast.success("Status ban diperbarui");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Gagal update ban");
  }
};

function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";
  const [page, setPage] = useState(0);

  const statsQuery = useQuery(
    orpc.admin.stats.queryOptions({ queryKey: ["admin-stats"] }),
  );

  const usersQuery = useQuery(
    orpc.admin.listUsers.queryOptions({
      input: { page, limit: 20 },
      queryKey: ["admin-users", page],
    }),
  );

  if (isPending) {
    return (
      <AppShell>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-64 w-full" />
      </AppShell>
    );
  }

  if (!session?.user) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-20 text-center">
          <ShieldCheck className="mx-auto size-10 text-brand-orange" />
          <h1 className="mt-4 font-bricolage text-2xl font-bold text-brand-navy">
            Perlu masuk dulu
          </h1>
          <p className="mt-2 font-manrope text-sm text-text-muted">
            Login untuk mengakses panel admin.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-manrope text-sm font-bold text-white"
          >
            Masuk
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-20 text-center">
          <ShieldCheck className="mx-auto size-10 text-brand-red" />
          <h1 className="mt-4 font-bricolage text-2xl font-bold text-brand-navy">
            Akses ditolak
          </h1>
          <p className="mt-2 font-manrope text-sm text-text-muted">
            Halaman ini khusus admin MULAI+ Career.
          </p>
        </div>
      </AppShell>
    );
  }

  const stats = statsQuery.data;
  const users = usersQuery.data;

  return (
    <AppShell>
      <div className="mb-8">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 font-manrope text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
          <ShieldCheck className="size-3" /> Admin Panel
        </span>
        <h1 className="font-bricolage text-3xl font-bold text-brand-navy">Kelola Pengguna</h1>
        <p className="mt-2 font-manrope text-sm text-text-muted">
          Pantau akun, ubah role, dan kelola akses pengguna MULAI+ Career.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total user", value: stats?.totalUsers },
          { label: "Session aktif", value: stats?.totalSessions },
          { label: "Akun terhubung", value: stats?.totalAccounts },
        ].map((s) => (
          <Card key={s.label} className="p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-navy/5">
                <Users className="size-5 text-brand-navy" />
              </span>
              <div>
                <p className="font-manrope text-2xl font-extrabold text-brand-navy">
                  {s.value ?? "—"}
                </p>
                <p className="font-manrope text-xs text-text-muted">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* User table */}
      <Card className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-5 py-3 font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">
                  User
                </th>
                <th className="px-5 py-3 font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Role
                </th>
                <th className="px-5 py-3 font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Status
                </th>
                <th className="px-5 py-3 text-right font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.users.map((u) => (
                <tr key={u.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-manrope text-sm font-semibold text-brand-navy">{u.name}</p>
                    <p className="font-manrope text-xs text-text-muted">{u.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      className={
                        u.role === "admin"
                          ? "bg-brand-orange/10 font-manrope text-brand-orange"
                          : "bg-secondary font-manrope text-text-muted"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    {u.banned ? (
                      <Badge className="bg-brand-red/10 font-manrope text-brand-red">Banned</Badge>
                    ) : (
                      <Badge className="bg-success/10 font-manrope text-success">Aktif</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          doUpdateRole(u.id, u.role === "admin" ? "user" : "admin").then(
                            () => usersQuery.refetch(),
                          )
                        }
                      >
                        {u.role === "admin" ? "Turunkan" : "Jadikan admin"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          doSetBan(u.id, !u.banned).then(() => usersQuery.refetch())
                        }
                      >
                        {u.banned ? (
                          <RotateCcw className="size-3.5" />
                        ) : (
                          <Ban className="size-3.5" />
                        )}
                        {u.banned ? "Unban" : "Ban"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!users && (
                <tr>
                  <td colSpan={4} className="px-5 py-8">
                    <Skeleton className="h-8 w-full" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {users && users.total > 20 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="font-manrope text-xs text-text-muted">
              {users.total} user · halaman {page + 1}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * 20 >= users.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
