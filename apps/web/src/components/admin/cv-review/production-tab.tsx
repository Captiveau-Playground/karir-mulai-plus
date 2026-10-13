import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  History,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Undo2,
} from "lucide-react";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { Avatar, DeliverableStatusBadge, MiniBar, Pill, timeAgo } from "./ui";
import { adminStore } from "@/lib/cv-review/store";
import {
  DELIVERABLE_DEFS,
  STAFF,
  formatDateTime,
  wordCount,
  type CaseFile,
  type DeliverableKey,
  type DeliverableStatus,
} from "@/lib/cv-review/data";
import { cn } from "@/lib/utils";

export function ProductionTab({ c }: { c: CaseFile }) {
  const [key, setKey] = useState<DeliverableKey>("cv_id");
  const [draft, setDraft] = useState<Record<string, string>>({});

  const def = DELIVERABLE_DEFS.find((d) => d.key === key)!;
  const d = c.deliverables[key];
  const included = c.pkg !== "express" || def.lang === "id";
  const value = draft[key] ?? d.body;
  const dirty = value !== d.body;
  const checksDone = d.checks.filter((ch) => ch.done).length;
  const allChecks = checksDone === d.checks.length && d.checks.length > 0;

  const save = () => {
    adminStore.saveDeliverable(c.id, key, value);
    setDraft((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    toast.success(`${def.short} disimpan (v${Math.max(1, d.version)})`);
  };

  const generate = () => {
    adminStore.generateDraft(c.id, key, "replace");
    setDraft((p) => {
      const n = { ...p };
      delete n[key];
      return n;
    });
    toast.success("Draft digenerate dari hasil review", {
      description: "Ganti setiap penanda [angka] dengan data nyata klien sebelum terbit.",
    });
  };

  const setStatus = (status: DeliverableStatus) => {
    adminStore.setDeliverableStatus(c.id, key, status);
    toast.success(`${def.short} → ${status}`);
  };

  const published = c.stage === "published";
  const enablers = DELIVERABLE_DEFS.filter((x) => c.pkg !== "express" || x.lang === "id");
  const readyToPublish = enablers.every((x) => c.deliverables[x.key].status !== "todo");

  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      {/* Editor */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-center gap-1.5">
            {DELIVERABLE_DEFS.map((x) => {
              const inc = c.pkg !== "express" || x.lang === "id";
              const active = x.key === key;
              const st = c.deliverables[x.key].status;
              return (
                <button
                  key={x.key}
                  onClick={() => setKey(x.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 font-manrope text-xs font-semibold transition-all",
                    active
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-gray-200 bg-white text-text-muted hover:border-brand-navy/40",
                    !inc && "opacity-50",
                  )}
                >
                  {x.short}
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      st === "published"
                        ? "bg-emerald-400"
                        : st === "approved" || st === "review"
                          ? "bg-brand-orange"
                          : st === "drafting"
                            ? "bg-brand-navy"
                            : "bg-gray-300",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {!included ? (
            <div className="mt-4 rounded-xl border border-dashed border-gray-200 p-6 text-center">
              <p className="font-manrope text-sm font-semibold text-text-main">
                {def.label} tidak termasuk paket {c.pkg}
              </p>
              <p className="mt-1 font-manrope text-xs text-text-muted">
                Paket Express hanya mencakup CV dan surat lamaran Bahasa Indonesia.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-manrope text-sm font-bold text-text-main">{def.label}</p>
                  <p className="font-manrope text-[11px] text-text-muted">
                    v{Math.max(1, d.version)} · {wordCount(value)} kata ·{" "}
                    {d.updatedAt ? `diperbarui ${timeAgo(d.updatedAt)}` : "belum ada draft"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <DeliverableStatusBadge status={d.status} />
                  <Select
                    value={d.ownerId ?? "none"}
                    onValueChange={(v) => {
                      const staff = v === "none" ? null : v;
                      if (staff) adminStore.assign(c.id, "writer", staff);
                    }}
                  >
                    <SelectTrigger className="h-8 w-40 font-manrope text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Belum ada writer</SelectItem>
                      {STAFF.filter((s) => s.role === "writer").map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={generate}
                  className="gap-1.5 rounded-xl font-manrope text-xs font-semibold"
                >
                  <Sparkles className="size-3.5" /> Generate dari template
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => adminStore.generateDraft(c.id, key, "append")}
                  className="gap-1.5 rounded-xl font-manrope text-xs"
                >
                  <RefreshCw className="size-3.5" /> Sisipkan versi baru
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!dirty}
                  onClick={save}
                  className="gap-1.5 rounded-xl font-manrope text-xs"
                >
                  <Save className="size-3.5" /> Simpan versi
                </Button>
              </div>

              <Textarea
                value={value}
                onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))}
                placeholder="Belum ada draft. Klik “Generate dari template” untuk membuat draft awal dari hasil review…"
                className="mt-3 min-h-[380px] font-mono text-[12px] leading-6"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={published}
                  onClick={() => setStatus("drafting")}
                  className="gap-1.5 rounded-xl font-manrope text-xs"
                >
                  <Undo2 className="size-3.5" /> Kembali ke draft
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={published || d.status === "todo"}
                  onClick={() => setStatus("review")}
                  className="gap-1.5 rounded-xl font-manrope text-xs"
                >
                  <Send className="size-3.5" /> Kirim ke QA
                </Button>
                <Button
                  size="sm"
                  disabled={published || d.status === "todo"}
                  onClick={() => setStatus("approved")}
                  className="gap-1.5 rounded-xl bg-emerald-600 font-manrope text-xs font-semibold hover:bg-emerald-700"
                >
                  <CheckCircle2 className="size-3.5" /> Setujui
                </Button>
                {dirty && (
                  <span className="font-manrope text-[11px] font-semibold text-brand-orange">
                    ada perubahan belum disimpan
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* QA checklist */}
        {included && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="size-4 text-brand-navy" />
                <h2 className="font-bricolage text-base font-bold text-text-main">
                  Checklist QA — {def.short}
                </h2>
              </div>
              <Pill tone={allChecks ? "success" : "warning"}>
                {checksDone}/{d.checks.length} lolos
              </Pill>
            </div>
            <MiniBar
              value={(checksDone / Math.max(d.checks.length, 1)) * 100}
              tone={allChecks ? "success" : "warning"}
              className="mt-3 h-2"
            />
            <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {d.checks.map((ch) => (
                <button
                  key={ch.label}
                  onClick={() => adminStore.toggleCheck(c.id, key, ch.label)}
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                    ch.done ? "border-emerald-200 bg-emerald-50/50" : "border-gray-100 hover:bg-muted/60",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded border",
                      ch.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300",
                    )}
                  >
                    {ch.done && <CheckCircle2 className="size-3" />}
                  </span>
                  <span className="font-manrope text-[11px] text-text-main">
                    {ch.label}
                    {ch.auto && !ch.done && (
                      <span className="ml-1 text-text-muted">(otomatis: belum terpenuhi)</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Riwayat versi */}
        {included && d.history.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-center gap-2">
              <History className="size-4 text-brand-navy" />
              <h2 className="font-bricolage text-base font-bold text-text-main">Riwayat Versi</h2>
            </div>
            <ol className="mt-3 space-y-2">
              {d.history.map((h, i) => (
                <li key={`${h.version}-${i}`} className="flex items-start gap-3 rounded-lg border border-gray-100 p-2.5">
                  <Pill tone="navy">v{h.version}</Pill>
                  <div className="min-w-0 flex-1">
                    <p className="font-manrope text-xs text-text-main">{h.note}</p>
                    <p className="font-manrope text-[10px] text-text-muted">
                      {h.by} · {formatDateTime(h.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Rilis */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <h2 className="font-bricolage text-base font-bold text-text-main">Ringkasan Rilis</h2>
          <div className="mt-3 space-y-2">
            {enablers.map((x) => {
              const dd = c.deliverables[x.key];
              return (
                <div key={x.key} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 p-3">
                  <div className="min-w-0">
                    <p className="font-manrope text-xs font-semibold text-text-main">{x.short}</p>
                    <p className="font-manrope text-[10px] text-text-muted">
                      {dd.ownerId ? STAFF.find((s) => s.id === dd.ownerId)?.name : "belum ada writer"} · v
                      {Math.max(1, dd.version)} · {dd.wordCount} kata
                    </p>
                  </div>
                  <DeliverableStatusBadge status={dd.status} />
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl bg-muted/60 p-3">
            <p className="font-manrope text-[11px] text-text-muted">
              Terbit akan mengirim CV ID/EN dan surat lamaran ke email + portal klien, lalu menandai kasus
              sebagai <b className="text-text-main">Terbit</b>.
            </p>
          </div>

          <Button
            disabled={published || !readyToPublish}
            onClick={() => {
              adminStore.publish(c.id);
              toast.success("Rilis diterbitkan 🎉", {
                description: "Klien menerima CV ID/EN + surat lamaran lewat email dan portal.",
              });
            }}
            className="mt-3 w-full gap-1.5 rounded-xl bg-brand-navy font-manrope text-sm font-semibold hover:bg-brand-navy/90"
          >
            {published ? (
              <>
                <CheckCircle2 className="size-4" /> Sudah terbit
              </>
            ) : (
              <>
                Terbitkan rilis <ArrowRight className="size-4" />
              </>
            )}
          </Button>
          {!readyToPublish && !published && (
            <p className="mt-2 text-center font-manrope text-[11px] text-text-muted">
              Semua dokumen dalam paket harus punya draft dulu.
            </p>
          )}
        </div>

        {/* Reviewer catatan aktif */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <h2 className="font-bricolage text-base font-bold text-text-main">Instruksi Aktif</h2>
          <p className="font-manrope text-[11px] text-text-muted">
            Catatan reviewer yang belum diselesaikan — pastikan sudah diterapkan di draft.
          </p>
          <div className="mt-3 space-y-2">
            {c.notes.filter((n) => !n.resolved).length === 0 && (
              <p className="font-manrope text-xs text-text-muted">
                Semua catatan sudah diselesaikan. 👍
              </p>
            )}
            {c.notes
              .filter((n) => !n.resolved)
              .slice(0, 6)
              .map((n) => (
                <div key={n.id} className="rounded-xl border border-gray-100 p-2.5">
                  <div className="flex items-center gap-1.5">
                    <Pill tone={n.severity === "blocker" ? "danger" : n.severity === "major" ? "warning" : "muted"}>
                      {n.section}
                    </Pill>
                    <span className="font-manrope text-[10px] text-text-muted">
                      {DELIVERABLE_DEFS.find((x) => x.key === n.scope)?.short ?? "Keseluruhan"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-3 font-manrope text-[11px] text-text-main">{n.body}</p>
                  {n.after && (
                    <p className="mt-1 font-manrope text-[11px] text-emerald-700">→ {n.after}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Avatar name={n.authorName} size="sm" />
                    <span className="font-manrope text-[10px] text-text-muted">
                      {n.authorName} · {timeAgo(n.at)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}