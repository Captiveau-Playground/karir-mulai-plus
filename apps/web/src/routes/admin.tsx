import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Ban,
  FileText,
  LayoutDashboard,
  LineChart,
  RotateCcw,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { AuditTab } from "@/components/admin/audit-tab";
import { BlogTab } from "@/components/admin/blog-tab";
import { CrudListTab } from "@/components/admin/crud-list-tab";
import { JsonConfigTab, StringListTab } from "@/components/admin/json-config-tab";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Skeleton } from "@karir-mulai-plus/ui/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karir-mulai-plus/ui/components/tabs";
import { authClient } from "@/lib/auth-client";
import {
  INTERVIEW_ROLE_QUESTIONS,
  RIASEC_QUESTIONS,
  ROADMAP_WEEKS,
  ROLE_OPTIONS,
  SKILL_QUIZZES,
} from "@/lib/engine";
import { skillOptions } from "@/lib/mock-data";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Backoffice — MULAI+ Career" },
      { name: "description", content: "Panel backoffice MULAI+ Career." },
    ],
  }),
  component: AdminPage,
});

const EMPTY_MARKET_ROLE = {
  role: "New Role",
  demand: 50,
  trend: "+10%",
  category: "Engineering",
  openings: 100,
  topCompanies: ["Company A", "Company B"],
};

const EMPTY_MARKET_SKILL = {
  skill: "New Skill",
  demand: 50,
  trend: "+10%",
  category: "Data",
  avgSalary: "Rp 100–200jt",
};

const EMPTY_MARKET_SALARY = {
  role: "New Role",
  junior: 70,
  mid: 120,
  senior: 200,
};

const EMPTY_MARKET_HEAT = {
  industry: "New Industry",
  intensity: 60,
  note: "Deskripsi singkat",
};

const EMPTY_MENTOR = {
  mentorId: "mentor-new",
  name: "Nama Mentor",
  initials: "NM",
  currentRole: "Role saat ini",
  company: "Perusahaan",
  industry: "Industri",
  yearsExp: 5,
  specializations: ["Skill 1", "Skill 2"],
  rating: 4.5,
  sessions: 0,
  priceIdr: 400000,
  availability: "Flexible",
  formats: ["Video call"],
  bio: "Bio singkat mentor.",
};

const EMPTY_CAREER_PATH = {
  id: "path-new",
  title: "Nama Jalur",
  matchScore: 70,
  summary: "Deskripsi singkat jalur",
  skills: ["Skill 1", "Skill 2"],
};

