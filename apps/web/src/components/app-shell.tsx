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
  MessagesSquare,
  Moon,
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
import { db, defaultProfile, levelFromXp } from "@/lib/db";
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

const careerOs = [
  { to: "/cv-builder", label: "CV Builder", icon: FileText },
  { to: "/coach", label: "AI Coach", icon: Bot },
  { to: "/tracker", label: "Tracker Lamaran", icon: KanbanSquare },
  { to: "/interview", label: "Interview Prep", icon: MessagesSquare },
  { to: "/skills", label: "Skill Quiz", icon: Award },
  { to: "/roadmap", label: "Roadmap", icon: Map },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const state = useDb();
  const profile = state.profile ?? defaultProfile();
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  // Pull data D1 saat login (local-first: localStorage tetap cache)
  useEffect(() => {
    if (session) void pullFromServer();
  }, [session]);

  // Dark mode: terapkan class ke <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const initials = profile.name
    .split(" ")
    .map((x) => x[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="gradient-brand grid size-8 place-items-center rounded-xl text-sm font-bold text-brand-foreground">
              M+
            </span>
            <span className="font-display text-base font-semibold">MULAI+</span>
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
              <DropdownMenuContent className="w-56 bg-popover">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Perjalanan kariermu
                  </DropdownMenuLabel>
                  {careerOs.map((c) => (
                    <DropdownMenuItem key={c.to} render={<Link to={c.to} />}>
                      <span className="flex items-center gap-2">
                        <c.icon className="size-4 text-brand" /> {c.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link to="/market" />}>
                    <span className="flex items-center gap-2">
                      <LineChart className="size-4 text-brand" /> Sinyal pasar
                    </span>
                  </DropdownMenuItem>
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
                className="hidden rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-coral-foreground sm:inline-flex"
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
                {session?.user.name ?? profile.name}
              </p>
              <p className="text-xs text-muted-foreground">{profile.currentRole}</p>
            </div>
            {isPending ? (
              <Skeleton className="size-9 rounded-full" />
            ) : session ? (
              <div className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {session.user.name
                  .split(" ")
                  .map((x) => x[0])
                  .slice(0, 2)
                  .join("")}
              </div>
            ) : (
              <div className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {initials}
              </div>
            )}
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
            {[...nav, ...careerOs].map((n) => (
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
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
        MULAI+ — Bimbingan Universitas, Jurusan & Beasiswa.
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
