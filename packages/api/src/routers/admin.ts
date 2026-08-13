import { createDb } from "@karir-mulai-plus/db";
import {
  account,
  session,
  user,
} from "@karir-mulai-plus/db/schema/auth";
import { count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { adminProcedure } from "../index";

/**
 * Router admin MULAI+ Career — semua butuh role "admin".
 * Gunakan untuk kelola user & lihat statistik platform.
 */
export const adminRouter = {
  /** Daftar semua user (pagination). */
  listUsers: adminProcedure
    .input(
      z.object({
        page: z.number().default(0),
        limit: z.number().default(20),
      }),
    )
    .handler(async ({ input }) => {
      const db = createDb();
      const rows = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          banned: user.banned,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(input.limit)
        .offset(input.page * input.limit);

      const totalRows = await db.select({ value: count() }).from(user);
      const total = totalRows[0]?.value ?? 0;

      return { users: rows, total, page: input.page, limit: input.limit };
    }),

  /** Update role user (mis. jadikan admin / turunkan). */
  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "admin"]),
      }),
    )
    .handler(async ({ input }) => {
      const db = createDb();
      await db
        .update(user)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(user.id, input.userId));
      return { success: true, userId: input.userId, role: input.role };
    }),

  /** Ban / unban user. */
  setBan: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banned: z.boolean(),
        reason: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const db = createDb();
      await db
        .update(user)
        .set({
          banned: input.banned,
          banReason: input.banned ? (input.reason ?? null) : null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.userId));
      return { success: true, userId: input.userId, banned: input.banned };
    }),

  /** Statistik ringkas platform (user, session, dll). */
  stats: adminProcedure.handler(async () => {
    const db = createDb();
    const userRows = await db.select({ value: count() }).from(user);
    const sessionRows = await db.select({ value: count() }).from(session);
    const accountRows = await db.select({ value: count() }).from(account);
    return {
      totalUsers: userRows[0]?.value ?? 0,
      totalSessions: sessionRows[0]?.value ?? 0,
      totalAccounts: accountRows[0]?.value ?? 0,
    };
  }),
};
