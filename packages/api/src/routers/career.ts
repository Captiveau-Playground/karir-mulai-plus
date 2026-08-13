import { createDb } from "@karir-mulai-plus/db";
import {
  application,
  audit,
  booking,
  cvDraft,
  profile,
  roadmapItem,
  userStat,
  verifiedSkill,
} from "@karir-mulai-plus/db/schema/career";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

const profileInput = z.object({
  name: z.string(),
  email: z.string().optional(),
  currentRole: z.string().optional(),
  yearsExp: z.number().optional(),
  interest: z.string().optional(),
  skills: z.array(z.string()).optional(),
  riasec: z.string().optional(),
  gradYear: z.number().optional(),
  onboardedAt: z.number().optional(),
});

const auditInput = z.object({
  id: z.string(),
  at: z.number(),
  inputType: z.string().optional(),
  fileName: z.string().optional(),
  text: z.string().optional(),
  roleTarget: z.string().optional(),
  score: z.number().optional(),
  breakdown: z
    .object({
      structure: z.number(),
      keywords: z.number(),
      impact: z.number(),
      customization: z.number(),
    })
    .optional(),
});

const applicationInput = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  stage: z.string(),
  date: z.string(),
  notes: z.string().optional(),
  at: z.number(),
});

const bookingInput = z.object({
  id: z.string(),
  mentorId: z.string().optional(),
  mentorName: z.string(),
  date: z.string(),
  slot: z.string(),
  priceIdr: z.number(),
  status: z.string(),
  rating: z.number().optional(),
  review: z.string().optional(),
  at: z.number(),
});

/** Router entity karier MULAI+ — semua protected (butuh login). */
export const careerRouter = {
  /** Ambil seluruh data user dari D1 (dipakai saat login/pull). */
  getMyData: protectedProcedure.handler(async ({ context }) => {
    const db = createDb();
    const userId = context.session.user.id;

    const [prof] = await db.select().from(profile).where(eq(profile.id, userId)).limit(1);
    const audits = await db
      .select()
      .from(audit)
      .where(eq(audit.userId, userId))
      .orderBy(desc(audit.at));
    const applications = await db
      .select()
      .from(application)
      .where(eq(application.userId, userId))
      .orderBy(desc(application.at));
    const bookings = await db
      .select()
      .from(booking)
      .where(eq(booking.userId, userId))
      .orderBy(desc(booking.at));
    const verifiedSkills = await db.select().from(verifiedSkill).where(eq(verifiedSkill.userId, userId));
    const roadmapItems = await db.select().from(roadmapItem).where(eq(roadmapItem.userId, userId));
    const [stats] = await db.select().from(userStat).where(eq(userStat.userId, userId)).limit(1);
    const [draft] = await db.select().from(cvDraft).where(eq(cvDraft.userId, userId)).limit(1);

    return {
      profile: prof ?? null,
      audits,
      applications,
      bookings,
      verifiedSkills,
      roadmapItems,
      stats: stats ?? null,
      cvDraft: draft ?? null,
    };
  }),

  /** Simpan profil karier (upsert). */
  saveProfile: protectedProcedure
    .input(profileInput)
    .handler(async ({ context, input }) => {
      const db = createDb();
      const userId = context.session.user.id;
      await db
        .insert(profile)
        .values({
          id: userId,
          name: input.name,
          email: input.email ?? null,
          currentRole: input.currentRole ?? null,
          yearsExp: input.yearsExp ?? 0,
          interest: input.interest ?? null,
          skillsJson: input.skills ? JSON.stringify(input.skills) : "[]",
          riasec: input.riasec ?? null,
          gradYear: input.gradYear ?? null,
          onboardedAt: input.onboardedAt ?? Date.now(),
        })
        .onConflictDoUpdate({
          target: profile.id,
          set: {
            name: input.name,
            email: input.email ?? null,
            currentRole: input.currentRole ?? null,
            yearsExp: input.yearsExp ?? 0,
            interest: input.interest ?? null,
            skillsJson: input.skills ? JSON.stringify(input.skills) : "[]",
            riasec: input.riasec ?? null,
            gradYear: input.gradYear ?? null,
          },
        });
      return { ok: true };
    }),

  /** Simpan hasil audit CV. */
  saveAudit: protectedProcedure
    .input(auditInput)
    .handler(async ({ context, input }) => {
      const db = createDb();
      const userId = context.session.user.id;
      await db
        .insert(audit)
        .values({
          id: input.id,
          userId,
          at: input.at,
          inputType: input.inputType ?? null,
          fileName: input.fileName ?? null,
          text: input.text ?? null,
          roleTarget: input.roleTarget ?? null,
          score: input.score ?? 0,
          structure: input.breakdown?.structure ?? 0,
          keywords: input.breakdown?.keywords ?? 0,
          impact: input.breakdown?.impact ?? 0,
          customization: input.breakdown?.customization ?? 0,
        })
        .onConflictDoNothing();
      return { ok: true };
    }),

  /** Simpan lamaran (upsert by id). */
  saveApplication: protectedProcedure
    .input(applicationInput)
    .handler(async ({ context, input }) => {
      const db = createDb();
      const userId = context.session.user.id;
      await db
        .insert(application)
        .values({ ...input, userId, notes: input.notes ?? null })
        .onConflictDoUpdate({
          target: application.id,
          set: {
            role: input.role,
            company: input.company,
            stage: input.stage,
            date: input.date,
            notes: input.notes ?? null,
          },
        });
      return { ok: true };
    }),

  /** Simpan booking mentor (upsert by id). */
  saveBooking: protectedProcedure
    .input(bookingInput)
    .handler(async ({ context, input }) => {
      const db = createDb();
      const userId = context.session.user.id;
      await db
        .insert(booking)
        .values({
          ...input,
          userId,
          mentorId: input.mentorId ?? null,
          rating: input.rating ?? null,
          review: input.review ?? null,
        })
        .onConflictDoUpdate({
          target: booking.id,
          set: {
            mentorName: input.mentorName,
            date: input.date,
            slot: input.slot,
            priceIdr: input.priceIdr,
            status: input.status,
            rating: input.rating ?? null,
            review: input.review ?? null,
          },
        });
      return { ok: true };
    }),
};
