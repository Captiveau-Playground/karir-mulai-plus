/* ============================================================
 * MULAI+ OPS — data & logika panel internal "Intensive CV Review".
 *
 * Alur bisnis yang dimodelkan (mirip project management):
 *   intake  → klien submit CV, akun dibuat
 *   triage  → klasifikasi AI (dummy): rusak / lumayan / bagus
 *   review  → reviewer baca CV + tulis catatan intensif
 *   production → writer menyempurnakan CV baru (ID/EN) + surat lamaran (ID/EN)
 *   qa      → QA internal cek mutu sebelum terbit
 *   revision→ klien minta perbaikan
 *   published → rilis terkirim ke klien
 *
 * Semua fungsi di sini deterministik (pakai ADMIN_NOW, bukan Date.now())
 * supaya render SSR & client identik.
 * ============================================================ */

import { scoreCv, type CvBreakdown } from "@/lib/engine";

/**
 * Titik acuan waktu untuk seluruh data contoh. Di-anchor ke "hari ini 09:24"
 * supaya SLA & tenggat selalu relevan, tapi tetap deterministik dalam satu hari
 * (SSR dan klien menghasilkan nilai yang sama → tidak ada hydration mismatch).
 */
function anchorNow(): number {
  const d = new Date();
  d.setHours(9, 24, 0, 0);
  return d.getTime();
}

export const ADMIN_NOW = anchorNow();
const HOUR = 3_600_000;
const MIN = 60_000;
const ago = (h: number) => ADMIN_NOW - h * HOUR;

/* ------------------------------------------------------------
 * Tahapan pipeline
 * ---------------------------------------------------------- */

export type StageKey =
  | "intake"
  | "triage"
  | "review"
  | "production"
  | "qa"
  | "revision"
  | "published";

export type StageTone = "muted" | "brand" | "coral" | "warning" | "success";

export type StageDef = {
  key: StageKey;
  label: string;
  short: string;
  hint: string;
  tone: StageTone;
  owner: "system" | "reviewer" | "writer" | "qa" | "client";
};

export const STAGES: StageDef[] = [
  {
    key: "intake",
    label: "CV Masuk",
    short: "Intake",
    hint: "Klien baru submit, belum ditriage",
    tone: "muted",
    owner: "system",
  },
  {
    key: "triage",
    label: "Klasifikasi AI",
    short: "AI",
    hint: "AI menilai tipe CV — perlu konfirmasi reviewer",
    tone: "brand",
    owner: "reviewer",
  },
  {
    key: "review",
    label: "Review Intensif",
    short: "Review",
    hint: "Reviewer menganalisis & menulis catatan",
    tone: "brand",
    owner: "reviewer",
  },
  {
    key: "production",
    label: "Produksi Dokumen",
    short: "Produksi",
    hint: "Writer menyusun CV ID/EN + surat lamaran ID/EN",
    tone: "coral",
    owner: "writer",
  },
  {
    key: "qa",
    label: "QA Internal",
    short: "QA",
    hint: "Cek ATS, konsistensi, dan bahasa sebelum terbit",
    tone: "warning",
    owner: "qa",
  },
  {
    key: "revision",
    label: "Revisi Klien",
    short: "Revisi",
    hint: "Ada permintaan perbaikan dari klien",
    tone: "coral",
    owner: "client",
  },
  {
    key: "published",
    label: "Terbit",
    short: "Terbit",
    hint: "Deliverable sudah dikirim ke klien",
    tone: "success",
    owner: "system",
  },
];

export const STAGE_MAP: Record<StageKey, StageDef> = Object.fromEntries(
  STAGES.map((s) => [s.key, s]),
) as Record<StageKey, StageDef>;

export const STAGE_ORDER: StageKey[] = STAGES.map((s) => s.key);

