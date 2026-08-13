import { careerPaths, type CareerPath } from "./mock-data";
import type { Profile } from "./db";

/* ============================================================
 * ENGINE — semua perhitungan nyata & reaktif terhadap input.
 * Fase 1.2: ganti scoreCv() dengan panggilan LLM (server fn /
 * API route) saat key tersedia; heuristic ini jadi fallback.
 * ============================================================ */

const COMMON_KEYWORDS = [
  "communication",
  "team",
  "leadership",
  "problem solving",
  "collaboration",
  "english",
  "bahasa indonesia",
  "detail-oriented",
  "deadline",
  "cross-functional",
  "analytical",
  "presentation",
  "microsoft office",
  "google sheets",
  "notion",
];

export const ROLE_KEYWORDS: Record<string, string[]> = {
  "Product Manager": [
    "product",
    "roadmap",
    "user research",
    "stakeholder",
    "analytics",
    "agile",
    "scrum",
    "jira",
    "retention",
    "activation",
    "gmv",
    "sprint",
    "discovery",
    "prioritization",
    "okr",
    "kpi",
    "requirement",
    "prd",
    "backlog",
    "a/b testing",
  ],
  "Data Analyst": [
    "sql",
    "excel",
    "python",
    "dashboard",
    "tableau",
    "power bi",
    "looker",
    "statistics",
    "etl",
    "visualization",
    "dataset",
    "analytics",
    "query",
    "kpi",
    "reporting",
    "a/b testing",
    "pandas",
    "dbt",
  ],
  "Software Engineer": [
    "javascript",
    "typescript",
    "react",
    "node",
    "python",
    "git",
    "api",
    "rest",
    "database",
    "testing",
    "ci/cd",
    "docker",
    "kubernetes",
    "cloud",
    "aws",
    "gcp",
    "algorithm",
    "refactor",
    "code review",
    "frontend",
    "backend",
  ],
  "UX Designer": [
    "figma",
    "user research",
    "usability",
    "wireframe",
    "prototype",
    "design system",
    "user flow",
    "persona",
    "accessibility",
    "interview",
    "ui",
    "ux",
    "journey",
    "usability testing",
    "sketch",
    "design thinking",
  ],
  "Business Analyst": [
    "requirement",
    "stakeholder",
    "brd",
    "sql",
    "excel",
    "process",
    "workflow",
    "documentation",
    "analysis",
    "reporting",
    "gap analysis",
    "user story",
    "functional",
    "data",
    "flowchart",
    "visio",
  ],
  "Marketing Associate": [
    "campaign",
    "seo",
    "sem",
    "content",
    "social media",
    "copywriting",
    "growth",
    "analytics",
    "crm",
    "email marketing",
    "funnel",
    "conversion",
    "brand",
    "instagram",
    "tiktok",
    "influencer",
    "google ads",
    "meta ads",
  ],
  "Business Operations": [
    "process design",
    "sop",
    "workflow",
    "vendor management",
    "cost",
    "efficiency",
    "scaling",
    "logistics",
    "project management",
    "stakeholder",
    "excel",
    "dashboard",
    "kpi",
    "financial modeling",
    "ops",
    "optimization",
  ],
  "UX Researcher": [
    "user research",
    "interview",
    "usability",
    "qualitative",
    "survey",
    "insight",
    "persona",
    "synthesis",
    "moderator",
    "affinity",
    "ethnography",
    "usability testing",
    "research plan",
    "reporting",
    "responden",
  ],
};

export const ROLE_OPTIONS = [
  "Product Manager",
  "Data Analyst",
  "Software Engineer",
  "UX Designer",
  "Business Analyst",
  "Marketing Associate",
  "Business Operations",
  "UX Researcher",
];

const SECTION_PATTERNS: [string, RegExp][] = [
  ["Summary", /(summary|ringkasan|profil singkat|tentang saya|objective)/i],
  ["Experience", /(experience|pengalaman|work history|riwayat kerja|pekerjaan)/i],
  ["Education", /(education|pendidikan|riwayat pendidikan|universitas|university)/i],
  ["Skills", /(skill|keahlian|kompetensi|technical skills)/i],
  ["Organization", /(organization|organisasi|kepanitiaan|volunteer)/i],
  ["Certification", /(certif|sertifikat|lisensi|license)/i],
];

const METRIC_PATTERN =
  /(\d+(?:\.\d+)?\s*(?:%|persen|jt|juta|kali lipat|kali|tahun|bulan|minggu|orang|tim|user|pengguna|rp|ribu|klien|client|customer|proyek))|\d+%/gi;

const IMPACT_VERBS = [
  "meningkatkan",
  "menurunkan",
  "memangkas",
  "menghemat",
  "mengotomasi",
  "memimpin",
  "mengelola",
  "membangun",
  "meluncurkan",
  "mendesain",
  "mengembangkan",
  "menggandakan",
  "mempercepat",
  "merampingkan",
  "mengubah",
];

export type CvBreakdown = {
  structure: number;
  keywords: number;
  impact: number;
  customization: number;
};

export type CvFeedback = {
  section: string;
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
  rewrite?: { before: string; after: string };
};

export type CvResult = {
  overallScore: number;
  breakdown: CvBreakdown;
  reasoning: string;
  feedback: CvFeedback[];
  roleSpecific: string[];
  keywordHitRate: number;
  metricsFound: number;
  foundKeywords: string[];
  missingKeywords: string[];
};

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));

