/* ============================================================
 * Lapisan sinkronisasi web ↔ server (oRPC → Hono → D1).
 * Pola local-first: localStorage = cache offline instan,
 * server = sumber kebenaran saat login.
 * ============================================================ */

import { client } from "@/utils/orpc";
import { db, type Application, type AuditRecord, type BookingRecord, type Profile } from "@/lib/db";
import { authClient } from "@/lib/auth-client";

/** True jika user sedang login (session aktif). */
async function isAuthed(): Promise<boolean> {
  try {
    const { data } = await authClient.getSession();
    return !!data;
  } catch {
    return false;
  }
}

/** Jalankan fn hanya jika login; error server ditelan (best-effort). */
async function push(fn: () => Promise<unknown>) {
  if (!(await isAuthed())) return;
  try {
    await fn();
  } catch (e) {
    console.error("[sync] push gagal:", e);
  }
}

export async function pullFromServer() {
  if (!(await isAuthed())) return;
  try {
    const data = await client.career.getMyData();
    db.hydrate({
      profile: data.profile
        ? {
            id: data.profile.id,
            name: data.profile.name,
            email: data.profile.email ?? "",
            currentRole: data.profile.currentRole ?? "",
            yearsExp: data.profile.yearsExp ?? 0,
            interest: data.profile.interest ?? "Product",
            skills: JSON.parse(data.profile.skillsJson ?? "[]") as string[],
            riasec: data.profile.riasec ?? "",
            onboardedAt: data.profile.onboardedAt ?? Date.now(),
            ...(data.profile.gradYear != null ? { gradYear: data.profile.gradYear } : {}),
          }
        : null,
      audits: data.audits.map(
        (a): AuditRecord => ({
          id: a.id,
          at: a.at,
          inputType: a.inputType === "file" ? "file" : "text",
          ...(a.fileName ? { fileName: a.fileName } : {}),
          textSample: (a.text ?? "").slice(0, 160),
          ...(a.text ? { text: a.text } : {}),
          roleTarget: a.roleTarget ?? "",
          score: a.score ?? 0,
          breakdown: {
            structure: a.structure ?? 0,
            keywords: a.keywords ?? 0,
            impact: a.impact ?? 0,
            customization: a.customization ?? 0,
          },
        }),
      ),
      applications: data.applications.map(
        (a): Application => ({
          id: a.id,
          role: a.role ?? "",
          company: a.company ?? "",
          stage: (a.stage as Application["stage"]) ?? "draft",
          date: a.date ?? "",
          ...(a.notes ? { notes: a.notes } : {}),
          at: a.at,
        }),
      ),
      bookings: data.bookings.map(
        (b): BookingRecord => ({
          id: b.id,
          mentorId: b.mentorId ?? "",
          mentorName: b.mentorName ?? "",
          date: b.date ?? "",
          slot: b.slot ?? "",
          priceIdr: b.priceIdr ?? 0,
          status: b.status === "done" ? "done" : "booked",
          ...(b.rating != null ? { rating: b.rating } : {}),
          ...(b.review ? { review: b.review } : {}),
          at: b.at,
        }),
      ),
    });
  } catch (e) {
    console.error("[sync] pull gagal:", e);
  }
}

export function pushProfile(p: Profile) {
  void push(() =>
    client.career.saveProfile({
      name: p.name,
      email: p.email,
      currentRole: p.currentRole,
      yearsExp: p.yearsExp,
      interest: p.interest,
      skills: p.skills,
      riasec: p.riasec,
      ...(p.gradYear != null ? { gradYear: p.gradYear } : {}),
      onboardedAt: p.onboardedAt,
    }),
  );
}

export function pushAudit(a: AuditRecord) {
  void push(() =>
    client.career.saveAudit({
      id: a.id,
      at: a.at,
      inputType: a.inputType,
      ...(a.fileName ? { fileName: a.fileName } : {}),
      ...(a.text ? { text: a.text } : {}),
      roleTarget: a.roleTarget,
      score: a.score,
      breakdown: a.breakdown,
    }),
  );
}

export function pushApplication(a: Application) {
  void push(() =>
    client.career.saveApplication({
      id: a.id,
      role: a.role,
      company: a.company,
      stage: a.stage,
      date: a.date,
      ...(a.notes ? { notes: a.notes } : {}),
      at: a.at,
    }),
  );
}

export function pushBooking(b: BookingRecord) {
  void push(() =>
    client.career.saveBooking({
      id: b.id,
      mentorId: b.mentorId,
      mentorName: b.mentorName,
      date: b.date,
      slot: b.slot,
      priceIdr: b.priceIdr,
      status: b.status,
      ...(b.rating != null ? { rating: b.rating } : {}),
      ...(b.review ? { review: b.review } : {}),
      at: b.at,
    }),
  );
}