function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";
  const isManager = isAdmin || session?.user?.role === "manager";

  const statsQuery = useQuery(orpc.admin.stats.queryOptions({ queryKey: ["admin-stats"] }));
  const usersQuery = useQuery(
    orpc.admin.listUsers.queryOptions({ input: { page: 0, limit: 50 }, queryKey: ["admin-users"] }),
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
          <h1 className="mt-4 font-bricolage text-2xl font-bold text-brand-navy">Perlu masuk dulu</h1>
          <p className="mt-2 font-manrope text-sm text-text-muted">
            Login untuk mengakses panel backoffice.
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

  if (!isManager) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-20 text-center">
          <ShieldCheck className="mx-auto size-10 text-brand-red" />
          <h1 className="mt-4 font-bricolage text-2xl font-bold text-brand-navy">Akses ditolak</h1>
          <p className="mt-2 font-manrope text-sm text-text-muted">
            Halaman ini khusus manager & superadmin MULAI+ Career.
          </p>
        </div>
      </AppShell>
    );
  }

  const stats = statsQuery.data;

  const doUpdateRole = async (userId: string, role: "user" | "manager" | "admin") => {
    try {
      await orpc.admin.updateRole.call({ userId, role });
      toast.success(`Role diubah ke ${role}`);
      usersQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal update role");
    }
  };

  const doSetBan = async (userId: string, banned: boolean) => {
    try {
      await orpc.admin.setBan.call({ userId, banned, reason: "Manajemen backoffice" });
      toast.success("Status ban diperbarui");
      usersQuery.refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal update ban");
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 font-manrope text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
          <ShieldCheck className="size-3" /> Backoffice
        </span>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-bricolage text-3xl font-bold text-brand-navy">Kelola Platform</h1>
            <p className="mt-1 font-manrope text-sm text-text-muted">
              {isAdmin ? "Superadmin — akses penuh" : "Manager — kelola konten & konfigurasi"}
            </p>
          </div>
          {stats && (
            <div className="flex gap-3">
              <Badge className="bg-brand-soft font-manrope text-brand">👥 {stats.totalUsers} user</Badge>
              <Badge className="bg-brand-soft font-manrope text-brand">🔑 {stats.totalSessions} session</Badge>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue={isAdmin ? "dashboard" : "market"}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="dashboard">
            <LayoutDashboard className="size-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="market">
            <LineChart className="size-4" /> Market
          </TabsTrigger>
          <TabsTrigger value="mentors">
            <Star className="size-4" /> Mentors
          </TabsTrigger>
          <TabsTrigger value="career">
            <Users className="size-4" /> Career Paths
          </TabsTrigger>
          <TabsTrigger value="blog">
            <FileText className="size-4" /> Blog
          </TabsTrigger>
          <TabsTrigger value="master">
            <Star className="size-4" /> Master Data
          </TabsTrigger>
          <TabsTrigger value="landing">
            <LayoutDashboard className="size-4" /> Landing
          </TabsTrigger>
          <TabsTrigger value="gamification">
            <Star className="size-4" /> Gamifikasi
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users">
              <Users className="size-4" /> Users
            </TabsTrigger>
          )}
          <TabsTrigger value="audit">
            <ShieldCheck className="size-4" /> Audit
          </TabsTrigger>
        </TabsList>

        {/* Dashboard tab */}
        <TabsContent value="dashboard" className="mt-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total user", value: stats?.totalUsers },
              { label: "Session aktif", value: stats?.totalSessions },
              { label: "Akun terhubung", value: stats?.totalAccounts },
            ].map((s) => (
              <Card key={s.label} className="p-6">
                <p className="font-manrope text-3xl font-extrabold text-brand-navy">
                  {s.value ?? "—"}
                </p>
                <p className="font-manrope text-xs text-text-muted">{s.label}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-5 p-6">
            <p className="font-bricolage text-lg font-bold text-brand-navy">Panduan backoffice</p>
            <ul className="mt-3 space-y-2 font-manrope text-sm text-text-muted">
              <li>• <strong className="text-brand-navy">Market</strong> — kelola data role, skill, gaji, dan hiring heat.</li>
              <li>• <strong className="text-brand-navy">Mentors</strong> — kelola daftar mentor & harga.</li>
              <li>• <strong className="text-brand-navy">Career Paths</strong> — kelola jalur karier.</li>
              <li>• <strong className="text-brand-navy">Blog</strong> — tulis & publish artikel.</li>
              <li>• <strong className="text-brand-navy">Users</strong> (superadmin) — kelola role & ban user.</li>
              <li>• <strong className="text-brand-navy">Audit</strong> — riwayat semua perubahan.</li>
            </ul>
          </Card>
        </TabsContent>

        {/* Market tabs */}
        <TabsContent value="market" className="mt-5 space-y-8">
          <CrudListTab title="Role paling dicari" key="market.roles" category="market" emptyTemplate={EMPTY_MARKET_ROLE} />
          <CrudListTab title="Skill paling dicari" key="market.skills" category="market" emptyTemplate={EMPTY_MARKET_SKILL} />
          <CrudListTab title="Benchmark gaji" key="market.salaries" category="market" emptyTemplate={EMPTY_MARKET_SALARY} />
          <CrudListTab title="Hiring heat" key="market.heat" category="market" emptyTemplate={EMPTY_MARKET_HEAT} />
        </TabsContent>

        {/* Mentors tab */}
        <TabsContent value="mentors" className="mt-5">
          <CrudListTab title="Daftar Mentor" key="mentors.list" category="mentors" emptyTemplate={EMPTY_MENTOR} />
        </TabsContent>

        {/* Career paths tab */}
        <TabsContent value="career" className="mt-5">
          <CrudListTab title="Jalur Karier" key="career.paths" category="career" emptyTemplate={EMPTY_CAREER_PATH} />
        </TabsContent>

        {/* Blog tab */}
        <TabsContent value="blog" className="mt-5">
          <BlogTab />
        </TabsContent>

        {/* Master Data tab */}
        <TabsContent value="master" className="mt-5 space-y-8">
          <StringListTab
            title="Role Options"
            description="Daftar role untuk CV Audit & Career Recommend."
            key="master.roleOptions"
            category="master"
            template={ROLE_OPTIONS}
          />
          <StringListTab
            title="Skill Options"
            description="Opsi skill di onboarding & profil."
            key="master.skillOptions"
            category="master"
            template={skillOptions}
          />
          <JsonConfigTab
            title="Skill Quiz"
            description="Soal quiz per skill. Format: array { skill, questions:[{q, options[], correct, explain}] }"
            key="master.skillQuizzes"
            category="master"
            template={SKILL_QUIZZES}
          />
          <JsonConfigTab
            title="Interview Questions"
            description="Pertanyaan wawancara per role. Format: { 'Role': ['pertanyaan', ...] }"
            key="master.interviewQuestions"
            category="master"
            template={INTERVIEW_ROLE_QUESTIONS}
          />
          <JsonConfigTab
            title="Roadmap Weeks"
            description="Checklist mingguan per jalur. Format: { 'pathId': ['item', ...] }"
            key="master.roadmapWeeks"
            category="master"
            template={ROADMAP_WEEKS}
          />
          <JsonConfigTab
            title="RIASEC Questions"
            description="Soal tes kepribadian RIASEC. Format: [{ a, b, aCode, bCode }]"
            key="master.riasecQuestions"
            category="master"
            template={RIASEC_QUESTIONS}
          />
        </TabsContent>

        {/* Landing tab */}
        <TabsContent value="landing" className="mt-5 space-y-8">
          <JsonConfigTab
            title="Hero Stats"
            description="Statistik di hero landing. Format: [{ value, label }]"
            key="landing.heroStats"
            category="landing"
            template={[
              { value: "4.8/5", label: "Kepuasan user" },
              { value: "30 detik", label: "Skor CV instan" },
              { value: "120+", label: "Data role & skill" },
              { value: "6", label: "Mentor tersedia" },
            ]}
          />
          <JsonConfigTab
            title="FAQ"
            description="Pertanyaan umum di landing. Format: [{ q, a }]"
            key="landing.faq"
            category="landing"
            template={[
              { q: "Apakah gratis?", a: "Ya — skor CV, rekomendasi jalur, dan mentor gratis." },
              { q: "Data CV saya aman?", a: "Diproses dengan aman, tidak dibagikan." },
            ]}
          />
          <JsonConfigTab
            title="CTA Text"
            description="Teks CTA landing. Format: { title, subtitle, button, buttonLink }"
            key="landing.cta"
            category="landing"
            template={{
              title: "Siap Tahu Arah Kariermu?",
              subtitle: "Gratis, kurang dari 2 menit, dan hasilnya langsung bisa kamu pakai.",
              button: "Mulai sekarang — gratis",
            }}
          />
        </TabsContent>

        {/* Gamifikasi tab */}
        <TabsContent value="gamification" className="mt-5">
          <JsonConfigTab
            title="Gamifikasi & Reward"
            description="XP per aksi (audit, quiz, booking, application, coach, interview, roadmap, quest, rating) + levelThreshold — tersimpan ke app_config, langsung dipakai app."
            key="gamification.config"
            category="gamification"
            template={{
              audit: 15,
              quiz: 10,
              booking: 10,
              application: 5,
              coach: 5,
              interview: 10,
              roadmapItem: 5,
              roadmapComplete: 30,
              quest: 10,
              questAll: 30,
              rating: 5,
              levelThreshold: 100,
            }}
          />
        </TabsContent>

        {/* Users tab (superadmin only) */}
        {isAdmin && (
          <TabsContent value="users" className="mt-5">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="px-5 py-3 font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">User</th>
                      <th className="px-5 py-3 font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">Role</th>
                      <th className="px-5 py-3 font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">Status</th>
                      <th className="px-5 py-3 text-right font-manrope text-xs font-semibold uppercase tracking-wider text-text-muted">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersQuery.data?.users.map((u) => (
                      <tr key={u.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-4">
                          <p className="font-manrope text-sm font-semibold text-brand-navy">{u.name}</p>
                          <p className="font-manrope text-xs text-text-muted">{u.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Badge
                            className={
                              u.role === "admin"
                                ? "bg-brand-orange/15 font-manrope text-brand-orange"
                                : u.role === "manager"
                                  ? "bg-coral-soft font-manrope text-coral"
                                  : "bg-secondary font-manrope text-text-muted"
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          {u.banned ? (
                            <Badge className="bg-destructive/15 font-manrope text-destructive">Banned</Badge>
                          ) : (
                            <Badge className="bg-success/15 font-manrope text-success">Aktif</Badge>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                doUpdateRole(
                                  u.id,
                                  u.role === "admin"
                                    ? "manager"
                                    : u.role === "manager"
                                      ? "user"
                                      : "admin",
                                )
                              }
                            >
                              {u.role === "admin" ? "→ Manager" : u.role === "manager" ? "→ User" : "→ Admin"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => doSetBan(u.id, !u.banned)}
                            >
                              {u.banned ? <RotateCcw className="size-3.5" /> : <Ban className="size-3.5" />}
                              {u.banned ? "Unban" : "Ban"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        )}

        {/* Audit tab */}
        <TabsContent value="audit" className="mt-5">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