export function scoreCv(text: string, roleTarget: string): CvResult {
  const t = text.toLowerCase();
  const bank = ROLE_KEYWORDS[roleTarget] ?? ROLE_KEYWORDS["Product Manager"]!;
  const allBank = [...bank, ...COMMON_KEYWORDS];

  const found = allBank.filter((k) => t.includes(k.toLowerCase()));
  const foundSet = new Set(found);
  const foundRoleKeywords = bank.filter((k) => foundSet.has(k));
  const missingRoleKeywords = bank.filter((k) => !foundSet.has(k));
  const hitRate = bank.length === 0 ? 0 : foundRoleKeywords.length / bank.length;

  const metrics = (t.match(METRIC_PATTERN) ?? []).length;
  const impactVerbHits = IMPACT_VERBS.filter((v) => t.includes(v)).length;

  const sections = SECTION_PATTERNS.filter(([, re]) => re.test(t)).map(([n]) => n);
  const hasSummary = sections.includes("Summary");
  const hasSkills = sections.includes("Skills");

  // Skor per kategori
  const keywords = clamp(Math.round(hitRate * 70 + found.length * 1.5));
  const impact = clamp(Math.round(35 + metrics * 9 + impactVerbHits * 5));
  const structure = clamp(
    Math.round(sections.length * 15 + (hasSummary ? 8 : 0) + (hasSkills ? 4 : 0)),
  );
  const customization = clamp(
    Math.round(
      (t
        .slice(0, 400)
        .split(" ")
        .filter((w) => bank.some((k) => k.includes(w) || w.includes(k))).length > 2
        ? 45
        : 25) +
        (impactVerbHits >= 2 ? 25 : 10) +
        (metrics >= 2 ? 30 : 12),
    ),
  );

  const overallScore = clamp(
    Math.round(keywords * 0.3 + impact * 0.3 + structure * 0.2 + customization * 0.2),
  );

  const feedback: CvFeedback[] = [];
  if (!hasSummary) {
    feedback.push({
      section: "Summary",
      issue: "Tidak ada summary/profil singkat — recruiter butuh konteks 5 detik pertama.",
      suggestion: `Tulis 2-3 kalimat: siapa kamu, fokus utama, dan 1 pencapaian terukur untuk role ${roleTarget}.`,
      priority: "high",
      rewrite: {
        before: "(tidak ada bagian summary)",
        after: `Analis dengan 2+ tahun pengalaman yang menerjemahkan data jadi keputusan — memangkas waktu reporting 40% untuk 3 tim bisnis.`,
      },
    });
  } else if (metrics < 2) {
    feedback.push({
      section: "Summary",
      issue: "Summary terlalu generik, tanpa metrik",
      suggestion: "Kuantifikasi pencapaian: Led team of X, improved Y by Z%",
      priority: "high",
      rewrite: {
        before: "Professional yang bersemangat dan pekerja keras.",
        after: `Spesialis ${roleTarget} yang mengubah data operasional jadi keputusan — memangkas waktu reporting 40% untuk 3 tim bisnis.`,
      },
    });
  }
  if (metrics < 2) {
    feedback.push({
      section: "Experience",
      issue: "Deskripsi tugas, bukan hasil — tidak ada angka yang bisa diukur.",
      suggestion: "Pakai format Action + Metric + Impact di tiap bullet.",
      priority: "high",
      rewrite: {
        before: "Bertanggung jawab membuat laporan mingguan.",
        after:
          "Mengotomasi 12 laporan mingguan lewat SQL + Sheets, menghemat ~15 jam kerja tim per bulan.",
      },
    });
  }
  if (hitRate < 0.45) {
    feedback.push({
      section: "Skills",
      issue: `Keyword ATS untuk role ${roleTarget} belum cukup (${foundRoleKeywords.length}/${bank.length}).`,
      suggestion: `Tambahkan minimal: ${missingRoleKeywords.slice(0, 4).join(", ")}.`,
      priority: "medium",
    });
  }
  if (hitRate >= 0.45 && !hasSkills) {
    feedback.push({
      section: "Skills",
      issue: "Skill sudah muncul di teks tapi belum ada section Skills terpisah.",
      suggestion: "Buat section Skills terpisah agar terbaca ATS lebih awal.",
      priority: "medium",
    });
  }
  if (impactVerbHits < 2) {
    feedback.push({
      section: "Impact",
      issue: "Verba hasil (meningkatkan, memangkas, mengotomasi) hampir tidak ada.",
      suggestion: "Awali bullet dengan verba berdampak, bukan 'bertanggung jawab untuk...'.",
      priority: "medium",
    });
  }
  if (sections.length < 4) {
    feedback.push({
      section: "Structure",
      issue: `Hanya ${sections.length}/6 bagian standar terdeteksi (${sections.join(", ") || "tidak ada"}).`,
      suggestion: "Lengkapi: Summary, Experience, Education, Skills, Organization, Certification.",
      priority: "low",
    });
  } else {
    feedback.push({
      section: "Education",
      issue: "Detail pendidikan bisa dirapikan untuk role target.",
      suggestion:
        "Fokuskan pada coursework/proyek relevan dan IPK bila di atas 3.3; hapus detail SMA.",
      priority: "low",
    });
  }

  const strengths: string[] = [];
  if (hitRate >= 0.5)
    strengths.push(`keyword ${roleTarget} sudah kuat (${Math.round(hitRate * 100)}%)`);
  if (metrics >= 3) strengths.push(`dampak terukur cukup (${metrics} metrik terdeteksi)`);
  if (sections.length >= 5) strengths.push("struktur lengkap");
  if (impactVerbHits >= 2) strengths.push("verba hasil yang baik");

  const reasoning = strengths.length
    ? `Bagus: ${strengths.join(", ")}. Fokus perbaikan: ${
        feedback
          .filter((f) => f.priority === "high")
          .map((f) => f.section.toLowerCase())
          .join(", ") || "tuning kecil di beberapa bagian"
      }.`
    : `CV kamu belum optimal untuk ${roleTarget}: struktur ${sections.length}/6 bagian, keyword ${Math.round(
        hitRate * 100,
      )}%, dan hanya ${metrics} metrik terukur. Prioritaskan menambah angka dan keyword role.`;

  const roleSpecific = [
    `Untuk role ${roleTarget}: tambahkan metrik kunci — ${ROLE_METRICS[roleTarget] ?? "growth, retention, atau efisiensi"} — di minimal 2 bullet.`,
    `Tulis ulang summary agar menyebut "${bank.slice(0, 2).join('" dan "')}" secara eksplisit.`,
    "Pindahkan section Skills ke atas Education agar terbaca ATS lebih awal.",
  ];

  return {
    overallScore,
    breakdown: { structure, keywords, impact, customization },
    reasoning,
    feedback,
    roleSpecific,
    keywordHitRate: hitRate,
    metricsFound: metrics,
    foundKeywords: foundRoleKeywords.slice(0, 10),
    missingKeywords: missingRoleKeywords.slice(0, 6),
  };
}

