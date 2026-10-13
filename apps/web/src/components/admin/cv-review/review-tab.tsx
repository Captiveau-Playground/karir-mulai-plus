import { useMemo, useState } from "react";
import { Check, FileText, MessageSquarePlus, StickyNote, Trash2 } from "lucide-react";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@karir-mulai-plus/ui/components/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { annotateCv } from "@/lib/engine";
import { adminStore } from "@/lib/cv-review/store";
import {
  DELIVERABLE_DEFS,
  NOTE_SEVERITY,
  type CaseFile,
  type DeliverableKey,
  type NoteSeverity,
} from "@/lib/cv-review/data";
import { Avatar, EmptyState, Pill, SeverityBadge, timeAgo } from "./ui";
import { cn } from "@/lib/utils";

export function ReviewTab({ c }: { c: CaseFile }) {
  const [filter, setFilter] = useState<"all" | NoteSeverity>("all");
  const [open, setOpen] = useState(false);

  const lines = useMemo(() => annotateCv(c.cvText, c.roleTarget), [c.cvText, c.roleTarget]);
  const notes = c.notes.filter((n) => filter === "all" || n.severity === filter);
  const unresolved = c.notes.filter((n) => !n.resolved).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.15fr]">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">CV Klien — dibaca AI</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-manrope text-[10px] font-medium text-emerald-800">
              metrik
            </span>
            <span className="rounded-md bg-brand-navy/10 px-2 py-0.5 font-manrope text-[10px] font-medium text-brand-navy">
              keyword role
            </span>
            <span className="rounded-md bg-brand-orange/20 px-2 py-0.5 font-manrope text-[10px] font-medium text-amber-800">
              perlu angka
            </span>
          </div>
        </div>
        <div className="mt-3 max-h-[560px] overflow-y-auto rounded-xl border border-gray-100 bg-muted/50 p-4 font-mono text-[12px] leading-6">
          {lines.map((l, i) => (
            <div
              key={i}
              className={cn("my-0.5 rounded-md px-1.5 py-0.5 break-words whitespace-pre-wrap", annotStyle(l.kind))}
            >
              {l.text}
              {l.kind === "generic" && (
                <span className="ml-2 font-sans text-[10px] font-semibold text-brand-red-orange">
                  ⟵ tambah angka
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StickyNote className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Catatan Review</h2>
            <Pill tone={unresolved > 0 ? "warning" : "success"}>{unresolved} belum selesai</Pill>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(NOTE_SEVERITY) as NoteSeverity[]).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilter(filter === sev ? "all" : sev)}
                className={cn(
                  "rounded-lg px-2 py-1 font-manrope text-[10px] font-semibold transition-colors",
                  filter === sev ? "bg-brand-navy text-white" : "bg-muted text-text-muted",
                )}
              >
                {NOTE_SEVERITY[sev].label}
              </button>
            ))}
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="gap-1.5 rounded-lg font-manrope text-xs font-semibold"
            >
              <MessageSquarePlus className="size-3.5" /> Catatan
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {notes.length === 0 && (
            <EmptyState
              title="Belum ada catatan pada filter ini"
              hint="Tambahkan catatan review untuk diteruskan ke writer."
            />
          )}
          {notes.map((n) => (
            <div
              key={n.id}
              className={cn(
                "rounded-xl border p-3.5 transition-colors",
                n.resolved ? "border-emerald-200 bg-emerald-50/40" : "border-gray-100",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <SeverityBadge severity={n.severity} />
                  <span className="font-manrope text-xs font-semibold text-text-main">{n.section}</span>
                  <span className="font-manrope text-[10px] text-text-muted">
                    · {scopeLabel(n.scope)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adminStore.toggleNote(c.id, n.id)}
                    title={n.resolved ? "Tandai belum selesai" : "Tandai selesai"}
                    className={cn(
                      "grid size-6 place-items-center rounded-md border transition-colors",
                      n.resolved
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-gray-200 text-transparent hover:border-emerald-500",
                    )}
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    onClick={() => adminStore.removeNote(c.id, n.id)}
                    title="Hapus catatan"
                    className="grid size-6 place-items-center rounded-md text-text-muted transition-colors hover:bg-brand-red/10 hover:text-brand-red"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-2 font-manrope text-[13px] leading-relaxed whitespace-pre-wrap text-text-main">
                {n.body}
              </p>

              {n.before && n.after && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-brand-red/20 bg-brand-red/5 px-3 py-2">
                    <p className="font-manrope text-[10px] font-bold text-brand-red uppercase">Sebelum</p>
                    <p className="mt-0.5 font-manrope text-xs text-text-muted line-through">{n.before}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
                    <p className="font-manrope text-[10px] font-bold text-emerald-700 uppercase">Usulan</p>
                    <p className="mt-0.5 font-manrope text-xs font-medium text-text-main">{n.after}</p>
                  </div>
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Avatar name={n.authorName} size="sm" />
                  <span className="font-manrope text-[11px] text-text-muted">
                    {n.authorName} · {timeAgo(n.at)}
                  </span>
                </div>
                {n.resolved && n.resolvedBy && (
                  <span className="font-manrope text-[10px] font-semibold text-emerald-700">
                    ✓ diselesaikan {n.resolvedBy}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AddNoteDialog c={c} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function scopeLabel(scope: string) {
  if (scope === "general") return "Keseluruhan";
  return DELIVERABLE_DEFS.find((d) => d.key === scope)?.short ?? scope;
}

function annotStyle(kind: string): string {
  switch (kind) {
    case "heading":
      return "bg-gray-200/70 font-sans text-[10px] font-bold tracking-widest text-text-main uppercase";
    case "metric":
      return "bg-emerald-100/80";
    case "keyword":
      return "bg-brand-navy/10";
    case "generic":
      return "bg-brand-orange/20";
    default:
      return "";
  }
}

function AddNoteDialog({ c, open, onClose }: { c: CaseFile; open: boolean; onClose: () => void }) {
  const [scope, setScope] = useState<string>("cv_id");
  const [severity, setSeverity] = useState<NoteSeverity>("major");
  const [section, setSection] = useState("");
  const [body, setBody] = useState("");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");

  const submit = () => {
    if (!body.trim()) return;
    adminStore.addNote(c.id, {
      scope: scope as DeliverableKey | "general",
      severity,
      section: section.trim() || "Umum",
      body: body.trim(),
      before,
      after,
    });
    setSection("");
    setBody("");
    setBefore("");
    setAfter("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah catatan review</DialogTitle>
          <DialogDescription>
            Catatan ini menjadi instruksi kerja writer saat tahap produksi.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-manrope text-xs">Lingkup dokumen</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger className="font-manrope text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERABLE_DEFS.map((d) => (
                    <SelectItem key={d.key} value={d.key}>
                      {d.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="general">Keseluruhan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-manrope text-xs">Tingkat masalah</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as NoteSeverity)}>
                <SelectTrigger className="font-manrope text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(NOTE_SEVERITY) as NoteSeverity[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {NOTE_SEVERITY[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="font-manrope text-xs">Bagian CV (Summary, Experience, Skills…)</Label>
            <Input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="cth. Experience"
              className="font-manrope text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-manrope text-xs">Isi catatan</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Apa masalahnya dan bagaimana harus diperbaiki…"
              className="min-h-20 font-manrope text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="font-manrope text-xs">Teks sebelum (opsional)</Label>
              <Textarea
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                placeholder="Kalimat asli di CV…"
                className="min-h-14 font-manrope text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-manrope text-xs">Usulan perbaikan (opsional)</Label>
              <Textarea
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                placeholder="Kalimat yang lebih baik…"
                className="min-h-14 font-manrope text-sm"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-manrope text-sm">
            Batal
          </Button>
          <Button
            onClick={submit}
            disabled={!body.trim()}
            className="gap-1.5 font-manrope text-sm font-semibold"
          >
            <MessageSquarePlus className="size-4" /> Simpan catatan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}