export function nextStage(stage: StageKey): StageKey | null {
  const i = STAGE_ORDER.indexOf(stage);
  if (i < 0 || i >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[i + 1] ?? null;
}

export function stageIndex(stage: StageKey): number {
  return STAGE_ORDER.indexOf(stage);
}

/** Tahap lanjutan = sudah masuk produksi/QA/terbit. */
export const isDownstream = (s: StageKey) =>
  s === "production" || s === "qa" || s === "revision" || s === "published";

/* ------------------------------------------------------------
 * Klasifikasi AI (dummy) — rusak / lumayan / bagus
 * ---------------------------------------------------------- */

export type CvGradeKey = "rusak" | "lumayan" | "bagus";

export type GradeDef = {
  key: CvGradeKey;
  label: string;
  headline: string;
  description: string;
  tone: "destructive" | "warning" | "success";
  effortHours: number;
};

export const GRADES: GradeDef[] = [
  {
    key: "rusak",
    label: "Rusak",
    headline: "Perlu perombakan menyeluruh",
    description:
      "Struktur, keyword ATS, dan dampak terukur semuanya lemah. Butuh penulisan ulang dari nol.",
    tone: "destructive",
    effortHours: 4.5,
  },
  {
    key: "lumayan",
    label: "Lumayan",
    headline: "Layak, perlu penajaman",
    description:
      "Fondasi sudah ada tapi belum tajam: keyword role kurang, pencapaian belum terukur konsisten.",
    tone: "warning",
    effortHours: 2.5,
  },
  {
    key: "bagus",
    label: "Bagus",
    headline: "Kuat, siap dipoles",
    description:
      "Struktur lengkap dan banyak metrik. Pekerjaan utama: penyelarasan role target + versi EN.",
    tone: "success",
    effortHours: 1.5,
  },
];

export const GRADE_MAP: Record<CvGradeKey, GradeDef> = Object.fromEntries(
  GRADES.map((g) => [g.key, g]),
) as Record<CvGradeKey, GradeDef>;

/** Ambang batas skor → tipe CV. */
export function gradeFromScore(score: number): CvGradeKey {
  if (score < 45) return "rusak";
  if (score < 75) return "lumayan";
  return "bagus";
}

export type AiSeverity = "blocker" | "major" | "minor";

export type AiIssue = {
  code: string;
  section: string;
  severity: AiSeverity;
  detail: string;
  fix: string;
};

export type AiSignal = {
  label: string;
  detail: string;
  kind: "strength" | "risk";
};

export type AiClassification = {
  score: number;
  grade: CvGradeKey;
  confidence: number;
  model: string;
  label: string;
  verdict: string;
  breakdown: CvBreakdown;
  metricsFound: number;
  foundKeywords: string[];
  missingKeywords: string[];
  issues: AiIssue[];
  signals: AiSignal[];
  effortHours: number;
  extractionQuality: "baik" | "sedang" | "rendah";
  at: number;
  humanConfirmed: boolean;
  overrideNote: string | null;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const SEVERITY_OF_PRIORITY: Record<string, AiSeverity> = {
  high: "blocker",
  medium: "major",
  low: "minor",
};

/**
 * "AI" klasifikasi CV — versi dummy yang deterministik.
 * Memakai mesin skor yang sama dengan fitur audit publik supaya hasil
 * antara sisi user & sisi ops tidak pernah bertentangan.
 */
export function classifyCv(
  text: string,
  roleTarget: string,
  opts: { at?: number; humanConfirmed?: boolean } = {},
): AiClassification {
  const r = scoreCv(text, roleTarget);
  const grade = gradeFromScore(r.overallScore);
  const low = text.trim().length;

  const issues: AiIssue[] = r.feedback.map((f, i) => ({
    code: `ISS-${String(i + 1).padStart(2, "0")}`,
    section: f.section,
    severity: SEVERITY_OF_PRIORITY[f.priority] ?? "minor",
    detail: f.issue,
    fix: f.suggestion,
  }));

  const hasContact = /(@|\+62|08\d{2}[\s-]?\d{3,4})/.test(text);
  const hasDates = /\b(19|20)\d{2}\b/.test(text);
  const longBullets = text
    .split(/\n+/)
    .filter((l) => l.trim().length > 220).length;

  if (!hasContact) {
    issues.push({
      code: "ISS-C1",
      section: "Kontak",
      severity: "blocker",
      detail: "Tidak ada email/telepon yang bisa dibaca otomatis oleh ATS.",
      fix: "Tambahkan baris kontak: email profesional, nomor WhatsApp, kota, dan tautan LinkedIn.",
    });
  }
  if (!hasDates) {
    issues.push({
      code: "ISS-D1",
      section: "Timeline",
      severity: "major",
      detail: "Tidak ada rentang tahun pada pengalaman/pendidikan.",
      fix: "Tulis periode (bulan tahun – bulan tahun) di setiap posisi agar ATS menghitung masa kerja.",
    });
  }
  if (longBullets > 0) {
    issues.push({
      code: "ISS-L1",
      section: "Formatting",
      severity: "minor",
      detail: `${longBullets} bullet terlalu panjang sehingga sulit dipindai recruiter.`,
      fix: "Pecah menjadi bullet maksimal 2 baris, awali dengan verba hasil.",
    });
  }

  const concerns = issues.filter((i) => i.severity === "blocker").length;
  const extractionQuality: AiClassification["extractionQuality"] =
    low < 260 ? "rendah" : low < 900 ? "sedang" : "baik";

  const confidence = clamp(
    Math.round(64 + Math.min(28, low / 70) - concerns * 3 - (extractionQuality === "rendah" ? 18 : 0)),
    41,
    98,
  );

  const signals: AiSignal[] = [];
  if (r.keywordHitRate >= 0.5)
    signals.push({
      label: `Keyword ${roleTarget} kuat`,
      detail: `${Math.round(r.keywordHitRate * 100)}% keyword role target terdeteksi di CV.`,
      kind: "strength",
    });
  if (r.metricsFound >= 3)
    signals.push({
      label: "Dampak terukur",
      detail: `${r.metricsFound} metrik angka ditemukan (target minimal 4 per CV).`,
      kind: "strength",
    });
  if (r.breakdown.structure >= 75)
    signals.push({
      label: "Struktur lengkap",
      detail: "Bagian utama CV terdeteksi ATS dan urutannya wajar.",
      kind: "strength",
    });
  if (r.breakdown.keywords < 50)
    signals.push({
      label: "Keyword ATS tipis",
      detail: `Skor keyword ${r.breakdown.keywords}/100 — CV berisiko tersaring sebelum dibaca manusia.`,
      kind: "risk",
    });
  if (r.breakdown.impact < 60)
    signals.push({
      label: "Pencapaian belum terukur",
      detail: "Banyak bullet masih berisi tugas, bukan hasil. Perlu tambah angka.",
      kind: "risk",
    });
  if (extractionQuality === "rendah")
    signals.push({
      label: "Ekstraksi teks rendah",
      detail: "Kemungkinan PDF hasil scan / tabel. Minta klien kirim DOCX asli.",
      kind: "risk",
    });
  if (!hasContact)
    signals.push({
      label: "Kontak tidak terbaca",
      detail: "Email atau nomor telepon tidak terdeteksi di teks CV.",
      kind: "risk",
    });

  const gradeDef = GRADE_MAP[grade];

  return {
    score: r.overallScore,
    grade,
    confidence,
    model: "mulai-cv-classifier-v2.3",
    label: gradeDef.headline,
    verdict: r.reasoning,
    breakdown: r.breakdown,
    metricsFound: r.metricsFound,
    foundKeywords: r.foundKeywords,
    missingKeywords: r.missingKeywords,
    issues,
    signals,
    effortHours: gradeDef.effortHours,
    extractionQuality,
    at: opts.at ?? ADMIN_NOW,
    humanConfirmed: opts.humanConfirmed ?? false,
    overrideNote: null,
  };
}

/* ------------------------------------------------------------
 * Deliverable (hasil kerja yang dikirim ke klien)
 * ---------------------------------------------------------- */

export type DeliverableKey = "cv_id" | "cv_en" | "cover_id" | "cover_en";
export type DeliverableStatus = "todo" | "drafting" | "review" | "approved" | "published";

export type DeliverableDef = {
  key: DeliverableKey;
  label: string;
  short: string;
  lang: "id" | "en";
  kind: "cv" | "cover";
};

export const DELIVERABLE_DEFS: DeliverableDef[] = [
  { key: "cv_id", label: "CV — Bahasa Indonesia", short: "CV · ID", lang: "id", kind: "cv" },
  { key: "cv_en", label: "CV — English", short: "CV · EN", lang: "en", kind: "cv" },
  {
    key: "cover_id",
    label: "Surat Lamaran — Bahasa Indonesia",
    short: "Lamaran · ID",
    lang: "id",
    kind: "cover",
  },
  {
    key: "cover_en",
    label: "Cover Letter — English",
    short: "Cover · EN",
    lang: "en",
    kind: "cover",
  },
];

export const DELIVERABLE_MAP: Record<DeliverableKey, DeliverableDef> = Object.fromEntries(
  DELIVERABLE_DEFS.map((d) => [d.key, d]),
) as Record<DeliverableKey, DeliverableDef>;

export const DELIVERABLE_STATUS: Record<
  DeliverableStatus,
  { label: string; tone: StageTone }
> = {
  todo: { label: "Belum mulai", tone: "muted" },
  drafting: { label: "Draft", tone: "coral" },
  review: { label: "Menunggu review", tone: "warning" },
  approved: { label: "Disetujui", tone: "brand" },
  published: { label: "Terbit", tone: "success" },
};

export type QaCheck = { label: string; done: boolean; auto: boolean };

export type Deliverable = {
  key: DeliverableKey;
  status: DeliverableStatus;
  ownerId: string | null;
  version: number;
  updatedAt: number | null;
  wordCount: number;
  body: string;
  checks: QaCheck[];
  history: { version: number; at: number; by: string; note: string }[];
};

const QA_BASE: Record<DeliverableDef["kind"], string[]> = {
  cv: [
    "Semua bullet memakai verba hasil",
    "Tidak ada placeholder [angka] yang tersisa",
    "Keyword role target sudah masuk section Skills",
    "Kontak lengkap & tautan LinkedIn aktif",
    "Maksimal 2 halaman A4",
    "Nama perusahaan & periode konsisten",
  ],
  cover: [
    "Menyebut nama perusahaan & posisi secara spesifik",
    "Tidak menyalin isi CV mentah",
    "Panjang 250–350 kata",
    "Nada profesional, tanpa klise",
    "Ada ajakan tindak lanjut di penutup",
    "Tanggal & tanda tangan lengkap",
  ],
};

export function buildChecks(kind: DeliverableDef["kind"], body: string): QaCheck[] {
  const lines = QA_BASE[kind];
  return lines.map((label) => ({
    label,
    auto: true,
    done: checkAuto(label, body),
  }));
}

function checkAuto(label: string, body: string): boolean {
  if (!body.trim()) return false;
  switch (label) {
    case "Tidak ada placeholder [angka] yang tersisa":
      return !/\[[^\]]+\]/.test(body);
    case "Kontak lengkap & tautan LinkedIn aktif":
      return /@/.test(body) && /linkedin/i.test(body);
    case "Maksimal 2 halaman A4":
      return body.split(/\n/).length <= 92;
    case "Panjang 250–350 kata":
      return wordCount(body) >= 250 && wordCount(body) <= 350;
    case "Tidak menyalin isi CV mentah": {
      const bullets = body.split(/\n/).filter((l) => /^\s*[•\-]/.test(l)).length;
      return bullets <= 2;
    }
    case "Menyebut nama perusahaan & posisi secara spesifik":
      return /\[Nama Perusahaan\]|PT |perusahaan/i.test(body);
    case "Tanggal & tanda tangan lengkap":
      return /Hormat saya|Sincerely|Regards/i.test(body);
    default:
      return body.trim().length > 120;
  }
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/* ------------------------------------------------------------
 * Catatan review
 * ---------------------------------------------------------- */

export type NoteSeverity = "blocker" | "major" | "minor" | "praise";

export const NOTE_SEVERITY: Record<NoteSeverity, { label: string; tone: StageTone }> = {
  blocker: { label: "Blocker", tone: "coral" },
  major: { label: "Mayor", tone: "warning" },
  minor: { label: "Minor", tone: "muted" },
  praise: { label: "Kuat", tone: "success" },
};

export type ReviewNote = {
  id: string;
  at: number;
  authorId: string;
  authorName: string;
  scope: DeliverableKey | "general";
  severity: NoteSeverity;
  section: string;
  body: string;
  before: string | null;
  after: string | null;
  resolved: boolean;
  resolvedBy: string | null;
};

/* ------------------------------------------------------------
 * Aktivitas / audit trail
 * ---------------------------------------------------------- */

export type ActivityKind =
  | "intake"
  | "ai"
  | "assign"
  | "stage"
  | "note"
  | "deliverable"
  | "publish"
  | "client"
  | "sla";

export type ActivityItem = {
  id: string;
  at: number;
  kind: ActivityKind;
  actor: string;
  text: string;
};

/* ------------------------------------------------------------
 * Staff internal
 * ---------------------------------------------------------- */

export type StaffRole = "reviewer" | "writer" | "qa";

export type Staff = {
  id: string;
  name: string;
  initials: string;
  role: StaffRole;
  title: string;
  email: string;
  capacity: number;
  specialties: string[];
  online: boolean;
};

export const STAFF: Staff[] = [
  {
    id: "st-01",
    name: "Nadia Prameswari",
    initials: "NP",
    role: "reviewer",
    title: "Lead CV Reviewer",
    email: "nadia@mulaiplus.id",
    capacity: 6,
    specialties: ["Product", "Business", "Fintech"],
    online: true,
  },
  {
    id: "st-02",
    name: "Bagas Nugroho",
    initials: "BN",
    role: "reviewer",
    title: "Senior Reviewer",
    email: "bagas@mulaiplus.id",
    capacity: 6,
    specialties: ["Engineering", "Data", "Backend"],
    online: true,
  },
  {
    id: "st-03",
    name: "Sinta Rahmawati",
    initials: "SR",
    role: "reviewer",
    title: "Reviewer",
    email: "sinta@mulaiplus.id",
    capacity: 5,
    specialties: ["Design", "Marketing", "Fresh graduate"],
    online: false,
  },
  {
    id: "st-04",
    name: "Yoga Pratama",
    initials: "YP",
    role: "writer",
    title: "Senior CV Writer",
    email: "yoga@mulaiplus.id",
    capacity: 8,
    specialties: ["CV English", "Cover Letter", "ATS"],
    online: true,
  },
  {
    id: "st-05",
    name: "Melati Kusuma",
    initials: "MK",
    role: "writer",
    title: "CV Writer",
    email: "melati@mulaiplus.id",
    capacity: 7,
    specialties: ["CV Indonesia", "Fresh graduate", "Kreatif"],
    online: true,
  },
  {
    id: "st-06",
    name: "Rendra Wibisono",
    initials: "RW",
    role: "qa",
    title: "QA & Quality Lead",
    email: "rendra@mulaiplus.id",
    capacity: 10,
    specialties: ["QA akhir", "ATS audit", "Bahasa"],
    online: false,
  },
];

export const STAFF_MAP: Record<string, Staff> = Object.fromEntries(
  STAFF.map((s) => [s.id, s]),
);

export const VIEWER_ID = "st-01";

export function staffName(id: string | null): string {
  if (!id) return "Belum ditugaskan";
  return STAFF_MAP[id]?.name ?? "—";
}

/* ------------------------------------------------------------
 * Klien
 * ---------------------------------------------------------- */

export type ClientPlan = "starter" | "intensive" | "career-plus";

export const PLAN_MAP: Record<ClientPlan, { label: string; priceIdr: number }> = {
  starter: { label: "Starter", priceIdr: 249000 },
  intensive: { label: "Intensive", priceIdr: 899000 },
  "career-plus": { label: "Career+", priceIdr: 1490000 },
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  joinedAt: number;
  plan: ClientPlan;
  source: string;
  accountStatus: "aktif" | "menunggu verifikasi";
};

/* ------------------------------------------------------------
 * Kasus
 * ---------------------------------------------------------- */

export type CasePackage = "express" | "standard" | "intensive";
export type PriorityKey = "low" | "normal" | "high" | "urgent";

export const PACKAGES: Record<
  CasePackage,
  { label: string; slaHours: number; priceIdr: number; includes: string[] }
> = {
  express: {
    label: "Express",
    slaHours: 72,
    priceIdr: 249000,
    includes: ["CV Bahasa Indonesia", "Surat lamaran Bahasa Indonesia"],
  },
  standard: {
    label: "Standard",
    slaHours: 120,
    priceIdr: 449000,
    includes: ["CV ID + EN", "Surat lamaran ID", "Catatan review tertulis"],
  },
  intensive: {
    label: "Intensive",
    slaHours: 168,
    priceIdr: 899000,
    includes: [
      "CV ID + EN",
      "Surat lamaran ID + EN",
      "Review intensif 1-on-1",
      "Review LinkedIn",
    ],
  },
};

export const PRIORITY: Record<PriorityKey, { label: string; tone: StageTone; order: number }> = {
  urgent: { label: "Urgent", tone: "coral", order: 0 },
  high: { label: "Tinggi", tone: "warning", order: 1 },
  normal: { label: "Normal", tone: "muted", order: 2 },
  low: { label: "Rendah", tone: "muted", order: 3 },
};

export type CaseSource = {
  fileName: string;
  fileType: "pdf" | "docx" | "txt";
  pages: number;
  uploadedAt: number;
};

export type CaseFile = {
  id: string;
  clientId: string;
  roleTarget: string;
  seniority: string;
  pkg: CasePackage;
  priority: PriorityKey;
  stage: StageKey;
  submittedAt: number;
  dueAt: number;
  airtableRef: string;
  source: CaseSource;
  cvText: string;
  classification: AiClassification | null;
  assignee: { reviewer: string | null; writer: string | null; qa: string | null };
  notes: ReviewNote[];
  deliverables: Record<DeliverableKey, Deliverable>;
  activity: ActivityItem[];
  clientFeedback: { rating: number; comment: string; at: number } | null;
  tags: string[];
};

/* ------------------------------------------------------------
 * Generator konten (dipakai writer sebagai draft awal)
 * ---------------------------------------------------------- */

export type DraftContext = {
  clientName: string;
  clientEmail: string;
  clientCity: string;
  roleTarget: string;
  seniority: string;
  cvText: string;
  skills: string[];
};

const IMPACT_VERBS = [
  "Mengotomasi",
  "Memimpin",
  "Menganalisis",
  "Membangun",
  "Mengoptimalkan",
  "Mengelola",
  "Merancang",
  "Menyelaraskan",
];

function extractBullets(cvText: string): string[] {
  return cvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => /^[-•*·]/.test(l) || (/^\w/.test(l) && l.length > 45 && !l.includes(":")))
    .map((l) => l.replace(/^[-•*·]\s*/, "").trim())
    .filter((l) => l.length > 18)
    .slice(0, 8);
}

function extractEducation(cvText: string): string {
  const line = cvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /(S1|S2|D3|D4|Universitas|Institut|Politeknik|University)/i.test(l));
  return line ?? "— (lengkapi: jenjang, jurusan, kampus, tahun)";
}