const ROLE_METRICS: Record<string, string> = {
  "Product Manager": "retention, activation, GMV, atau waktu-to-market",
  "Data Analyst": "ukuran dataset, waktu proses query, akurasi model",
  "Software Engineer": "latency, coverage test, pengguna yang dilayani",
  "UX Designer": "skor usability, konversi flow, waktu menyelesaikan tugas",
  "Business Analyst": "efisiensi proses, jumlah stakeholder, jam kerja tersimpan",
  "Marketing Associate": "ROAS, CPM, conversion rate, growth follower",
};

/* ---------------- Match score algoritmik ---------------- */

const CATEGORY_OF: Record<string, string> = {
  "Product Manager": "Product",
  "Data Analyst": "Data",
  "Software Engineer": "Engineering",
  "UX Designer": "Design",
  "Business Analyst": "Business",
  "Marketing Associate": "Marketing",
};

const RIASEC_AFFINITY: Record<string, string[]> = {
  "Product Manager": ["E", "I"],
  "Data Analyst": ["I", "C"],
  "Software Engineer": ["R", "I"],
  "UX Designer": ["A", "S"],
  "Business Analyst": ["C", "E"],
  "Marketing Associate": ["E", "A"],
};

export function computeMatches(
  profile: Pick<Profile, "skills" | "interest" | "riasec" | "yearsExp">,
): (CareerPath & { matched: string[]; gap: string[] })[] {
  const p = profile;
  return careerPaths
    .map((path) => {
      let score = 30; // baseline
      const matched: string[] = [];
      const gap: string[] = [];

      // 1. Minat (kategori)
      if (CATEGORY_OF[path.title] === p.interest) score += 25;
      else if (path.title.toLowerCase().includes(p.interest.toLowerCase())) score += 15;

      // 2. Skill overlap — punya ∩ need
      const norm = (s: string) => s.toLowerCase();
      for (const need of path.skillsGap.need) {
        if (p.skills.some((s) => norm(s).includes(need.split(" ")[0]!.toLowerCase()))) {
          score += 9;
          matched.push(need);
        } else {
          gap.push(need);
        }
      }
      for (const have of path.skillsGap.have) {
        if (p.skills.some((s) => norm(s).includes(have.split(" ")[0]!.toLowerCase()))) score += 4;
      }

      // 3. RIASEC
      const affinity = RIASEC_AFFINITY[path.title] ?? [];
      if (p.riasec && affinity.some((l) => p.riasec.includes(l))) score += 12;

      // 4. Pengalaman
      if (path.title === "Business Operations" && p.yearsExp >= 2) score += 8;
      if (path.title === "Product Manager" && p.yearsExp >= 1) score += 4;
      if (path.title === "Data Analyst" && p.yearsExp <= 3) score += 6;

      return {
        ...path,
        matchScore: clamp(Math.round(score), 30, 97),
        matched,
        gap,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/* ---------------- Quiz RIASEC (versi ringkas) ---------------- */

export const RIASEC_QUESTIONS: { a: string; b: string; aCode: string; bCode: string }[] = [
  {
    a: "Menyusun/membangun sesuatu dengan tangan atau alat",
    b: "Mempelajari teori dan data untuk memahami masalah",
    aCode: "R",
    bCode: "I",
  },
  {
    a: "Menganalisis angka dan pola",
    b: "Menggambar, menulis, atau mendesain sesuatu",
    aCode: "I",
    bCode: "A",
  },
  {
    a: "Membantu orang lain menyelesaikan masalah pribadi",
    b: "Mengatur jadwal, data, dan prosedur agar rapi",
    aCode: "S",
    bCode: "C",
  },
  {
    a: "Memimpin diskusi dan meyakinkan orang",
    b: "Bekerja sendiri dengan alat dan mesin",
    aCode: "E",
    bCode: "R",
  },
  {
    a: "Meneliti topik sampai paham akar masalahnya",
    b: "Membujuk orang membeli atau mendukung ide",
    aCode: "I",
    bCode: "E",
  },
  {
    a: "Membuat karya visual/cerita yang menyentuh orang",
    b: "Mengikuti prosedur dan standar yang jelas",
    aCode: "A",
    bCode: "C",
  },
  {
    a: "Mengajar atau melatih orang lain",
    b: "Mengoperasikan/memperbaiki peralatan teknis",
    aCode: "S",
    bCode: "R",
  },
  {
    a: "Mengorganisir acara dan mengkoordinasi banyak pihak",
    b: "Mendalami satu topik dengan riset mendalam",
    aCode: "E",
    bCode: "I",
  },
  {
    a: "Merapikan sistem/file agar semua orang mudah menemukan",
    b: "Berempati dan mendampingi orang yang kesulitan",
    aCode: "C",
    bCode: "S",
  },
  {
    a: "Memperbaiki gadget atau mesin",
    b: "Menulis artikel/konten yang memengaruhi orang",
    aCode: "R",
    bCode: "A",
  },
  {
    a: "Menghitung dan mengecek akurasi laporan",
    b: "Memimpin proyek dan menentukan arah tim",
    aCode: "C",
    bCode: "E",
  },
  {
    a: "Menggambar desain produk baru",
    b: "Menjadi sukarelawan membantu komunitas",
    aCode: "A",
    bCode: "S",
  },
];

const LETTERS = ["R", "I", "A", "S", "E", "C"] as const;
const RIASEC_LABEL: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export function scoreRiasec(answers: string[]): { code: string; label: string; top3: string[] } {
  const counts: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  answers.forEach((l) => {
    if (l && counts[l] !== undefined) counts[l]!++;
  });
  const ranked = [...LETTERS].sort((x, y) => counts[y]! - counts[x]!);
  const code = ranked.slice(0, 3).join("");
  return {
    code,
    label: RIASEC_LABEL[ranked[0]!]!,
    top3: ranked.slice(0, 3).map((l) => RIASEC_LABEL[l]!),
  };
}

/* ---------------- Konten market (diperbarui) ---------------- */

export const marketUpdatedAt = "2026-08-10";

export const marketShareText =
  "Gaji & skill paling dicari di Indonesia 2026 🚀 Data pasar kerja real-time dari MULAI+ Career Compass. Cek jalur kariermu gratis:";

/* ---------------- Analisis inline (pratinjau CV ber-highlight) ---------------- */

export type AnnotLine = {
  text: string;
  kind: "heading" | "metric" | "keyword" | "generic" | "neutral";
};

const SECTION_WORDS = new Set([
  "summary",
  "ringkasan",
  "profil",
  "tentang saya",
  "objective",
  "pengalaman",
  "experience",
  "riwayat kerja",
  "pekerjaan",
  "pendidikan",
  "education",
  "universitas",
  "university",
  "skill",
  "keahlian",
  "kompetensi",
  "organisasi",
  "organization",
  "kepanitiaan",
  "volunteer",
  "sertifikat",
  "certification",
  "lisensi",
  "license",
]);

const HAS_METRIC_RE =
  /(\d+(?:\.\d+)?\s*(?:%|persen|jt|juta|kali lipat|kali|tahun|bulan|minggu|orang|tim|user|pengguna|rp|ribu|klien|client|customer|proyek))|\d+%/i;

/**
 * Pecah teks CV jadi baris ber-annotasi untuk pratinjau inline:
 * - heading: judul bagian (summary/pengalaman/skill…)
 * - metric : baris dengan angka + verba dampak (baik)
 * - keyword: baris mengandung keyword role target (baik)
 * - generic: kalimat panjang tanpa angka & tanpa keyword (perlu diperbaiki)
 */
export function annotateCv(text: string, roleTarget: string): AnnotLine[] {
  const bank = new Set((ROLE_KEYWORDS[roleTarget] ?? []).map((k) => k.toLowerCase()));
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const low = line.toLowerCase();
      const isHeading =
        line.length < 48 &&
        (SECTION_WORDS.has(low.replace(/[:：].*$/, "").trim()) ||
          low.endsWith(":") ||
          low.endsWith("：") ||
          /^[A-Z][A-Z0-9\s]{2,}$/.test(low));
      if (isHeading) return { text: line, kind: "heading" as const };
      const hasMetric = HAS_METRIC_RE.test(line);
      const hasVerb = IMPACT_VERBS.some((v) => low.includes(v));
      const hasKw = [...bank].some((k) => low.includes(k));
      if (hasMetric) return { text: line, kind: "metric" as const };
      if (hasVerb) return { text: line, kind: "metric" as const };
      if (hasKw) return { text: line, kind: "keyword" as const };
      if (line.length > 20 && line.length < 220 && !/\d/.test(line))
        return { text: line, kind: "generic" as const };
      return { text: line, kind: "neutral" as const };
    });
}

/** Label kualitas skor agar hasil terasa "dibaca manusia". */
export function scoreGrade(score: number): {
  label: string;
  tone: "success" | "brand" | "warning" | "destructive";
} {
  if (score >= 85) return { label: "Siap lamar 🎯", tone: "success" };
  if (score >= 70) return { label: "Layak lamar", tone: "brand" };
  if (score >= 55) return { label: "Perlu polesan", tone: "warning" };
  return { label: "Butuh perombakan", tone: "destructive" };
}

/** Poin skor yang didapat jika saran diterapkan (untuk estimasi real-time). */
export const FIX_DELTA: Record<string, number> = { high: 10, medium: 5, low: 2 };

/* ============================================================
 * CAREER OS — konten & logika Tier 1 (coach, interview, skill,
 * roadmap, outcome). Semua mock data, siap diganti LLM/backend.
 * ============================================================ */

export type CoachContext = {
  name: string;
  role: string;
  interest: string;
  topPathTitle: string;
  topPathMatch: number;
  cvScore: number | null;
  verifiedSkills: string[];
  xp: number;
};

export type CoachReply = {
  text: string;
  chips: { label: string; to: string }[];
};

const COACH_FALLBACK_CHIPS = [
  { label: "Cara naikin skor CV", to: "/cv-audit" },
  { label: "Jalur karier yang cocok", to: "/career" },
  { label: "Persiapan interview", to: "/interview" },
  { label: "Cari mentor", to: "/mentors" },
];

/** Coach berbasis intent (heuristic). Ganti dengan LLM di Tier 2. */
export function coachReply(raw: string, ctx: CoachContext): CoachReply {
  const t = raw.toLowerCase();
  const greet = ctx.name.split(" ")[0];
  const topPath = ctx.topPathTitle || "jalur yang sedang kamu pertimbangkan";
  const cv = ctx.cvScore;

  if (/(cv|resume|audit|skor)/.test(t)) {
    return {
      text:
        (cv != null
          ? `Skor CV terakhirmu ${cv}/100. Pola yang paling sering menjatuhkan skor: (1) tidak ada angka — ganti "bertanggung jawab membuat laporan" jadi "mengotomasi 12 laporan, menghemat 15 jam/bulan", (2) keyword role ${ctx.interest} belum cukup.`
          : "Kamu belum pernah audit CV. Mulai dari sana — gratis, 30 detik.") +
        `\n\nSaran aksi: tempel CV di halaman CV Audit, pilih role target "${ctx.interest}", lalu salin semua rewrite yang disarankan.`,
      chips: [
        { label: "Audit CV sekarang", to: "/cv-audit" },
        ...COACH_FALLBACK_CHIPS.filter((c) => c.to !== "/cv-audit"),
      ],
    };
  }
  if (/(gaji|salary|bayaran|kompensasi)/.test(t)) {
    return {
      text: `Untuk ${topPath} di Indonesia, benchmark-nya sekitar: junior Rp 70–96jt/thn, mid Rp 120–180jt/thn, senior Rp 190–320jt/thn (tergantung industri & kota).\n\nLihat data lengkap + tren di halaman Market Signals, dan gunakan angka itu saat negosiasi — jangan tanya gaji duluan, tunjukkan nilai dulu.`,
      chips: [
        { label: "Lihat data gaji", to: "/market" },
        { label: "Cari mentor role ini", to: "/mentors" },
      ],
    };
  }
  if (/(transisi|pindah|switch|ganti jalur)/.test(t)) {
    return {
      text: `Pindah jalur itu normal — bahkan di Indonesia, mayoritas PM & Data Analyst memulai dari peran lain.\n\nRencana realistis: (1) petakan skill yang sudah kamu punya (${ctx.verifiedSkills.length} terverifikasi di profilmu), (2) tutup gap dengan jalur yang cocok, (3) minta review dari mentor yang sudah melewatinya. Langkah 1: cek jalur terbaik untukmu di Career Recommend.`,
      chips: [
        { label: "Lihat rekomendasi jalur", to: "/career" },
        { label: "Cari mentor transisi", to: "/mentors" },
      ],
    };
  }
  if (/(interview|wawancara|wawancarai|tanya jawab)/.test(t)) {
    return {
      text: `Persiapan interview yang jarang dilakukan orang: latihan lisan (bukan cuma baca).\n\nGunakan halaman Interview Prep: jawab 8 pertanyaan untuk role ${ctx.interest} dengan metode STAR, dapatkan feedback instan. Lalu booking mentor untuk mock interview yang jujur.`,
      chips: [
        { label: "Latihan interview", to: "/interview" },
        { label: "Booking mock interview", to: "/mentors" },
      ],
    };
  }
  if (/(skill|keahlian|belajar|kursus|upgrade)/.test(t)) {
    return {
      text: `Skill yang lagi naik untuk bidangmu: Product Analytics (+27% YoY), SQL (+11%), dan skill AI jadi pembeda (lowongan yang menyebut LLM rata-rata +22% gaji).\n\nBuktikan skill-mu dengan quiz di halaman Skills — badge terverifikasi bikin profilmu menonjol ke recruiter & mentor.`,
      chips: [
        { label: "Uji skill-mu", to: "/skills" },
        { label: "Data skill in-demand", to: "/market" },
      ],
    };
  }
  if (/(mentor|pembimbing)/.test(t)) {
    return {
      text: `Mentor terbaik untukmu adalah yang sudah melewati jalur ${ctx.interest}. Di marketplace kami ada mentor dengan rating 4.4–4.9; beberapa gratis untuk mahasiswa & fresh grad.\n\nSaran: siapkan 3 pertanyaan spesifik sebelum sesi (bukan "gimana caranya sukses?").`,
      chips: [{ label: "Cari mentor", to: "/mentors" }],
    };
  }
  if (/(bingung|buntu|tidak tahu|nggak tahu|stuck|kehilangan arah)/.test(t)) {
    return {
      text: `Tenang, ${greet} — kebingungan itu sinyal, bukan kegagalan. Yang kamu butuhkan bukan "cita-cita", tapi langkah kecil berikutnya.\n\nMulai dari: 1) audit CV (tahu posisimu), 2) lihat 3 jalur teratas (tahu arah), 3) ambil 1 langkah minggu ini. Kamu tidak harus tahu semua sekarang.`,
      chips: [
        { label: "Temukan arahmu", to: "/career" },
        { label: "Audit CV", to: "/cv-audit" },
      ],
    };
  }
  if (/(semangat|motivasi|lelah|capek|gagal|ditolak|rejected)/.test(t)) {
    return {
      text: `Ditolak itu statistik, bukan vonis — rata-rata butuh 20–30 lamaran untuk 1 tawaran, dan sebagian besar fresh grad ditolak lebih dulu karena CV, bukan karena "tidak layak".\n\nYang bisa kamu kendalikan: skor CV, skill terverifikasi, dan jumlah latihan interview. Semuanya ada di aplikasi ini. Catat lamaranmu di Tracker dan lihat progresnya.`,
      chips: [
        { label: "Catat lamaran", to: "/tracker" },
        { label: "Latihan interview", to: "/interview" },
      ],
    };
  }
  if (/(halo|hai|hi|pagi|siang|sore|malam|terima kasih|makasih|thanks)/.test(t)) {
    return {
      text: `Halo ${greet}! 👋 Aku coach kariermu.\n\nAku sudah baca profilmu (${ctx.role ?? "belum lengkap"}), jadi pertanyaan apa pun tentang jalur karier, CV, gaji, interview, atau skill — tanya aja. Contoh: "Jalur apa yang cocok buatku?"`,
      chips: COACH_FALLBACK_CHIPS,
    };
  }
  return {
    text: `Hmm, biar aku bantu lebih tepat — kamu bisa tanya soal:\n\n• CV & skor (mis. "cara naikin skor CV")\n• Jalur karier ("jalur yang cocok buatku")\n• Gaji ("gaji ${ctx.interest} berapa")\n• Interview ("gimana persiapan interview")\n• Skill ("skill apa yang harus kupelajari")\n\nAtau pilih salah satu di bawah.`,
    chips: COACH_FALLBACK_CHIPS,
  };
}

/* ---------------- Interview Prep ---------------- */

export const INTERVIEW_ROLE_QUESTIONS: Record<string, string[]> = {
  "Product Manager": [
    "Ceritakan produk atau fitur yang pernah kamu dorong dari ide sampai rilis.",
    "Bagaimana kamu memprioritaskan 10 permintaan fitur dengan resource terbatas?",
    "Metrik apa yang kamu pakai untuk mengukur keberhasilan sebuah fitur, dan kenapa?",
    "Ceritakan saat kamu harus membujuk stakeholder yang tidak setuju denganmu.",
    "Bagaimana cara kamu melakukan riset user sebelum mengambil keputusan produk?",
    "Ceritakan kegagalan produk — apa yang kamu pelajari dan ubah?",
    "Apa keputusan sulit yang pernah kamu ambil tanpa data lengkap?",
    "Pertanyaan apa yang ingin kamu tanyakan ke interviewer tentang tim ini?",
  ],
  "Data Analyst": [
    "Ceritakan analisis data yang mengubah keputusan bisnis.",
    "Data kotor: bagaimana kamu menanganinya sebelum analisis?",
    "Metrik apa yang lebih penting: akurasi atau kecepatan? Jelaskan.",
    "Ceritakan saat analisismu salah dan bagaimana kamu menyadarinya.",
    "Bagaimana kamu menjelaskan hasil analisis ke orang non-teknis?",
    "SQL: ceritakan query kompleks yang pernah kamu tulis.",
    "Bagaimana kamu memastikan rekomendasimu benar-benar dipakai tim bisnis?",
    "Pertanyaan apa yang ingin kamu tanyakan tentang data di perusahaan ini?",
  ],
  "Software Engineer": [
    "Ceritakan fitur/API yang pernah kamu bangun dari nol.",
    "Bagaimana kamu menangani bug yang muncul di produksi?",
    "Jelaskan perbedaan REST vs GraphQL dan kapan pakai masing-masing.",
    "Bagaimana cara kamu memastikan kode kamu mudah dipelihara?",
    "Ceritakan saat kamu harus refactor kode lama yang berantakan.",
    "Bagaimana kamu melakukan code review yang baik?",
    "Situasi di mana kamu berdebat soal solusi teknis dengan rekan.",
    "Pertanyaan apa yang ingin kamu tanyakan tentang tech stack tim ini?",
  ],
  "UX Designer": [
    "Ceritakan proses desain kamu dari riset sampai handoff.",
    "Bagaimana kamu mengukur apakah desainmu berhasil?",
    "Ceritakan saat user testing menemukan masalah besar di desainmu.",
    "Bagaimana kamu menangani feedback yang bertentangan dari stakeholder?",
    "Jelaskan keputusan desain yang kamu ambil dan pertahankan.",
    "Bagaimana kamu bekerja sama dengan engineer untuk feasibility?",
    "Ceritakan desain yang kamu buat tapi akhirnya tidak diluncurkan.",
    "Pertanyaan apa yang ingin kamu tanyakan tentang produk tim ini?",
  ],
  "Business Analyst": [
    "Ceritakan proses bisnis yang pernah kamu perbaiki.",
    "Bagaimana kamu menggali requirement dari stakeholder yang tidak jelas?",
    "Ceritakan dokumen (BRD/PRD) yang pernah kamu buat dan dampaknya.",
    "Bagaimana kamu menangani perubahan requirement di tengah proyek?",
    "Bagaimana kamu memastikan solusi teknis sesuai kebutuhan bisnis?",
    "Ceritakan saat kamu menemukan data yang kontradiktif.",
    "Bagaimana kamu memprioritaskan kebutuhan banyak stakeholder?",
    "Pertanyaan apa yang ingin kamu tanyakan tentang operasional tim ini?",
  ],
  "Marketing Associate": [
    "Ceritakan campaign yang pernah kamu jalankan dan hasilnya.",
    "Metrik apa yang kamu pantau saat campaign berjalan?",
    "Bagaimana kamu menentukan target audience sebuah campaign?",
    "Ceritakan campaign yang gagal dan yang kamu pelajari.",
    "Bagaimana kamu membedakan performa organic vs paid?",
    "Ceritakan saat kamu harus kreatif dengan budget terbatas.",
    "Bagaimana cara kamu menulis copy yang konversi?",
    "Pertanyaan apa yang ingin kamu tanyakan tentang marketing di sini?",
  ],
};

export const STAR_TEMPLATE = {
  title: "Metode STAR — struktur jawaban yang diterima interviewer",
  steps: [
    { s: "Situation", d: "Berikan konteks singkat: kapan, di mana, situasinya apa. (1-2 kalimat)" },
    { s: "Task", d: "Apa tanggung jawabmu di situ? Jangan bicara soal tim, bicara soal KAMU." },
    {
      s: "Action",
      d: "Langkah spesifik yang kamu ambil. Pakai verba: memimpin, mengotomasi, merancang…",
    },
    { s: "Result", d: "Hasil terukur dengan angka: %, jumlah, waktu yang dihemat." },
  ],
};

const STAR_WORDS = [
  "situasi",
  "tugas",
  "tanggung jawab",
  "action",
  "hasil",
  "result",
  "saya",
  "aku",
  "tim",
  "meningkat",
  "menurun",
  "menghemat",
  "memimpin",
  "membangun",
  "mengotomasi",
  "berhasil",
];

/** Feedback mock interview sederhana (heuristic — siap diganti LLM). */
export function evaluateAnswer(answer: string): { score: number; tips: string[] } {
  const t = answer.toLowerCase();
  const len = t.trim().length;
  const hits = STAR_WORDS.filter((w) => t.includes(w)).length;
  const hasNumber = /\d/.test(t);
  let score = 20;
  if (len >= 120) score += 20;
  else if (len >= 60) score += 10;
  score += Math.min(30, hits * 4);
  if (hasNumber) score += 20;
  if (len < 40) score -= 15;
  score = Math.max(5, Math.min(98, score));

  const tips: string[] = [];
  if (len < 80) tips.push("Jawaban terlalu pendek — target 2–4 kalimat dengan satu contoh nyata.");
  if (!hasNumber) tips.push("Tambahkan 1 angka/ukuran (persen, jumlah orang, waktu yang dihemat).");
  if (!/(situasi|tugas|action|hasil|result)/.test(t))
    tips.push("Strukturkan dengan STAR: mulai dari situasi → tugas kamu → aksi → hasil.");
  if (!/(saya|aku)/.test(t))
    tips.push("Fokus pada kontribusimu, bukan tim — sebutkan apa yang KAMU lakukan.");
  if (tips.length === 0)
    tips.push(
      "Jawaban sudah terstruktur dan terukur. Latih lagi dengan keras (bicara, bukan baca) untuk kefasihan.",
    );
  return { score, tips };
}

/* ---------------- Skill Quiz ---------------- */

export type Quiz = {
  skill: string;
  questions: { q: string; options: string[]; correct: number; explain: string }[];
};

export const SKILL_QUIZZES: Quiz[] = [
  {
    skill: "SQL",
    questions: [
      {
        q: "Manakah yang benar untuk mengambil semua kolom dari tabel 'users'?",
        options: ["SELECT * FROM users;", "GET users;", "FETCH ALL users;", "SELECT ALL users;"],
        correct: 0,
        explain: "SELECT * FROM mengambil semua kolom.",
      },
      {
        q: "Bagaimana cara mengambil 10 baris pertama?",
        options: ["TOP 10", "LIMIT 10", "FIRST 10", "ROWNUM 10"],
        correct: 1,
        explain: "LIMIT 10 (MySQL/Postgres) membatasi jumlah baris.",
      },
      {
        q: "Fungsi untuk menghitung jumlah baris?",
        options: ["SUM()", "COUNT()", "TOTAL()", "NUM()"],
        correct: 1,
        explain: "COUNT() menghitung jumlah baris; SUM() menjumlahkan nilai.",
      },
      {
        q: "JOIN yang mengambil semua baris dari tabel kiri walau tak ada pasangan?",
        options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "CROSS JOIN"],
        correct: 2,
        explain: "LEFT JOIN mempertahankan semua baris tabel kiri.",
      },
      {
        q: "Klausa untuk mengelompokkan data?",
        options: ["GROUP BY", "SORT BY", "CLUSTER BY", "ORDER GROUP"],
        correct: 0,
        explain: "GROUP BY mengelompokkan baris dengan nilai yang sama.",
      },
    ],
  },
  {
    skill: "Excel",
    questions: [
      {
        q: "Fungsi untuk mencari nilai maksimum?",
        options: ["MAX()", "LARGE()", "HIGH()", "TOP()"],
        correct: 0,
        explain: "MAX(range) mengembalikan nilai terbesar.",
      },
      {
        q: "Fungsi untuk menggabungkan teks dari dua sel?",
        options: ["JOIN()", "CONCATENATE()", "MERGE()", "LINK()"],
        correct: 1,
        explain: 'CONCATENATE(A1," ",B1) menggabungkan teks.',
      },
      {
        q: "Shortcut pivot table?",
        options: ["Ctrl+P", "Alt+N+V", "Ctrl+Shift+P", "F5"],
        correct: 1,
        explain: "Alt+N+V membuka menu PivotTable (Windows).",
      },
      {
        q: "VLOOKUP mencari nilai di kolom ke berapa?",
        options: ["Kolom pertama", "Kolom terakhir", "Kolom mana pun", "Kolom kedua"],
        correct: 0,
        explain: "VLOOKUP mencari di kolom pertama range, lalu mengambil kolom lain.",
      },
      {
        q: "Cara menandai sel duplikat?",
        options: [
          "Conditional Formatting → Duplicate Values",
          "Data → Remove",
          "Filter → Unique",
          "Format → Copy",
        ],
        correct: 0,
        explain: "Conditional Formatting punya preset Duplicate Values.",
      },
    ],
  },
  {
    skill: "Python",
    questions: [
      {
        q: "Tipe data untuk daftar yang bisa diubah?",
        options: ["tuple", "list", "set (frozen)", "string"],
        correct: 1,
        explain: "list bisa diubah; tuple tidak.",
      },
      {
        q: "Cara membaca file CSV?",
        options: [
          "csv.open()",
          "open() + csv.reader / pandas.read_csv",
          "file.read_csv()",
          "import csvfile",
        ],
        correct: 1,
        explain: "pandas.read_csv() atau open()+csv.reader adalah cara standar.",
      },
      {
        q: "Apa output dari 7 // 2?",
        options: ["3.5", "3", "4", "Error"],
        correct: 1,
        explain: "// adalah pembagian integer (floor).",
      },
      {
        q: "Library utama untuk analisis data?",
        options: ["numpy", "pandas", "matplotlib", "semua benar"],
        correct: 3,
        explain: "Pandas (data), NumPy (numerik), Matplotlib (visualisasi).",
      },
      {
        q: "Cara membuat fungsi?",
        options: ["function nama():", "def nama():", "func nama():", "method nama():"],
        correct: 1,
        explain: "def adalah keyword untuk mendefinisikan fungsi.",
      },
    ],
  },
  {
    skill: "Figma",
    questions: [
      {
        q: "Fitur untuk membuat komponen yang bisa dipakai ulang?",
        options: ["Auto Layout", "Components", "Variants", "Styles"],
        correct: 1,
        explain: "Component = elemen yang bisa dipakai ulang & di-update massal.",
      },
      {
        q: "Shortcut untuk Frame?",
        options: ["F", "A", "K", "G"],
        correct: 0,
        explain: "F = Frame, A = Frame (dalam konteks tertentu), K = pen tool.",
      },
      {
        q: "Auto Layout digunakan untuk?",
        options: [
          "Menggambar vektor",
          "Menata elemen otomatis responsif",
          "Mengekspor aset",
          "Membuat prototype",
        ],
        correct: 1,
        explain: "Auto Layout membuat spacing & resize otomatis.",
      },
      {
        q: "Cara membagikan file untuk kolaborasi?",
        options: ["Export PNG", "Tombol Share di kanan atas", "Save as link", "Copy frame"],
        correct: 1,
        explain: "Share (kanan atas) memberi link kolaborasi real-time.",
      },
      {
        q: "Prototype: cara menghubungkan dua frame?",
        options: [
          "Shift+klik",
          "Mode Prototype lalu tarik node antar frame",
          "Ctrl+E",
          "Double click",
        ],
        correct: 1,
        explain: "Di mode Prototype, seret node dari frame ke frame.",
      },
    ],
  },
];

/* ---------------- Roadmap mingguan ---------------- */

export const ROADMAP_WEEKS: Record<string, string[]> = {
  pm001: [
    "Baca 3 artikel product discovery & catat kerangkanya",
    "Wawancara 2 orang yang pernah pakai produk (riset ringan)",
    "Tulis 1 PRD singkat untuk fitur fiktif",
    "Buat roadmap 3 bulan versi kamu (prioritas + alasan)",
    "Audit CV ulang dengan role target Product Manager",
    "Latihan 8 pertanyaan interview PM",
  ],
  da002: [
    "Selesaikan 1 modul SQL lanjutan (window functions)",
    "Buat dashboard 1 halaman di Looker/Metabase/Excel",
    "Analisis 1 dataset publik dan tulis 3 insight",
    "Latihan soal statistik dasar (mean, median, distribusi)",
    "Audit CV ulang dengan role target Data Analyst",
    "Latihan 8 pertanyaan interview Data Analyst",
  ],
  bo003: [
    "Petakan 1 proses kerja dan temukan bottleneck-nya",
    "Belajar financial modeling dasar (1 template)",
    "Tulis 1 proposal efisiensi proses (1 halaman)",
    "Ikut 1 komunitas ops (Slack/event)",
    "Audit CV ulang dengan role target Business Operations",
    "Latihan 8 pertanyaan interview BizOps",
  ],
  ux004: [
    "Lakukan 1 usability test informal (5 orang)",
    "Buat 1 research plan untuk masalah sederhana",
    "Sintesis hasil wawancara → 3 insight",
    "Belajar dasar synthesis & affinity mapping",
    "Audit CV ulang dengan role target UX Researcher",
    "Latihan 8 pertanyaan interview UX Research",
  ],
};

/* ---------------- Outcome reports (data moat) ---------------- */

export const OUTCOME_REPORTS = [
  {
    title: "CV dengan metrik = 3x lebih sering dipanggil",
    stat: "3.1x",
    body: "Dari 1.240 lamaran yang dilacak user, CV dengan minimal 3 angka terukur di bullet pengalaman menerima 3.1x panggilan interview dibanding CV deskriptif.",
  },
  {
    title: "Fresh grad butuh rata-rata 23 lamaran",
    stat: "23",
    body: "Median lamaran sebelum tawaran pertama untuk lulusan 2024-2025: 23. Yang berhenti di 5-10 lamaran sering menyerah terlalu cepat.",
  },
  {
    title: "Quiz skill ≥70 = peluang 41% lebih tinggi",
    stat: "+41%",
    body: "User dengan badge skill terverifikasi (SQL/Excel) mendapat respons recruiter 41% lebih tinggi pada role data & analitik.",
  },
];

export const LEADERBOARD_MOCK = [
  { name: "Rafi A.", campus: "UI", xp: 640, streak: 12 },
  { name: "Salsabila", campus: "ITB", xp: 485, streak: 8 },
  { name: "Bagas P.", campus: "UGM", xp: 420, streak: 6 },
  { name: "Citra W.", campus: "Binus", xp: 355, streak: 9 },
  { name: "Yoga N.", campus: "Telkom", xp: 300, streak: 4 },
  { name: "Andini R.", campus: "Unair", xp: 240, streak: 5 },
];

/* ============================================================
 * KORELASI CV ↔ JALUR KARIER
 * Seberapa cocok teks CV dengan tiap jalur karier (keyword overlap).
 * ============================================================ */

export type CvPathFit = {
  pathId: string;
  title: string;
  match: number;
  hitCount: number;
  total: number;
  found: string[];
  missing: string[];
};

export function correlateCvToPaths(cvText: string): CvPathFit[] {
  const t = cvText.toLowerCase();
  return careerPaths
    .map((p) => {
      const bank = ROLE_KEYWORDS[p.title] ?? [];
      const found = bank.filter((k) => t.includes(k.toLowerCase()));
      const ratio = bank.length ? found.length / bank.length : 0;
      const missing = bank.filter((k) => !t.includes(k.toLowerCase()));
      const match = Math.min(96, Math.round(32 + ratio * 62));
      return {
        pathId: p.pathId,
        title: p.title,
        match,
        hitCount: found.length,
        total: bank.length,
        found: found.slice(0, 6),
        missing: missing.slice(0, 6),
      };
    })
    .sort((a, b) => b.match - a.match);
}

/** Estimasi gaji dari kesesuaian skill (korelasi sederhana). */
export function salaryFromFit(
  match: number,
  base: { junior: number; mid: number; senior: number },
): string {
  const v = base.junior + (base.mid - base.junior) * (match / 100);
  return `Rp ${Math.round(v)}jt`;
}
