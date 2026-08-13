import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/* ============================================================
 * Konfigurasi dinamis + konten + audit trail
 * untuk backoffice MULAI+ Career (superadmin & manager).
 *
 * Strategi: JSON key-value untuk konfig fleksibel (market,
 * mentor, landing, dll) + tabel khusus untuk entitas yang
 * butuh listing/filter/status (blog). Semua perubahan
 * dicatat di config_audit_log.
 * ============================================================ */

/** Penyimpanan generik konfig — value adalah JSON string. */
export const appConfig = sqliteTable(
  "app_config",
  {
    key: text("key").primaryKey(),
    category: text("category").notNull(),
    value: text("value").notNull(), // JSON string
    updatedBy: text("updated_by").references(() => user.id, { onDelete: "set null" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index("app_config_category_idx").on(t.category)],
);

/** Postingan blog. */
export const blogPost = sqliteTable(
  "blog_posts",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    content: text("content"),
    category: text("category").default("Career"),
    tag: text("tag").default("Artikel"),
    imageUrl: text("image_url"),
    date: text("date"),
    readMinutes: integer("read_minutes").default(3),
    status: text("status").default("draft").notNull(), // published | draft
    createdBy: text("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [uniqueIndex("blog_posts_slug_idx").on(t.slug)],
);

/** Audit trail semua perubahan konfig. */
export const configAuditLog = sqliteTable(
  "config_audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
    actorName: text("actor_name"),
    action: text("action").notNull(), // create | update | delete
    entity: text("entity").notNull(), // market.roleSignals | blog_posts | ...
    entityId: text("entity_id"),
    before: text("before"), // JSON
    after: text("after"), // JSON
    at: integer("at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index("audit_log_entity_idx").on(t.entity, t.at), index("audit_log_actor_idx").on(t.actorId)],
);

export const appConfigRelations = relations(appConfig, ({ one }) => ({
  updater: one(user, { fields: [appConfig.updatedBy], references: [user.id] }),
}));

export const blogPostRelations = relations(blogPost, ({ one }) => ({
  author: one(user, { fields: [blogPost.createdBy], references: [user.id] }),
}));

export const auditLogRelations = relations(configAuditLog, ({ one }) => ({
  actor: one(user, { fields: [configAuditLog.actorId], references: [user.id] }),
}));
