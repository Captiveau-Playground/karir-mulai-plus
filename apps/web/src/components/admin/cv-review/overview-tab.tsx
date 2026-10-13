import { Link } from "@tanstack/react-router";
import {
  Bot,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  MessageSquareQuote,
  Package,
  Phone,
  Plus,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { Avatar, MiniBar, Pill, StageBadge, timeAgo } from "./ui";
import { adminStore, type StaffSlot } from "@/lib/cv-review/store";
import {
  ADMIN_NOW,
  PACKAGES,
  PLAN_MAP,
  STAFF,
  clientOf,
  deadlineInfo,
  formatDateTime,
  slaProgress,
  type CaseFile,
} from "@/lib/cv-review/data";

export function OverviewTab({ c }: { c: CaseFile }) {
  const client = clientOf(c);
  const [tagInput, setTagInput] = useState("");
  const info = deadlineInfo(c.dueAt, c.stage, ADMIN_NOW);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-4">
        {/* Klien */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Data Klien</h2>
            <Pill tone={client.accountStatus === "aktif" ? "success" : "warning"}>
              {client.accountStatus}
            </Pill>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={client.name} size="lg" />
            <div>
              <p className="font-manrope text-sm font-bold text-text-main">{client.name}</p>
              <p className="font-manrope text-xs text-text-muted">
                {client.id} · {PLAN_MAP[client.plan].label} · sejak {formatDateTime(client.joinedAt)}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <InfoRow icon={<Mail className="size-3.5" />} label="Email" value={client.email} />
            <InfoRow icon={<Phone className="size-3.5" />} label="WhatsApp" value={client.phone} />
            <InfoRow icon={<MapPin className="size-3.5" />} label="Kota" value={client.city} />
            <InfoRow
              icon={<Building2 className="size-3.5" />}
              label="Sumber akuisisi"
              value={client.source}
            />
          </div>
        </div>

        {/* Berkas CV */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Berkas CV Masuk</h2>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-100 bg-muted/60 p-3">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-navy/10 font-manrope text-[10px] font-bold text-brand-navy uppercase">
                {c.source.fileType}
              </span>
              <div>
                <p className="font-manrope text-sm font-medium text-text-main">{c.source.fileName}</p>
                <p className="font-manrope text-[11px] text-text-muted">
                  {c.source.pages} halaman · diunggah {formatDateTime(c.source.uploadedAt)}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{c.cvText.split(/\s+/).length} kata</Badge>
          </div>

          <div className="mt-4">
            <p className="font-manrope text-xs font-semibold tracking-wider text-text-muted uppercase">
              Tag kasus
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-manrope text-[11px] text-text-muted"
                >
                  {t}
                  <button
                    onClick={() => adminStore.removeTag(c.id, t)}
                    className="text-text-muted transition-colors hover:text-brand-red"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  adminStore.addTag(c.id, tagInput);
                  setTagInput("");
                }}
                className="flex items-center gap-1"
              >
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="tambah tag"
                  className="h-7 w-28 font-manrope text-[11px]"
                />
                <Button type="submit" size="sm" variant="outline" className="h-7 px-2">
                  <Plus className="size-3" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Paket */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Paket & SLA</h2>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-manrope text-sm font-bold text-text-main">
                {PACKAGES[c.pkg].label} · Rp {PACKAGES[c.pkg].priceIdr.toLocaleString("id-ID")}
              </p>
              <p className="font-manrope text-xs text-text-muted">
                tenggat {formatDateTime(c.dueAt)} ({info.label})
              </p>
            </div>
            <StageBadge stage={c.stage} />
          </div>
          <MiniBar
            value={slaProgress(c, ADMIN_NOW)}
            tone={info.tone === "late" ? "danger" : info.tone === "soon" ? "warning" : "success"}
            className="mt-3 h-2"
          />
          <ul className="mt-3 space-y-1.5">
            {PACKAGES[c.pkg].includes.map((i) => (
              <li key={i} className="flex items-center gap-2 font-manrope text-xs text-text-main">
                <CheckCircle2 className="size-3.5 text-emerald-600" /> {i}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Tim */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Penugasan</h2>
          </div>
          <div className="mt-3 space-y-3">
            <AssignRow
              c={c}
              slot="reviewer"
              label="Reviewer"
              hint="menganalisis CV & menulis catatan"
              tone="Reviewer"
            />
            <AssignRow
              c={c}
              slot="writer"
              label="Writer"
              hint="menyusun CV ID/EN + surat lamaran"
              tone="Writer"
            />
            <AssignRow c={c} slot="qa" label="QA" hint="cek akhir sebelum terbit" tone="QA" />
          </div>
        </div>

        {/* Linimasa aktivitas */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-brand-navy" />
            <h2 className="font-bricolage text-base font-bold text-text-main">Riwayat Kasus</h2>
          </div>
          <ol className="mt-4 space-y-3 border-l border-gray-200 pl-4">
            {c.activity.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-brand-navy" />
                <p className="font-manrope text-[13px] text-text-main">
                  <span className="font-semibold">{a.actor}</span> {a.text}
                </p>
                <p className="font-manrope text-[11px] text-text-muted">{timeAgo(a.at)}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Umpan balik klien */}
        {c.clientFeedback && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm md:p-5">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="size-4 text-emerald-700" />
              <h2 className="font-bricolage text-base font-bold text-text-main">Umpan Balik Klien</h2>
              <Pill tone="success">{c.clientFeedback.rating}/5</Pill>
            </div>
            <p className="mt-2 font-manrope text-sm text-text-main italic">
              “{c.clientFeedback.comment}”
            </p>
            <p className="mt-1 font-manrope text-[11px] text-text-muted">
              {timeAgo(c.clientFeedback.at)}
            </p>
          </div>
        )}

        {/* Jejak AI */}
        {c.classification && (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-brand-navy" />
              <h2 className="font-bricolage text-base font-bold text-text-main">Ringkas Klasifikasi AI</h2>
            </div>
            <p className="mt-2 font-manrope text-xs text-text-muted">
              {c.classification.model} · keyakinan {c.classification.confidence}% ·{" "}
              {c.classification.humanConfirmed ? "sudah dikonfirmasi reviewer" : "menunggu konfirmasi"}
            </p>
            <p className="mt-2 font-manrope text-[13px] text-text-main">{c.classification.verdict}</p>
            <Link
              to="/admin/cv-review/cases/$caseId"
              params={{ caseId: c.id }}
              className="mt-3 inline-block font-manrope text-xs font-semibold text-brand-navy hover:underline"
            >
              Lihat detail di tab Klasifikasi AI →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 px-3 py-2">
      <p className="flex items-center gap-1.5 font-manrope text-[10px] font-semibold tracking-wider text-text-muted uppercase">
        {icon} {label}
      </p>
      <p className="mt-0.5 truncate font-manrope text-[13px] text-text-main">{value}</p>
    </div>
  );
}

function AssignRow({
  c,
  slot,
  label,
  hint,
  tone,
}: {
  c: CaseFile;
  slot: StaffSlot;
  label: string;
  hint: string;
  tone: string;
}) {
  const current = c.assignee[slot];
  const staff = STAFF.filter((s) => s.role === slot);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
      <Avatar name={current ? STAFF.find((s) => s.id === current)?.name : null} />
      <div className="min-w-0 flex-1">
        <p className="font-manrope text-sm font-semibold text-text-main">
          {label} <span className="font-normal text-text-muted">· {tone}</span>
        </p>
        <p className="font-manrope text-[11px] text-text-muted">{hint}</p>
      </div>
      <Select
        value={current ?? "none"}
        onValueChange={(v) => adminStore.assign(c.id, slot, v === "none" ? null : v)}
      >
        <SelectTrigger className="h-8 w-40 font-manrope text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Belum ditugaskan</SelectItem>
          {staff.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

