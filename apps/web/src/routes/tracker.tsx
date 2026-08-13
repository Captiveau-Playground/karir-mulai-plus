import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@my-better-t-app/ui/components/card";
import { Button } from "@my-better-t-app/ui/components/button";
import { Input } from "@my-better-t-app/ui/components/input";
import { Label } from "@my-better-t-app/ui/components/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@my-better-t-app/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@my-better-t-app/ui/components/select";
import { useDb } from "@/hooks/use-db";
import { pushApplication } from "@/lib/api";
import { db, type Application, type ApplicationStage } from "@/lib/db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Tracker Lamaran — MULAI+" },
      {
        name: "description",
        content: "Lacak semua lamaran kerjamu dalam satu pipeline — dari draft sampai offer.",
      },
    ],
  }),
  component: TrackerPage,
});

const STAGES: { key: ApplicationStage; label: string; hint: string }[] = [
  { key: "draft", label: "Draft", hint: "belum dikirim" },
  { key: "applied", label: "Applied", hint: "terkirim" },
  { key: "interview", label: "Interview", hint: "proses" },
  { key: "offer", label: "Offer", hint: "diterima 🎉" },
  { key: "rejected", label: "Rejected", hint: "coba lagi" },
];

const STAGE_NEXT: Record<ApplicationStage, ApplicationStage | null> = {
  draft: "applied",
  applied: "interview",
  interview: "offer",
  offer: null,
  rejected: null,
};

function TrackerPage() {
  const state = useDb();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [stage, setStage] = useState<ApplicationStage>("draft");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const apps = state.applications;
  const total = apps.length;
  const offer = apps.filter((a) => a.stage === "offer").length;
  const rejected = apps.filter((a) => a.stage === "rejected").length;
  const active = total - offer - rejected;
  const decisionRate =
    total - rejected === 0 ? 0 : Math.round((offer / Math.max(1, total - rejected)) * 100);

  const add = () => {
    if (!role.trim() || !company.trim()) return;
    const rec = db.addApplication({
      role: role.trim(),
      company: company.trim(),
      stage,
      date,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    });
    pushApplication(rec);
    setRole("");
    setCompany("");
    setStage("draft");
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setOpen(false);
    toast.success("Lamaran dicatat", {
      description: "+5 XP — makin banyak data, makin akurat saran kami.",
    });
  };

  const move = (a: Application, dir: 1 | -1) => {
    if (dir === 1) {
      const next = STAGE_NEXT[a.stage];
      if (!next) return;
      db.updateApplication(a.id, { stage: next });
      if (next === "offer")
        toast.success("Selamat! 🎉 Tandai sesi mentor untuk rayakan langkah ini.");
      if (next === "interview")
        toast.success("Masuk interview! Latihan dulu di halaman Interview.");
    } else {
      const idx = STAGES.findIndex((s) => s.key === a.stage);
      const prev = STAGES[Math.max(0, idx - 1)]?.key;
      if (prev && prev !== a.stage) db.updateApplication(a.id, { stage: prev });
    }
  };

  const stats = [
    { label: "Total lamaran", value: total, icon: Briefcase, tone: "text-brand" },
    { label: "Aktif", value: active, icon: ArrowRight, tone: "text-brand" },
    {
      label: "Interview",
      value: apps.filter((a) => a.stage === "interview").length,
      icon: CheckCircle2,
      tone: "text-brand",
    },
    { label: "Offer", value: offer, icon: CheckCircle2, tone: "text-success" },
    { label: "Rejected", value: rejected, icon: XCircle, tone: "text-coral" },
    { label: "Offer rate", value: `${decisionRate}%`, icon: CheckCircle2, tone: "text-brand" },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Career OS · Tracker"
        title="Lacak semua lamaranmu"
        description="Dari draft sampai offer dalam satu pipeline. Semakin lengkap datanya, semakin akurat saran & laporan pasar kami."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Catat lamaran
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className={cn("size-4", s.tone)} />
            <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {total === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="mx-auto size-10 text-brand" />
          <h2 className="mt-4 font-display text-xl font-semibold">
            Belum ada lamaran yang dicatat
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Catat lamaran pertama — datamu jadi bahan laporan "Apa yang berhasil" dan coach-mu makin
            pintar.
          </p>
          <Button className="mt-6" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Catat lamaran pertama
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((s) => {
            const items = apps.filter((a) => a.stage === s.key);
            return (
              <div key={s.key} className="rounded-2xl border border-border bg-muted/30 p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {s.label} <span className="ml-1 text-brand">{items.length}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && (
                    <p className="rounded-xl border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
                      {s.hint}
                    </p>
                  )}
                  {items.map((a) => (
                    <Card key={a.id} className="p-3">
                      <p className="text-sm font-semibold leading-tight">{a.role}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.company}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{a.date}</p>
                      {a.notes && (
                        <p className="mt-1.5 line-clamp-2 text-[11px] text-muted-foreground">
                          {a.notes}
                        </p>
                      )}
                      <div className="mt-2.5 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={s.key === "draft"}
                          onClick={() => move(a, -1)}
                          aria-label="Mundurkan tahap"
                        >
                          <ArrowLeft className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={!STAGE_NEXT[a.stage]}
                          onClick={() => move(a, 1)}
                          aria-label="Lanjutkan tahap"
                        >
                          <ArrowRight className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-auto text-destructive"
                          onClick={() => db.removeApplication(a.id)}
                          aria-label="Hapus lamaran"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Catat lamaran baru</DialogTitle>
            <DialogDescription>+5 XP untuk setiap lamaran yang dicatat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Role</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="cth: Product Manager"
              />
            </div>
            <div>
              <Label className="mb-2 block">Perusahaan</Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="cth: Tokopedia"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 block">Tahap</Label>
                <Select value={stage} onValueChange={(v) => setStage(v as ApplicationStage)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Tanggal</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Catatan (opsional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="link lowongan, kontak, dll"
              />
            </div>
            <Button className="w-full" disabled={!role.trim() || !company.trim()} onClick={add}>
              Simpan lamaran
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
