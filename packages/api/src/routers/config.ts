import { createDb } from "@karir-mulai-plus/db";
import {
  appConfig,
  blogPost,
  configAuditLog,
} from "@karir-mulai-plus/db/schema/config";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { managerProcedure, publicProcedure } from "../index";

/* ============================================================
 * Router konfigurasi dinamis + konten (backoffice).
 * - public  : client baca bundle konfig untuk render halaman
 * - manager : CRUD konfig (market, mentor, blog, landing)
 * - audit   : setiap perubahan dicatat (semua role bisa baca,
 *             hapus khusus superadmin — pakai adminProcedure di router admin)
 * ============================================================ */

const configInput = z.object({
  key: z.string().min(1),
  category: z.string().min(1),
  value: z.unknown(), // JSON-serializable apa saja
});

const blogInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  imageUrl: z.string().optional(),
  date: z.string().optional(),
  readMinutes: z.number().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

/** Catat audit log. */
async function logAudit(
  actorId: string | null,
  actorName: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  before: unknown,
  after: unknown,
) {
  const db = createDb();
  await db.insert(configAuditLog).values({
    id: crypto.randomUUID(),
    actorId,
    actorName,
    action,
    entity,
    entityId,
    before: before === undefined ? null : JSON.stringify(before),
    after: after === undefined ? null : JSON.stringify(after),
    at: new Date(),
  });
}