function extractEmployer(cvText: string): string {
  const line = cvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /(PT |CV |Startup|Group|Tbk|Studio|Agency|Nusantara|Indonesia)/.test(l));
  return line ?? "Pengalaman kerja terbaru";
}

/** Ubah bullet "tugas" jadi bullet berorientasi hasil + penanda angka. */
function polishBullet(raw: string, i: number): string {
  const verb = IMPACT_VERBS[i % IMPACT_VERBS.length] ?? "Mengelola";
  const clean = raw
    .replace(/^(bertanggung jawab (untuk|atas)|melakukan|membantu|ikut|terlibat dalam)\s*/i, "")
    .replace(/\.+$/, "")
    .trim();
  const hasMetric = /\d/.test(clean);
  const body = clean.charAt(0).toLowerCase() + clean.slice(1);
  return hasMetric ? `${verb} ${body}.` : `${verb} ${body} — [tambahkan angka: %/jumlah/waktu].`;
}

export function generateCv(ctx: DraftContext, lang: "id" | "en"): string {
  const bullets = extractBullets(ctx.cvText);
  const topSkills = ctx.skills.slice(0, 10);
  const employer = extractEmployer(ctx.cvText);
  const education = extractEducation(ctx.cvText);

  if (lang === "id") {
    const lines = [
      `${ctx.clientName.toUpperCase()}`,
      `${ctx.roleTarget} · ${ctx.seniority}`,
      `${ctx.clientEmail} · ${ctx.clientCity} · linkedin.com/in/${slug(ctx.clientName)}`,
      "",
      "PROFIL",
      `${ctx.roleTarget} ${ctx.seniority.toLowerCase()} yang fokus pada hasil terukur. Terbiasa menerjemahkan kebutuhan bisnis menjadi eksekusi yang rapi, bekerja lintas tim, dan menyampaikan dampak kerja dengan angka.`,
      "",
      "PENGALAMAN KERJA",
      `${employer}`,
      ...(bullets.length
        ? bullets.map((b, i) => `• ${polishBullet(b, i)}`)
        : ["• [tuliskan pencapaian utama dengan angka]"]),
      "",
      "PENDIDIKAN",
      education,
      "",
      "KEAHLIAN",
      (topSkills.length ? topSkills : [`${ctx.roleTarget}`]).join(" · "),
      "",
      "CATATAN PENULIS",
      "Ganti setiap penanda [tambahkan angka] dengan data nyata dari klien sebelum terbit.",
    ];
    return lines.join("\n");
  }

  const lines = [
    `${ctx.clientName.toUpperCase()}`,
    `${ctx.roleTarget} · ${ctx.seniority}`,
    `${ctx.clientEmail} · ${ctx.clientCity} · linkedin.com/in/${slug(ctx.clientName)}`,
    "",
    "PROFILE",
    `Results-driven ${ctx.roleTarget} with a track record of turning business needs into measurable outcomes. Comfortable working across teams and communicating impact with numbers.`,
    "",
    "WORK EXPERIENCE",
    `${employer}`,
    ...(bullets.length
      ? bullets.map(
          (b, i) => `• ${englishVerb(i)} ${translateHint(b)} — [add metric: %/volume/time].`,
        )
      : ["• [describe your key achievement with a number]"]),
    "",
    "EDUCATION",
    education,
    "",
    "SKILLS",
    (topSkills.length ? topSkills : [ctx.roleTarget]).join(" · "),
    "",
    "WRITER NOTE",
    "Replace every [add metric] placeholder with real client data before publishing.",
  ];
  return lines.join("\n");
}

