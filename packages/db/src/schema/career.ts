import { relations } from "drizzle-orm";
import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

/* ============================================================
 * Entity MULAI+ — data karier user (profil, audit, lamaran,
 * booking, coach, skill terverifikasi, roadmap, statistik, CV)
 * ============================================================ */

/** Profil karier (dari onboarding + RIASEC). 1:1 dengan auth user. */
export const profile = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  currentRole: text("current_role"),
  yearsExp: integer("years_exp").default(0),
  interest: text("interest"),
  skillsJson: text("skills_json").default("[]"),
  riasec: text("riasec"),
  gradYear: integer("grad_year"),
  onboardedAt: integer("onboarded_at"),
});

/** Riwayat audit CV (teks penuh untuk korelasi & builder). */
export const audit = sqliteTable(
  "audits",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    at: integer("at").notNull(),
    inputType: text("input_type"),
    fileName: text("file_name"),
    text: text("text"),
    roleTarget: text("role_target"),
    score: integer("score"),
    structure: integer("structure"),
    keywords: integer("keywords"),
    impact: integer("impact"),
    customization: integer("customization"),
  },
  (t) => [index("audits_user_idx").on(t.userId, t.at)],
);

/** Lamaran tracker. */
export const application = sqliteTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role"),
    company: text("company"),
    stage: text("stage"),
    date: text("date"),
    notes: text("notes"),
    at: integer("at").notNull(),
  },
  (t) => [index("applications_user_idx").on(t.userId, t.at)],
);

/** Booking mentor + rating. */
export const booking = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mentorId: text("mentor_id"),
    mentorName: text("mentor_name"),
    date: text("date"),
    slot: text("slot"),
    priceIdr: integer("price_idr"),
    status: text("status"),
    rating: integer("rating"),
    review: text("review"),
    at: integer("at").notNull(),
  },
  (t) => [index("bookings_user_idx").on(t.userId, t.at)],
);

/** Percakapan coach. */
export const coachMessage = sqliteTable(
  "coach_messages",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role"),
    text: text("text"),
    at: integer("at").notNull(),
  },
  (t) => [index("coach_user_idx").on(t.userId, t.at)],
);

/** Skill terverifikasi (quiz). */
export const verifiedSkill = sqliteTable(
  "verified_skills",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    skill: text("skill"),
    score: integer("score"),
    at: integer("at").notNull(),
  },
  (t) => [index("verified_skills_user_idx").on(t.userId)],
);

/** Progress roadmap. */
export const roadmapItem = sqliteTable(
  "roadmap_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    pathId: text("path_id"),
    label: text("label"),
    done: integer("done").default(0),
  },
  (t) => [uniqueIndex("roadmap_user_item_idx").on(t.userId, t.pathId, t.label)],
);

/** Statistik & gamifikasi. */
export const userStat = sqliteTable("user_stats", {
  userId: text("user_id").primaryKey(),
  xp: integer("xp").default(0),
  streak: integer("streak").default(0),
  lastActiveDay: text("last_active_day"),
  premium: integer("premium").default(0),
  digest: integer("digest").default(0),
  referralCode: text("referral_code"),
  quizzesTaken: integer("quizzes_taken").default(0),
  interviewsDone: integer("interviews_done").default(0),
});

/** Draft CV builder (JSON). */
export const cvDraft = sqliteTable("cv_drafts", {
  userId: text("user_id").primaryKey(),
  draftJson: text("draft_json"),
  updatedAt: integer("updated_at"),
});

/* Relations ringkas */
export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, { fields: [profile.id], references: [user.id] }),
}));
