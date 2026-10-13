import { Link } from "@tanstack/react-router";
import {
  Award,
  Bot,
  Compass,
  FileSearch,
  FileText,
  Flame,
  KanbanSquare,
  LayoutDashboard,
  LineChart,
  Map,
  Menu,
  LogOut,
  MessagesSquare,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@karir-mulai-plus/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@karir-mulai-plus/ui/components/dropdown-menu";
import { useDb } from "@/hooks/use-db";
import { db, levelFromXp, setGamificationConfig } from "@/lib/db";
import { client } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { pullFromServer } from "@/lib/api";
import { Skeleton } from "@karir-mulai-plus/ui/components/skeleton";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cv-audit", label: "CV Audit", icon: FileSearch },
  { to: "/career", label: "Career", icon: Compass },
  { to: "/market", label: "Market", icon: LineChart },
  { to: "/mentors", label: "Mentors", icon: Users },
] as const;

/* Grup fitur untuk dropdown Career OS — bantu user paham peran tiap fitur. */
const careerGroups = [
  {
    label: "Assess",
    items: [
      { to: "/cv-audit", label: "CV Audit", icon: FileSearch },
      { to: "/career", label: "Career Match", icon: Compass },
      { to: "/skills", label: "Skill Quiz", icon: Award },
    ],
  },
  {
    label: "Learn",
    items: [
      { to: "/coach", label: "AI Coach", icon: Bot },
      { to: "/roadmap", label: "Roadmap", icon: Map },
      { to: "/interview", label: "Interview Prep", icon: MessagesSquare },
    ],
  },
  {
    label: "Apply",
    items: [
      { to: "/cv-builder", label: "CV Builder", icon: FileText },
      { to: "/tracker", label: "Tracker Lamaran", icon: KanbanSquare },
      { to: "/mentors", label: "Mentors", icon: Users },
    ],
  },
] as const;

export function AppShell({ children, full = false }: { children: ReactNode; full?: boolean }) {
  const state = useDb();
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  // Pull data D1 saat login (local-first: localStorage tetap cache)
  useEffect(() => {
    if (session) void pullFromServer();
  }, [session]);

  // Load config gamifikasi dari backoffice (XP reward override)
  useEffect(() => {
    void (async () => {
      try {
        const res = await client.config.get({ key: "gamification.config" });
        if (res?.value && typeof res.value === "object") {
          setGamificationConfig(res.value as Partial<Record<string, number>>);
        }
      } catch {
        /* fallback ke default */
      }
    })();
  }, []);

  // Dark mode: terapkan class ke <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  // Nama tampilan: profil onboarding > session auth > fallback generik
  const profile = state.profile;
  const displayName = profile?.name ?? session?.user?.name ?? "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")
    : "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bricolage text-xl font-extrabold tracking-tight text-brand-navy">
              MULAI<span className="text-brand-orange">+</span>
            </span>
            <span className="font-manrope text-xs font-bold uppercase tracking-widest text-brand-orange">
              Career
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/dashboard" }}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-brand-soft text-foreground" }}
              >
                {n.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                Career OS
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 bg-popover">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Perjalanan kariermu
                  </DropdownMenuLabel>
                  {careerGroups.map((g) => (
                    <div key={g.label} className="mb-1">
                      <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
                        {g.label}
                      </p>
                      {g.items.map((c) => (
                        <DropdownMenuItem key={c.to} render={<Link to={c.to} />}>
                          <span className="flex items-center gap-2">
                            <c.icon className="size-4 text-brand" /> {c.label}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link to="/market" />}>
                    <span className="flex items-center gap-2">
                      <LineChart className="size-4 text-brand" /> Sinyal pasar
                    </span>
                  </DropdownMenuItem>
                  {(session?.user?.role === "admin" || session?.user?.role === "manager") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem render={<Link to="/admin" />}>
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-brand-orange" /> Backoffice
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link to="/admin/cv-review" />}>
                        <span className="flex items-center gap-2">
                          <FileSearch className="size-4 text-brand-orange" /> CV Review Ops
                        </span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Dark mode toggle */}
            <button
              onClick={() => db.setTheme(state.theme === "dark" ? "light" : "dark")}
              className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={state.theme === "dark" ? "Mode terang" : "Mode gelap"}
            >
              {state.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            {/* XP & streak */}
            <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold sm:inline-flex" title="Level & XP">
              <Sparkles className="size-3 text-brand" /> Lv.{levelFromXp(state.xp)}
              <span className="text-muted-foreground">· {state.xp} XP</span>
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold sm:inline-flex" title="Streak harian">
              <Flame className={cn("size-3.5", state.streak > 0 ? "text-coral" : "text-muted-foreground")} />
              {state.streak}
            </span>

            {!state.profile && !session && (
              <Link
                to="/onboarding"
                className="hidden rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-sm transition-all duration-300 hover:bg-brand/90 sm:inline-flex"
              >
                Mulai
              </Link>
            )}
            {(state.premium || state.referralBonus) && (
              <span className="hidden items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold lg:inline-flex">
                <Sparkles className="size-3" /> Premium
              </span>
            )}
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold leading-tight">
                {session?.user.name ?? profile?.name ?? ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {profile?.currentRole ?? (session ? "Anggota MULAI+" : "")}
              </p>
            </div>
            {isPending ? (
              <Skeleton className="size-9 rounded-full" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="grid size-9 cursor-pointer place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80">
                  {session.user.name
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-sm font-bold">
                      {session.user.name}
                    </DropdownMenuLabel>
                    <DropdownMenuItem className="cursor-pointer text-muted-foreground" disabled>
                      {session.user.email}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => {
                      void authClient.signOut();
                      window.location.href = "/";
                    }}
                  >
                    <LogOut className="size-4" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : profile ? (
              <div className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {initials}
              </div>
            ) : null}
            <button
              className="grid size-9 place-items-center rounded-lg border border-border lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-border bg-background px-4 py-2 lg:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground",
                )}
                activeProps={{ className: "bg-brand-soft text-foreground" }}
                activeOptions={{ exact: n.to === "/dashboard" }}
              >
                <n.icon className="size-4 text-brand" /> {n.label}
              </Link>
            ))}
            {careerGroups.map((g) => (
              <div key={g.label} className="mt-2">
                <p className="px-3 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
                  {g.label}
                </p>
                {g.items.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground"
                  >
                    <n.icon className="size-4 text-brand" /> {n.label}
                  </Link>
                ))}
              </div>
            ))}
            <Link
              to="/onboarding"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand"
            >
              <Sparkles className="size-4" /> {state.profile ? "Ganti profil" : "Mulai onboarding"}
            </Link>
            {state.profile && (
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive"
                onClick={() => {
                  db.reset();
                  setOpen(false);
                }}
              >
                Reset data lokal
              </button>
            )}
            {session && (
              <button
                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive"
                onClick={() => {
                  setOpen(false);
                  void authClient.signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="mr-1 inline size-4" /> Keluar dari akun
              </button>
            )}
          </nav>
        )}
      </header>

      <main className={full ? "" : "mx-auto max-w-6xl px-4 py-8"}>{children}</main>

      <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
        MULAI+ Career — akselerator karier berbasis data.
      </footer>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