export function generateCoverLetter(ctx: DraftContext, lang: "id" | "en"): string {
  const skills = ctx.skills.slice(0, 4).join(", ") || ctx.roleTarget;
  if (lang === "id") {
    return [
      `${ctx.clientCity}, ${formatDate(ADMIN_NOW)}`,
      "",
      "Hal: Lamaran Pekerjaan — " + ctx.roleTarget,
      "",
      "Kepada Tim Rekrutmen [Nama Perusahaan],",
      "",
      `Saya ${ctx.clientName}, ${ctx.seniority.toLowerCase()} ${ctx.roleTarget} dengan pengalaman yang relevan di bidang ${skills}. Saya tertarik pada posisi ${ctx.roleTarget} di [Nama Perusahaan] karena arah produk dan pertumbuhan tim Anda sejalan dengan cara saya bekerja.`,
      "",
      `Pada peran terakhir saya, saya [tambahkan satu pencapaian utama dengan angka]. Saya terbiasa bekerja lintas fungsi, menyusun prioritas berdasarkan data, dan menyampaikan hasil kerja secara ringkas kepada pemangku kepentingan.`,
      "",
      "Saya akan senang berdiskusi lebih lanjut mengenai bagaimana pengalaman saya dapat membantu target tim Anda. Terima kasih atas waktu dan pertimbangannya.",
      "",
      "Hormat saya,",
      ctx.clientName,
      `${ctx.clientEmail} · ${ctx.clientCity}`,
      "",
      "CATATAN PENULIS: sesuaikan nama perusahaan, posisi, dan angka pencapaian sebelum terbit.",
    ].join("\n");
  }
  return [
    `${ctx.clientCity}, ${formatDate(ADMIN_NOW)}`,
    "",
    "Re: Application for " + ctx.roleTarget,
    "",
    "Dear Hiring Team at [Company Name],",
    "",
    `I am ${ctx.clientName}, a ${ctx.seniority.toLowerCase()} ${ctx.roleTarget} with hands-on experience in ${skills}. I am applying for the ${ctx.roleTarget} role at [Company Name] because your product direction and team growth match the way I like to work.`,
    "",
    "In my most recent role I [add one key achievement with a number]. I am used to working cross-functionally, prioritising with data, and communicating results concisely to stakeholders.",
    "",
    "I would welcome the chance to discuss how my experience can support your team's goals. Thank you for your time and consideration.",
    "",
    "Sincerely,",
    ctx.clientName,
    `${ctx.clientEmail} · ${ctx.clientCity}`,
    "",
    "WRITER NOTE: confirm company name, role title, and metrics before publishing.",
  ].join("\n");
}

function englishVerb(i: number): string {
  const verbs = ["Automated", "Led", "Analysed", "Built", "Optimised", "Managed", "Designed"];
  return verbs[i % verbs.length] ?? "Delivered";
}

function translateHint(raw: string): string {
  return raw
    .replace(/^(bertanggung jawab (untuk|atas)|melakukan|membantu|ikut|terlibat dalam)\s*/i, "")
    .replace(/\.+$/, "")
    .trim();
}