export const configRouter = {
  /** Ambil satu konfig berdasarkan key (untuk render halaman). */
  get: publicProcedure
    .input(z.object({ key: z.string() }))
    .handler(async ({ input }) => {
      const db = createDb();
      const row = await db
        .select({ value: appConfig.value, updatedAt: appConfig.updatedAt })
        .from(appConfig)
        .where(eq(appConfig.key, input.key));
      if (!row[0]) return null;
      return { value: JSON.parse(row[0].value) as unknown, updatedAt: row[0].updatedAt };
    }),

  /** Ambil semua konfig dalam satu kategori (bundle untuk halaman). */
  getCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .handler(async ({ input }) => {
      const db = createDb();
      const rows = await db
        .select({ key: appConfig.key, value: appConfig.value, updatedAt: appConfig.updatedAt })
        .from(appConfig)
        .where(eq(appConfig.category, input.category));
      return rows.map((r) => ({
        key: r.key,
        value: JSON.parse(r.value) as unknown,
        updatedAt: r.updatedAt,
      }));
    }),

  /** List semua konfig (untuk backoffice table). */
  list: managerProcedure
    .input(
      z.object({
        category: z.string().optional(),
        page: z.number().default(0),
        limit: z.number().default(50),
      }),
    )
    .handler(async ({ input }) => {
      const db = createDb();
      const base = db
        .select({
          key: appConfig.key,
          category: appConfig.category,
          value: appConfig.value,
          updatedBy: appConfig.updatedBy,
          updatedAt: appConfig.updatedAt,
        })
        .from(appConfig);
      const rows = input.category
        ? await base.where(eq(appConfig.category, input.category)).limit(input.limit).offset(input.page * input.limit)
        : await base.limit(input.limit).offset(input.page * input.limit);
      return {
        items: rows.map((r) => ({ ...r, value: JSON.parse(r.value) as unknown })),
        page: input.page,
        limit: input.limit,
      };
    }),

  /** Simpan konfig (upsert). Menulis ke audit log. */
  set: managerProcedure
    .input(configInput)
    .handler(async ({ input, context }) => {
      const db = createDb();
      const actor = context.session?.user;
      const before = await db
        .select({ value: appConfig.value })
        .from(appConfig)
        .where(eq(appConfig.key, input.key));
      const beforeValue = before[0] ? JSON.parse(before[0].value) : undefined;

      await db
        .insert(appConfig)
        .values({
          key: input.key,
          category: input.category,
          value: JSON.stringify(input.value),
          updatedBy: actor?.id ?? null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: appConfig.key,
          set: {
            value: JSON.stringify(input.value),
            category: input.category,
            updatedBy: actor?.id ?? null,
            updatedAt: new Date(),
          },
        });

      await logAudit(
        actor?.id ?? null,
        actor?.name ?? null,
        before[0] ? "update" : "create",
        input.category,
        input.key,
        beforeValue,
        input.value,
      );

      return { success: true, key: input.key };
    }),

  /** Hapus konfig. */
  remove: managerProcedure
    .input(z.object({ key: z.string() }))
    .handler(async ({ input, context }) => {
      const db = createDb();
      const actor = context.session?.user;
      const before = await db
        .select({ value: appConfig.value, category: appConfig.category })
        .from(appConfig)
        .where(eq(appConfig.key, input.key));
      if (!before[0]) return { success: false, message: "tidak ada" };

      await db.delete(appConfig).where(eq(appConfig.key, input.key));
      await logAudit(
        actor?.id ?? null,
        actor?.name ?? null,
        "delete",
        before[0].category,
        input.key,
        JSON.parse(before[0].value),
        undefined,
      );
      return { success: true, key: input.key };
    }),

  /* ---------------- Blog ---------------- */

  blogList: managerProcedure
    .input(
      z.object({
        status: z.enum(["all", "draft", "published"]).default("all"),
        page: z.number().default(0),
        limit: z.number().default(50),
      }),
    )
    .handler(async ({ input }) => {
      const db = createDb();
      const base = db.select().from(blogPost);
      const rows =
        input.status === "all"
          ? await base.orderBy(desc(blogPost.createdAt)).limit(input.limit).offset(input.page * input.limit)
          : await base
              .where(eq(blogPost.status, input.status))
              .orderBy(desc(blogPost.createdAt))
              .limit(input.limit)
              .offset(input.page * input.limit);
      return { items: rows, page: input.page, limit: input.limit };
    }),

  blogGet: managerProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const db = createDb();
      const row = await db.select().from(blogPost).where(eq(blogPost.id, input.id));
      return row[0] ?? null;
    }),

  blogSave: managerProcedure
    .input(blogInput)
    .handler(async ({ input, context }) => {
      const db = createDb();
      const actor = context.session?.user;
      if (input.id) {
        const before = await db.select().from(blogPost).where(eq(blogPost.id, input.id));
        await db
          .update(blogPost)
          .set({
            title: input.title,
            slug: input.slug,
            excerpt: input.excerpt ?? null,
            content: input.content ?? null,
            category: input.category ?? "Career",
            tag: input.tag ?? "Artikel",
            imageUrl: input.imageUrl ?? null,
            date: input.date ?? null,
            readMinutes: input.readMinutes ?? 3,
            status: input.status ?? "draft",
            updatedAt: new Date(),
          })
          .where(eq(blogPost.id, input.id));
        await logAudit(
          actor?.id ?? null,
          actor?.name ?? null,
          "update",
          "blog",
          input.id,
          before[0],
          input,
        );
        return { success: true, id: input.id };
      }
      const id = crypto.randomUUID();
      await db.insert(blogPost).values({
        id,
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt ?? null,
        content: input.content ?? null,
        category: input.category ?? "Career",
        tag: input.tag ?? "Artikel",
        imageUrl: input.imageUrl ?? null,
        date: input.date ?? null,
        readMinutes: input.readMinutes ?? 3,
        status: input.status ?? "draft",
        createdBy: actor?.id ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await logAudit(
        actor?.id ?? null,
        actor?.name ?? null,
        "create",
        "blog",
        id,
        undefined,
        input,
      );
      return { success: true, id };
    }),

  blogDelete: managerProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const db = createDb();
      const actor = context.session?.user;
      const before = await db.select().from(blogPost).where(eq(blogPost.id, input.id));
      if (!before[0]) return { success: false };
      await db.delete(blogPost).where(eq(blogPost.id, input.id));
      await logAudit(actor?.id ?? null, actor?.name ?? null, "delete", "blog", input.id, before[0], undefined);
      return { success: true, id: input.id };
    }),

  /** Blog published — untuk halaman publik (client baca). */
  blogPublished: publicProcedure.handler(async () => {
    const db = createDb();
    const rows = await db
      .select()
      .from(blogPost)
      .where(eq(blogPost.status, "published"))
      .orderBy(desc(blogPost.createdAt));
    return rows;
  }),

  /* ---------------- Audit log ---------------- */

  auditLog: managerProcedure
    .input(
      z.object({
        entity: z.string().optional(),
        page: z.number().default(0),
        limit: z.number().default(30),
      }),
    )
    .handler(async ({ input }) => {
      const db = createDb();
      const base = db.select().from(configAuditLog);
      const rows = input.entity
        ? await base.where(eq(configAuditLog.entity, input.entity)).orderBy(desc(configAuditLog.at)).limit(input.limit).offset(input.page * input.limit)
        : await base.orderBy(desc(configAuditLog.at)).limit(input.limit).offset(input.page * input.limit);
      return rows;
    }),
};