export function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((x) => x[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------
 * Format & SLA helper
 * ---------------------------------------------------------- */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(at: number, lang: "id" | "en" = "id"): string {
  const d = new Date(at);
  const months = lang === "id" ? MONTHS : MONTHS_EN;
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(at: number): string {
  const d = new Date(at);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(at)} · ${hh}:${mm}`;
}

export function relTime(at: number, ref: number = ADMIN_NOW): string {
  const diff = ref - at;
  const future = diff < 0;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / MIN);
  const fmt = (v: number, unit: string) => (future ? `dalam ${v} ${unit}` : `${v} ${unit} lalu`);
  if (mins < 1) return "baru saja";
  if (mins < 60) return fmt(mins, "mnt");
  const hours = Math.round(mins / 60);
  if (hours < 24) return fmt(hours, "jam");
  const days = Math.round(hours / 24);
  if (days < 14) return fmt(days, "hari");
  return fmt(Math.round(days / 7), "minggu");
}

export type DeadlineInfo = {
  hoursLeft: number;
  tone: "late" | "soon" | "ok" | "done";
  label: string;
};

/** SLA = tenggat internal. "soon" kalau < 12 jam lagi. */
export function deadlineInfo(
  dueAt: number,
  stage: StageKey,
  ref: number = ADMIN_NOW,
): DeadlineInfo {
  if (stage === "published")
    return { hoursLeft: 0, tone: "done", label: "Tuntas" };
  const hoursLeft = (dueAt - ref) / HOUR;
  if (hoursLeft < 0) return { hoursLeft, tone: "late", label: `Lewat ${relShort(-hoursLeft)}` };
  if (hoursLeft < 12) return { hoursLeft, tone: "soon", label: `Sisa ${relShort(hoursLeft)}` };
  return { hoursLeft, tone: "ok", label: relShort(hoursLeft) };
}

function relShort(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} mnt`;
  if (hours < 24) return `${Math.round(hours)} jam`;
  return `${Math.round(hours / 24)} hari`;
}

export function slaProgress(c: CaseFile, ref: number = ADMIN_NOW): number {
  const total = c.dueAt - c.submittedAt;
  if (total <= 0) return 100;
  return clamp(Math.round(((ref - c.submittedAt) / total) * 100), 0, 100);
}

/* ------------------------------------------------------------
 * Contoh teks CV sebagai sumber klasifikasi AI
 * ---------------------------------------------------------- */

export const CV_TEXTS = {
  /** Sangat lemah → "rusak" */
  bad_ba: `Curriculum Vitae
Nama: Rizky Pratama
Alamat: Bekasi, Jawa Barat

Saya adalah orang yang jujur, disiplin, dan mau belajar hal baru. Saya bisa bekerja dalam tim maupun individu.
Saya lulusan SMA dan sedang mencari pengalaman kerja di bidang administrasi.

Pengalaman Kerja
- Pernah bekerja sebagai kasir di minimarket selama 6 bulan.
- Membantu merapikan barang dan melayani pembeli.

Kemampuan: Microsoft Word, komunikasi, teliti, cepat belajar.`,

  /** Sangat lemah, fresh graduate IT → "rusak" */
  bad_swe: `Curriculum Vitae
Nama: Fajar Ramadhan
Fresh graduate Informatika

Saya lulusan baru yang cepat belajar dan menyukai pemrograman. Saya ingin menjadi software engineer.

Pendidikan
S1 Informatika, Universitas Terbuka (2020 - 2024)

Pengalaman
- Magang 2 bulan di startup lokal, membantu memperbaiki tampilan website.
- Tugas akhir membuat aplikasi CRUD sederhana.

Skill
HTML, CSS, JavaScript dasar, Git`,

  /** Fondasi ada, belum tajam → "lumayan" */
  mid_ba: `Ringkasan
Business Analyst dengan pengalaman 2 tahun yang menerjemahkan kebutuhan bisnis menjadi kebutuhan teknis.

Pengalaman
Business Analyst - PT Digital Nusantara (2024 - sekarang)
- Bertanggung jawab membuat laporan mingguan untuk tim.
- Berkomunikasi dengan stakeholder internal di berbagai divisi.
- Melakukan analisis data penjualan menggunakan Excel.

Pendidikan
S1 Manajemen, Universitas Indonesia (2018 - 2022)

Skill
Excel, SQL, Komunikasi, Stakeholder Management`,

  /** Data analyst menengah → "lumayan" */
  mid_da: `Ringkasan
Data Analyst dengan 3 tahun pengalaman di e-commerce, terbiasa mengolah data penjualan dan membuat dashboard untuk tim bisnis.

Pengalaman
Data Analyst - PT Ritail Digital (2023 - sekarang)
- Membuat dashboard penjualan mingguan dengan SQL dan Looker Studio untuk 5 tim bisnis.
- Menganalisis data 120 ribu transaksi untuk menemukan penyebab penurunan conversion rate 4%.
- Bekerja sama dengan tim marketing untuk menyusun laporan kampanye bulanan.

Pendidikan
S1 Statistika, Universitas Padjadjaran (2018 - 2022), IPK 3.41

Skill
SQL, Excel, Python dasar, Looker Studio, Data Visualization, Analisis Data`,

  /** Marketing menengah → "lumayan" */
  mid_ma: `Ringkasan
Marketing Associate dengan 2 tahun pengalaman menjalankan kampanye digital untuk brand FMCG lokal.

Pengalaman
Marketing Associate - PT Aroma Nusantara (2024 - sekarang)
- Mengelola kampanye Instagram dan TikTok dengan total 300 ribu impresi per bulan.
- Menyusun laporan performa iklan mingguan untuk 3 brand.
- Berkoordinasi dengan agensi untuk produksi konten bulanan.

Pendidikan
S1 Ilmu Komunikasi, Universitas Airlangga (2018 - 2022), IPK 3.30

Skill
Social Media Marketing, Copywriting, Meta Ads, Google Analytics, Content Planning`,

  /** UX designer menengah → "lumayan" */
  mid_ux: `Ringkasan
UI/UX Designer dengan 3 tahun pengalaman merancang aplikasi mobile untuk sektor logistik dan retail.

Pengalaman
UI/UX Designer - PT Logistik Cepat (2023 - sekarang)
- Merancang ulang alur pemesanan yang menurunkan waktu penyelesaian tugas dari 4 menit menjadi 2,5 menit.
- Membuat design system berisi 60 komponen yang dipakai 3 tim produk.
- Melakukan usability testing kepada 25 pengguna setiap kuartal.
UI Designer - Agensi Kreatif Riang (2021 - 2023)
- Mendesain 12 landing page kampanye dengan konversi rata-rata 5%.

Pendidikan
S1 Desain Komunikasi Visual, Universitas Bina Nusantara (2017 - 2021)

Skill
Figma, Design System, Wireframing, Prototyping, Usability Testing, User Research`,

  /** PM kuat → "bagus" */
  good_pm: `RINGKASAN
Product Manager dengan 5 tahun pengalaman memimpin produk B2C fintech. Meningkatkan retention 28% dalam 2 kuartal dan memangkas waktu-to-market fitur dari 9 minggu menjadi 4 minggu untuk tim berisi 12 orang.

PENGALAMAN
Senior Product Manager - PT Fintech Nusantara (2022 - sekarang)
- Memimpin roadmap 4 squads, mengelola GMV bulanan Rp 420 miliar dengan activation rate naik 31%.
- Merancang eksperimen A/B testing 46 hipotesis; 18 di antaranya meningkatkan conversion rate rata-rata 12%.
- Mengotomasi proses discovery dengan user research kuartalan (240 responden), memangkas rework requirement 35%.
Product Manager - Toko Online Jaya (2020 - 2022)
- Mengembangkan fitur checkout yang menaikkan success rate transaksi 22% dan menyelesaikan 15 stakeholder lintas divisi.
- Menganalisis data 1,2 juta pengguna dengan SQL dan Amplitude untuk memprioritaskan backlog.

PENDIDIKAN
S1 Teknik Industri, Institut Teknologi Bandung (2014 - 2018), IPK 3.62

SKILL
Product Strategy, Roadmapping, User Research, SQL, Amplitude, A/B Testing, Jira, Stakeholder Management

SERTIFIKASI
Certified Scrum Product Owner (2021)`,

  /** Data analyst kuat → "bagus" */
  good_da: `RINGKASAN
Data Analyst dengan 4 tahun pengalaman membangun warehouse data dan model prediktif untuk e-commerce. Memangkas waktu penyusunan laporan dari 3 hari menjadi 2 jam dan meningkatkan akurasi forecast demand sebesar 24%.

PENGALAMAN
Senior Data Analyst - PT Ritail Digital (2023 - sekarang)
- Membangun 38 dashboard Looker untuk 6 divisi, menghemat 60 jam kerja manual per bulan dan mempercepat waktu keputusan 45%.
- Mengembangkan model forecast demand dengan Python dan SQL atas 2,4 juta baris transaksi, menurunkan overstock 18%.
- Memimpin 4 proyek A/B testing yang meningkatkan conversion rate 9% dan retention 14%.
Data Analyst - Marketplace Cepat (2021 - 2023)
- Mengotomasi 20 laporan harian dengan SQL dan Airflow, menghemat 25 jam kerja tim per minggu.
- Menganalisis funnel 800 ribu pengguna dan mengusulkan 7 perbaikan onboarding yang menaikkan activation 11%.

PENDIDIKAN
S1 Statistika, Universitas Padjadjaran (2017 - 2021), IPK 3.58

SKILL
SQL, Python, dbt, Airflow, Looker, Data Visualization, A/B Testing, BigQuery, Statistika, Dashboard

SERTIFIKASI
Google Advanced Data Analytics (2022)`,

  /** Software engineer kuat → "bagus" */
  good_swe: `RINGKASAN
Software Engineer dengan 4 tahun pengalaman membangun layanan backend ber-traffic tinggi. Memangkas p99 latency API dari 820ms ke 140ms dan menaikkan coverage test dari 42% ke 88% untuk 6 service produksi.

PENGALAMAN
Senior Backend Engineer - PT Super App Indonesia (2023 - sekarang)
- Merancang ulang arsitektur payment service menangani 1,2 juta request per menit dengan latency p99 140ms dan downtime 0% selama 14 bulan.
- Memimpin migrasi 9 service ke Kubernetes, memangkas biaya infrastruktur 37% dan waktu deploy dari 40 menit ke 6 menit.
- Membangun pipeline CI/CD dengan GitHub Actions yang menurunkan bug produksi 52% dan menaikkan coverage test ke 88%.
Backend Engineer - Startup Logistik KirimAja (2021 - 2023)
- Mengembangkan API tracking real-time untuk 300 ribu pengiriman harian menggunakan Go, Redis, dan PostgreSQL.

PENDIDIKAN
S1 Teknik Informatika, Institut Teknologi Sepuluh Nopember (2016 - 2020), IPK 3.71

SKILL
Go, TypeScript, Node.js, Kubernetes, Docker, PostgreSQL, Redis, Kafka, CI/CD, Microservices, Unit Testing, Observability

SERTIFIKASI
AWS Certified Solutions Architect (2022)`,
} as const;

export type CvTextKey = keyof typeof CV_TEXTS;

/* ------------------------------------------------------------
 * Seed klien + kasus
 * ---------------------------------------------------------- */

type ClientSeed = Omit<Client, "joinedAt"> & { joinedHoursAgo: number };

const CLIENT_SEEDS: ClientSeed[] = [
  {
    id: "CL-1041",
    name: "Rizky Pratama",
    email: "rizky.pratama@gmail.com",
    phone: "+62 812-3344-5566",
    city: "Bekasi",
    plan: "starter",
    source: "Instagram Ads",
    accountStatus: "aktif",
    joinedHoursAgo: 3,
  },
  {
    id: "CL-1040",
    name: "Kirana Dewi",
    email: "kirana.dewi@outlook.com",
    phone: "+62 811-9087-2211",
    city: "Jakarta Selatan",
    plan: "intensive",
    source: "Referral teman",
    accountStatus: "aktif",
    joinedHoursAgo: 5,
  },
  {
    id: "CL-1039",
    name: "Fajar Ramadhan",
    email: "fajar.ramadhan99@gmail.com",
    phone: "+62 857-1122-3344",
    city: "Bandung",
    plan: "starter",
    source: "TikTok",
    accountStatus: "menunggu verifikasi",
    joinedHoursAgo: 7,
  },
  {
    id: "CL-1038",
    name: "Alya Nurhidayah",
    email: "alya.nur@yahoo.com",
    phone: "+62 813-5566-7788",
    city: "Yogyakarta",
    plan: "intensive",
    source: "Google Search",
    accountStatus: "aktif",
    joinedHoursAgo: 11,
  },
  {
    id: "CL-1037",
    name: "Dimas Anggara",
    email: "dimas.anggara@gmail.com",
    phone: "+62 878-2233-4455",
    city: "Surabaya",
    plan: "starter",
    source: "Kampus ambassador",
    accountStatus: "aktif",
    joinedHoursAgo: 16,
  },
  {
    id: "CL-1036",
    name: "Salsa Maharani",
    email: "salsa.maharani@gmail.com",
    phone: "+62 812-7788-9900",
    city: "Tangerang",
    plan: "intensive",
    source: "LinkedIn",
    accountStatus: "aktif",
    joinedHoursAgo: 25,
  },
  {
    id: "CL-1035",
    name: "Bayu Setiawan",
    email: "bayu.setiawan@icloud.com",
    phone: "+62 856-3344-1122",
    city: "Semarang",
    plan: "starter",
    source: "Instagram Ads",
    accountStatus: "aktif",
    joinedHoursAgo: 33,
  },
  {
    id: "CL-1034",
    name: "Nadia Safitri",
    email: "nadia.safitri@gmail.com",
    phone: "+62 811-4455-6677",
    city: "Jakarta Pusat",
    plan: "career-plus",
    source: "Webinar MULAI+",
    accountStatus: "aktif",
    joinedHoursAgo: 44,
  },
  {
    id: "CL-1033",
    name: "Reza Fadillah",
    email: "reza.fadillah@gmail.com",
    phone: "+62 813-9911-2288",
    city: "Depok",
    plan: "intensive",
    source: "Referral teman",
    accountStatus: "aktif",
    joinedHoursAgo: 58,
  },
  {
    id: "CL-1032",
    name: "Gilang Ramadhan",
    email: "gilang.ramadhan@gmail.com",
    phone: "+62 812-6677-8899",
    city: "Malang",
    plan: "career-plus",
    source: "Google Search",
    accountStatus: "aktif",
    joinedHoursAgo: 80,
  },
  {
    id: "CL-1031",
    name: "Hana Zahira",
    email: "hana.zahira@gmail.com",
    phone: "+62 858-1234-5678",
    city: "Bogor",
    plan: "intensive",
    source: "LinkedIn",
    accountStatus: "aktif",
    joinedHoursAgo: 104,
  },
  {
    id: "CL-1030",
    name: "Yoga Mahendra",
    email: "yoga.mahendra@gmail.com",
    phone: "+62 811-2233-9988",
    city: "Denpasar",
    plan: "career-plus",
    source: "Webinar MULAI+",
    accountStatus: "aktif",
    joinedHoursAgo: 160,
  },
  {
    id: "CL-1029",
    name: "Chandra Wijaya",
    email: "chandra.wijaya@gmail.com",
    phone: "+62 856-7788-1122",
    city: "Medan",
    plan: "starter",
    source: "TikTok",
    accountStatus: "aktif",
    joinedHoursAgo: 210,
  },
];

export const CLIENTS: Client[] = CLIENT_SEEDS.map(({ joinedHoursAgo, ...c }) => ({
  ...c,
  joinedAt: ago(joinedHoursAgo),
}));

export const CLIENT_MAP: Record<string, Client> = Object.fromEntries(
  CLIENTS.map((c) => [c.id, c]),
);

type CaseSeed = {
  id: string;
  clientId: string;
  roleTarget: string;
  seniority: string;
  textKey: CvTextKey;
  stage: StageKey;
  pkg: CasePackage;
  priority: PriorityKey;
  submittedHoursAgo: number;
  dueInHours: number;
  reviewer: string | null;
  writer: string | null;
  qa: string | null;
  tags: string[];
  sourceFile: { fileName: string; fileType: "pdf" | "docx" | "txt"; pages: number };
  feedback?: { rating: number; comment: string; hoursAgo: number };
};

const CASE_SEEDS: CaseSeed[] = [
  /* — Belum ditriage — */
  {
    id: "CVR-2608-019",
    clientId: "CL-1041",
    roleTarget: "Business Analyst",
    seniority: "Entry level",
    textKey: "bad_ba",
    stage: "intake",
    pkg: "standard",
    priority: "normal",
    submittedHoursAgo: 2,
    dueInHours: 46,
    reviewer: null,
    writer: null,
    qa: null,
    tags: ["career switch", "fresh graduate"],
    sourceFile: { fileName: "CV_Rizky_Pratama_2026.pdf", fileType: "pdf", pages: 1 },
  },
  {
    id: "CVR-2608-018",
    clientId: "CL-1040",
    roleTarget: "Product Manager",
    seniority: "Mid level",
    textKey: "mid_ba",
    stage: "intake",
    pkg: "intensive",
    priority: "high",
    submittedHoursAgo: 4,
    dueInHours: 72,
    reviewer: null,
    writer: null,
    qa: null,
    tags: ["career switch", "prioritas tinggi"],
    sourceFile: { fileName: "CV_Kirana_Dewi_PM.docx", fileType: "docx", pages: 2 },
  },
  {
    id: "CVR-2608-017",
    clientId: "CL-1039",
    roleTarget: "Software Engineer",
    seniority: "Fresh graduate",
    textKey: "bad_swe",
    stage: "intake",
    pkg: "express",
    priority: "urgent",
    submittedHoursAgo: 6,
    dueInHours: 16,
    reviewer: null,
    writer: null,
    qa: null,
    tags: ["deadline dekat", "fresh graduate"],
    sourceFile: { fileName: "CV_Fajar_Ramadhan.pdf", fileType: "pdf", pages: 2 },
  },

  /* — Sudah diklasifikasi AI, menunggu konfirmasi reviewer — */
  {
    id: "CVR-2608-016",
    clientId: "CL-1038",
    roleTarget: "Data Analyst",
    seniority: "Mid level",
    textKey: "mid_da",
    stage: "triage",
    pkg: "standard",
    priority: "normal",
    submittedHoursAgo: 10,
    dueInHours: 38,
    reviewer: "st-02",
    writer: "st-04",
    qa: null,
    tags: ["upskill", "data"],
    sourceFile: { fileName: "CV_Alya_Nurhidayah.pdf", fileType: "pdf", pages: 2 },
  },
  {
    id: "CVR-2608-015",
    clientId: "CL-1037",
    roleTarget: "Marketing Associate",
    seniority: "Mid level",
    textKey: "mid_ma",
    stage: "triage",
    pkg: "standard",
    priority: "normal",
    submittedHoursAgo: 15,
    dueInHours: 28,
    reviewer: "st-03",
    writer: "st-05",
    qa: null,
    tags: ["marketing", "brand lokal"],
    sourceFile: { fileName: "CV_Dimas_Anggara.docx", fileType: "docx", pages: 2 },
  },

  /* — Review intensif — */
  {
    id: "CVR-2608-014",
    clientId: "CL-1036",
    roleTarget: "UX Designer",
    seniority: "Mid level",
    textKey: "mid_ux",
    stage: "review",
    pkg: "intensive",
    priority: "high",
    submittedHoursAgo: 23,
    dueInHours: 26,
    reviewer: "st-03",
    writer: "st-05",
    qa: "st-06",
    tags: ["portfolio", "design system"],
    sourceFile: { fileName: "CV_Salsa_Maharani_UX.pdf", fileType: "pdf", pages: 3 },
  },
  {
    id: "CVR-2608-013",
    clientId: "CL-1035",
    roleTarget: "Business Analyst",
    seniority: "Mid level",
    textKey: "mid_ba",
    stage: "review",
    pkg: "express",
    priority: "normal",
    submittedHoursAgo: 31,
    dueInHours: -5,
    reviewer: "st-01",
    writer: "st-04",
    qa: "st-06",
    tags: ["lewat SLA", "perlu tindakan"],
    sourceFile: { fileName: "CV_Bayu_Setiawan.pdf", fileType: "pdf", pages: 1 },
  },

  /* — Produksi dokumen — */
  {
    id: "CVR-2608-012",
    clientId: "CL-1034",
    roleTarget: "Product Manager",
    seniority: "Senior level",
    textKey: "good_pm",
    stage: "production",
    pkg: "intensive",
    priority: "high",
    submittedHoursAgo: 41,
    dueInHours: 33,
    reviewer: "st-01",
    writer: "st-04",
    qa: "st-06",
    tags: ["fintech", "leadership"],
    sourceFile: { fileName: "CV_Nadia_Safitri_PM.pdf", fileType: "pdf", pages: 3 },
  },
  {
    id: "CVR-2608-011",
    clientId: "CL-1033",
    roleTarget: "Software Engineer",
    seniority: "Fresh graduate",
    textKey: "bad_swe",
    stage: "production",
    pkg: "standard",
    priority: "urgent",
    submittedHoursAgo: 53,
    dueInHours: 5,
    reviewer: "st-02",
    writer: "st-05",
    qa: "st-06",
    tags: ["fresh graduate", "backend"],
    sourceFile: { fileName: "CV_Reza_Fadillah.pdf", fileType: "pdf", pages: 2 },
  },

  /* — QA internal — */
  {
    id: "CVR-2608-010",
    clientId: "CL-1032",
    roleTarget: "Data Analyst",
    seniority: "Senior level",
    textKey: "good_da",
    stage: "qa",
    pkg: "intensive",
    priority: "normal",
    submittedHoursAgo: 75,
    dueInHours: 21,
    reviewer: "st-02",
    writer: "st-04",
    qa: "st-06",
    tags: ["analytics", "forecast"],
    sourceFile: { fileName: "CV_Gilang_Ramadhan_DA.pdf", fileType: "pdf", pages: 2 },
  },

  /* — Revisi klien — */
  {
    id: "CVR-2608-009",
    clientId: "CL-1031",
    roleTarget: "Business Analyst",
    seniority: "Mid level",
    textKey: "mid_da",
    stage: "revision",
    pkg: "standard",
    priority: "high",
    submittedHoursAgo: 97,
    dueInHours: 2,
    reviewer: "st-01",
    writer: "st-05",
    qa: "st-06",
    tags: ["revisi klien", "deadline dekat"],
    sourceFile: { fileName: "CV_Hana_Zahira.pdf", fileType: "pdf", pages: 2 },
    feedback: {
      rating: 4,
      comment:
        "Versi EN sudah bagus, tapi bagian experience perusahaan kedua kurang detail. Mohon ditambah konteks tim.",
      hoursAgo: 6,
    },
  },

  /* — Terbit — */
  {
    id: "CVR-2608-008",
    clientId: "CL-1030",
    roleTarget: "Product Manager",
    seniority: "Senior level",
    textKey: "good_pm",
    stage: "published",
    pkg: "intensive",
    priority: "normal",
    submittedHoursAgo: 152,
    dueInHours: -20,
    reviewer: "st-01",
    writer: "st-04",
    qa: "st-06",
    tags: ["terbit", "fintech"],
    sourceFile: { fileName: "CV_Yoga_Mahendra_PM.pdf", fileType: "pdf", pages: 3 },
    feedback: {
      rating: 5,
      comment: "Hasilnya rapi banget, HRD langsung respond 2 hari setelah kirim. Terima kasih!",
      hoursAgo: 26,
    },
  },
  {
    id: "CVR-2608-007",
    clientId: "CL-1029",
    roleTarget: "Marketing Associate",
    seniority: "Mid level",
    textKey: "mid_ma",
    stage: "published",
    pkg: "express",
    priority: "normal",
    submittedHoursAgo: 200,
    dueInHours: -70,
    reviewer: "st-03",
    writer: "st-05",
    qa: "st-06",
    tags: ["terbit", "express"],
    sourceFile: { fileName: "CV_Chandra_Wijaya.docx", fileType: "docx", pages: 2 },
    feedback: {
      rating: 4,
      comment: "Cepat dan sesuai permintaan. Surat lamaran ID sangat membantu.",
      hoursAgo: 60,
    },
  },
];

function ctxOf(seed: CaseSeed, cvText: string, skills: string[]): DraftContext {
  const client = CLIENT_MAP[seed.clientId]!;
  return {
    clientName: client.name,
    clientEmail: client.email,
    clientCity: client.city,
    roleTarget: seed.roleTarget,
    seniority: seed.seniority,
    cvText,
    skills,
  };
}

/** Status deliverable mengikuti seberapa jauh tahap kasusnya. */
const STAGE_DELIVERABLE_STATE: Record<
  StageKey,
  { cv_id: DeliverableStatus; cv_en: DeliverableStatus; cover_id: DeliverableStatus; cover_en: DeliverableStatus }
> = {
  intake: { cv_id: "todo", cv_en: "todo", cover_id: "todo", cover_en: "todo" },
  triage: { cv_id: "todo", cv_en: "todo", cover_id: "todo", cover_en: "todo" },
  review: { cv_id: "todo", cv_en: "todo", cover_id: "todo", cover_en: "todo" },
  production: { cv_id: "review", cv_en: "drafting", cover_id: "drafting", cover_en: "todo" },
  qa: { cv_id: "approved", cv_en: "review", cover_id: "review", cover_en: "review" },
  revision: { cv_id: "review", cv_en: "review", cover_id: "approved", cover_en: "approved" },
  published: {
    cv_id: "published",
    cv_en: "published",
    cover_id: "published",
    cover_en: "published",
  },
};

/** Paket express hanya dapat CV + surat lamaran versi Indonesia. */
function enabledDeliverables(pkg: CasePackage): DeliverableKey[] {
  if (pkg === "express") return ["cv_id", "cover_id"];
  return ["cv_id", "cv_en", "cover_id", "cover_en"];
}

function buildDeliverables(
  seed: CaseSeed,
  ctx: DraftContext,
  stage: StageKey,
): Record<DeliverableKey, Deliverable> {
  const statuses = STAGE_DELIVERABLE_STATE[stage];
  const enabled = enabledDeliverables(seed.pkg);
  const out = {} as Record<DeliverableKey, Deliverable>;

  for (const def of DELIVERABLE_DEFS) {
    const notIncluded = !enabled.includes(def.key);
    const status: DeliverableStatus = notIncluded ? "todo" : statuses[def.key];
    const body =
      status === "todo"
        ? ""
        : def.kind === "cv"
          ? generateCv(ctx, def.lang)
          : generateCoverLetter(ctx, def.lang);
    const ownerId = notIncluded
      ? null
      : def.kind === "cv"
        ? seed.writer
        : seed.writer;
    const version = status === "published" ? 2 : status === "todo" ? 0 : 1;
    out[def.key] = {
      key: def.key,
      status,
      ownerId,
      version,
      updatedAt: status === "todo" ? null : ago(Math.max(1, seed.submittedHoursAgo - 12)),
      wordCount: wordCount(body),
      body,
      checks: body ? buildChecks(def.kind, body) : buildChecks(def.kind, ""),
      history:
        status === "todo"
          ? []
          : [
              {
                version: 1,
                at: ago(Math.max(1, seed.submittedHoursAgo - 12)),
                by: staffName(seed.writer),
                note: "Draft awal digenerate dari hasil review.",
              },
              ...(status === "published"
                ? [
                    {
                      version: 2,
                      at: ago(Math.max(1, seed.submittedHoursAgo - 20) - 4),
                      by: staffName(seed.writer),
                      note: "Revisi setelah QA: perbaikan kalimat pembuka & konsistensi istilah.",
                    },
                  ]
                : []),
            ],
    };
  }
  return out;
}

function buildNotes(
  seed: CaseSeed,
  classification: AiClassification,
  stage: StageKey,
): ReviewNote[] {
  if (stage === "triage") return [];
  const author = STAFF_MAP[seed.reviewer ?? "st-01"]!;
  const notes: ReviewNote[] = classification.issues.slice(0, 4).map((iss, i) => ({
    id: `${seed.id}-N${i + 1}`,
    at: ago(Math.max(1, seed.submittedHoursAgo - 6 + i)),
    authorId: author.id,
    authorName: author.name,
    scope: "cv_id" as const,
    severity:
      iss.severity === "blocker" ? "blocker" : iss.severity === "major" ? "major" : "minor",
    section: iss.section,
    body: `${iss.detail}\n\nRencana perbaikan: ${iss.fix}`,
    before: null,
    after: null,
    resolved: isDownstream(stage) && i < 3,
    resolvedBy: isDownstream(stage) && i < 3 ? staffName(seed.writer) : null,
  }));

  if (classification.grade !== "rusak") {
    notes.push({
      id: `${seed.id}-NP`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 8)),
      authorId: author.id,
      authorName: author.name,
      scope: "general",
      severity: "praise",
      section: "Keseluruhan",
      body:
        classification.grade === "bagus"
          ? "Materi mentah sudah kuat. Fokus kita bukan menambah isi, tapi menyelaraskan bahasa dengan role target dan menyiapkan versi EN."
          : "Fondasi sudah ada dan layak dikembangkan. Jangan tambah section baru — rapikan yang ada dan lengkapi angka.",
      before: null,
      after: null,
      resolved: false,
      resolvedBy: null,
    });
  }

  if (isDownstream(stage)) {
    notes.push({
      id: `${seed.id}-NB`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 30)),
      authorId: "st-04",
      authorName: staffName("st-04"),
      scope: "cv_id",
      severity: "major",
      section: "Summary",
      body:
        "Summary versi ID masih terlalu panjang. Pangkas jadi 3 baris dan taruh angka terbesar di kalimat pertama.",
      before: "Profesional berpengalaman yang siap berkontribusi untuk perusahaan Anda.",
      after:
        "Spesialis dengan rekam jejak terukur — [angka utama] dan [angka kedua] di peran terakhir.",
      resolved: false,
      resolvedBy: null,
    });
  }

  return notes;
}

function buildActivity(seed: CaseSeed, stage: StageKey): ActivityItem[] {
  const client = CLIENT_MAP[seed.clientId]!;
  const items: ActivityItem[] = [
    {
      id: `${seed.id}-A1`,
      at: ago(seed.submittedHoursAgo),
      kind: "intake",
      actor: client.name,
      text: `Membuat akun dan mengunggah ${seed.sourceFile.fileName} untuk target ${seed.roleTarget}.`,
    },
  ];

  if (stage !== "intake") {
    items.push({
      id: `${seed.id}-A2`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 0.4)),
      kind: "ai",
      actor: "AI Classifier",
      text: "Klasifikasi otomatis selesai — hasil masuk antrean triage reviewer.",
    });
  }
  if (seed.reviewer) {
    items.push({
      id: `${seed.id}-A3`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 1)),
      kind: "assign",
      actor: staffName(VIEWER_ID),
      text: `Menugaskan ${staffName(seed.reviewer)} sebagai reviewer${
        seed.writer ? ` dan ${staffName(seed.writer)} sebagai writer` : ""
      }.`,
    });
  }
  if (stageIndex(stage) >= stageIndex("review")) {
    items.push({
      id: `${seed.id}-A4`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 6)),
      kind: "note",
      actor: staffName(seed.reviewer),
      text: "Menambahkan catatan review intensif pada bagian Summary dan Experience.",
    });
  }
  if (isDownstream(stage)) {
    items.push({
      id: `${seed.id}-A5`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 14)),
      kind: "deliverable",
      actor: staffName(seed.writer),
      text: "Menyusun draft CV Bahasa Indonesia dan surat lamaran dari hasil review.",
    });
  }
  if (stage === "qa" || stage === "revision" || stage === "published") {
    items.push({
      id: `${seed.id}-A6`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 40)),
      kind: "stage",
      actor: staffName("st-06"),
      text: "QA internal: cek ATS, konsistensi istilah, dan panjang halaman.",
    });
  }
  if (stage === "revision") {
    items.push({
      id: `${seed.id}-A7`,
      at: ago(6),
      kind: "client",
      actor: client.name,
      text: "Mengirim catatan revisi melalui portal klien.",
    });
  }
  if (stage === "published") {
    items.push({
      id: `${seed.id}-A8`,
      at: ago(Math.max(1, seed.submittedHoursAgo - 60)),
      kind: "publish",
      actor: staffName("st-06"),
      text: "Rilis v2 diterbitkan — CV ID/EN dan surat lamaran dikirim lewat email + portal klien.",
    });
    if (seed.feedback) {
      items.push({
        id: `${seed.id}-A9`,
        at: ago(seed.feedback.hoursAgo),
        kind: "client",
        actor: client.name,
        text: `Memberi rating ${seed.feedback.rating}/5 untuk hasil review.`,
      });
    }
  }

  return items.sort((a, b) => b.at - a.at);
}

function buildCase(seed: CaseSeed): CaseFile {
  const cvText = CV_TEXTS[seed.textKey];
  const submittedAt = ago(seed.submittedHoursAgo);
  const classification =
    seed.stage === "intake"
      ? null
      : classifyCv(cvText, seed.roleTarget, {
          at: ago(Math.max(1, seed.submittedHoursAgo - 0.4)),
          humanConfirmed: seed.stage !== "triage",
        });

  const skills = classification
    ? [...classification.foundKeywords, ...classification.missingKeywords]
    : [];

  const client = CLIENT_MAP[seed.clientId]!;
  const ctx = ctxOf(seed, cvText, skills);

  return {
    id: seed.id,
    clientId: seed.clientId,
    roleTarget: seed.roleTarget,
    seniority: seed.seniority,
    pkg: seed.pkg,
    priority: seed.priority,
    stage: seed.stage,
    submittedAt,
    dueAt: ADMIN_NOW + seed.dueInHours * HOUR,
    airtableRef: `OPS-${seed.id.slice(-4)}`,
    source: {
      fileName: seed.sourceFile.fileName,
      fileType: seed.sourceFile.fileType,
      pages: seed.sourceFile.pages,
      uploadedAt: submittedAt,
    },
    cvText,
    classification,
    assignee: { reviewer: seed.reviewer, writer: seed.writer, qa: seed.qa },
    notes: classification ? buildNotes(seed, classification, seed.stage) : [],
    deliverables: buildDeliverables(seed, ctx, seed.stage),
    activity: buildActivity(seed, seed.stage),
    clientFeedback: seed.feedback
      ? { rating: seed.feedback.rating, comment: seed.feedback.comment, at: ago(seed.feedback.hoursAgo) }
      : null,
    tags: [...seed.tags, client.city],
  };
}

export const CASES: CaseFile[] = CASE_SEEDS.map(buildCase);

/* ------------------------------------------------------------
 * Query helper
 * ---------------------------------------------------------- */

export function countByStage(cases: CaseFile[]): Record<StageKey, number> {
  const out = {} as Record<StageKey, number>;
  for (const s of STAGES) out[s.key] = 0;
  for (const c of cases) out[c.stage] += 1;
  return out;
}

export function countByGrade(cases: CaseFile[]): Record<CvGradeKey, number> {
  const out: Record<CvGradeKey, number> = { rusak: 0, lumayan: 0, bagus: 0 };
  for (const c of cases) if (c.classification) out[c.classification.grade] += 1;
  return out;
}

export function isOverdue(c: CaseFile, ref: number = ADMIN_NOW): boolean {
  return c.stage !== "published" && c.dueAt < ref;
}

export function activeCases(cases: CaseFile[]): CaseFile[] {
  return cases.filter((c) => c.stage !== "published");
}

export function caseLoadOf(cases: CaseFile[], staffId: string): CaseFile[] {
  return cases.filter(
    (c) =>
      c.stage !== "published" &&
      (c.assignee.reviewer === staffId ||
        c.assignee.writer === staffId ||
        c.assignee.qa === staffId),
  );
}

export function unassignedCases(cases: CaseFile[]): CaseFile[] {
  return cases.filter(
    (c) =>
      c.stage !== "published" &&
      (!c.assignee.reviewer || (isDownstream(c.stage) && !c.assignee.writer)),
  );
}

/** Klien dari sebuah kasus (fallback aman kalau data tidak ketemu). */
export function clientOf(c: CaseFile): Client {
  return (
    CLIENT_MAP[c.clientId] ?? {
      id: c.clientId,
      name: "Klien tidak dikenal",
      email: "—",
      phone: "—",
      city: "—",
      joinedAt: ADMIN_NOW,
      plan: "starter",
      source: "—",
      accountStatus: "aktif",
    }
  );
}

export function casesOfClient(cases: CaseFile[], clientId: string): CaseFile[] {
  return cases.filter((c) => c.clientId === clientId);
}

/** Konteks untuk generator draft, diturunkan dari kasus + klien. */
export function draftContextFor(c: CaseFile): DraftContext {
  const client = clientOf(c);
  const skills = c.classification
    ? [...c.classification.foundKeywords, ...c.classification.missingKeywords]
    : [];
  return {
    clientName: client.name,
    clientEmail: client.email,
    clientCity: client.city,
    roleTarget: c.roleTarget,
    seniority: c.seniority,
    cvText: c.cvText,
    skills,
  };
}

/** Deliverable baru dari template (dipakai saat writer mulai mengerjakan). */
export function buildDeliverable(
  key: DeliverableKey,
  ctx: DraftContext,
  status: DeliverableStatus,
  ownerId: string | null,
): Deliverable {
  const def = DELIVERABLE_MAP[key];
  const body =
    status === "todo"
      ? ""
      : def.kind === "cv"
        ? generateCv(ctx, def.lang)
        : generateCoverLetter(ctx, def.lang);
  return {
    key,
    status,
    ownerId,
    version: status === "todo" ? 0 : 1,
    updatedAt: status === "todo" ? null : ADMIN_NOW,
    wordCount: wordCount(body),
    body,
    checks: buildChecks(def.kind, body),
    history:
      status === "todo"
        ? []
        : [
            {
              version: 1,
              at: ADMIN_NOW,
              by: staffName(ownerId),
              note: "Draft digenerate dari ringkasan review.",
            },
          ],
  };
}

/** Tingkat konflik: AI bilang X, reviewer ubah jadi Y. */
export function overrideRate(cases: CaseFile[]): number {
  const confirmed = cases.filter((c) => c.classification?.humanConfirmed);
  if (!confirmed.length) return 0;
  const overridden = confirmed.filter((c) => c.classification?.overrideNote).length;
  return Math.round((overridden / confirmed.length) * 100);
}

/** Rata-rata umur kasus aktif (jam) — proxy cycle time. */
export function avgAgeHours(cases: CaseFile[], ref: number = ADMIN_NOW): number {
  const active = activeCases(cases);
  if (!active.length) return 0;
  const total = active.reduce((sum, c) => sum + (ref - c.submittedAt) / HOUR, 0);
  return Math.round((total / active.length) * 10) / 10;
}

export function searchCases(cases: CaseFile[], q: string): CaseFile[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return cases;
  return cases.filter((c) => {
    const client = clientOf(c);
    return (
      c.id.toLowerCase().includes(needle) ||
      c.roleTarget.toLowerCase().includes(needle) ||
      client.name.toLowerCase().includes(needle) ||
      client.email.toLowerCase().includes(needle) ||
      c.tags.some((t) => t.toLowerCase().includes(needle))
    );
  });
}

export const HEALTH_LABEL: Record<DeadlineInfo["tone"], string> = {
  late: "Lewat deadline",
  soon: "Mepet deadline",
  ok: "Aman",
  done: "Terbit",
};
