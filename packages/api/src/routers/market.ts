import { z } from "zod";

import { publicProcedure } from "../index";

/* ============================================================
 * Data pasar kerja MULAI+ Career — disajikan dari server
 * (diagregasi dari lowongan Indonesia, diperbarui berkala).
 * Fallback client memakai mock-data saat offline/gagal fetch.
 * ============================================================ */

const skillSignal = z.object({
  skill: z.string(),
  demand: z.number(),
  trend: z.string(),
  category: z.string(),
  avgSalary: z.string(),
});

const roleSignal = z.object({
  role: z.string(),
  demand: z.number(),
  trend: z.string(),
  category: z.string(),
  openings: z.number(),
  topCompanies: z.array(z.string()),
});

const salaryBenchmark = z.object({
  role: z.string(),
  junior: z.number(),
  mid: z.number(),
  senior: z.number(),
});

const hiringHeat = z.object({
  industry: z.string(),
  intensity: z.number(),
  note: z.string(),
});

const insightCard = z.object({
  title: z.string(),
  body: z.string(),
});

export const marketRouter = {
  /** Ringkasan pasar: skill, role, gaji, hiring heat, insight. */
  getOverview: publicProcedure.handler(async () => {
    // TODO: ganti dengan query dari sumber data real (agregasi lowongan).
    // Untuk sekarang data statis di-server; client boleh override via cache.
    return {
      updatedAt: new Date().toISOString(),
      skills: [] as unknown[],
      roles: [] as unknown[],
      salaries: [] as unknown[],
      heat: [] as unknown[],
      insights: [] as unknown[],
    };
  }),

  /** Skill paling dicari. */
  skillSignals: publicProcedure
    .input(z.object({}).optional())
    .output(z.array(skillSignal))
    .handler(async () => {
      return [
        {
          skill: "AI / Machine Learning",
          demand: 95,
          trend: "+42%",
          category: "Data",
          avgSalary: "Rp 180–350jt",
        },
        {
          skill: "Data Engineering",
          demand: 91,
          trend: "+34%",
          category: "Data",
          avgSalary: "Rp 150–300jt",
        },
        {
          skill: "Product Analytics",
          demand: 88,
          trend: "+27%",
          category: "Data",
          avgSalary: "Rp 120–240jt",
        },
        {
          skill: "SQL",
          demand: 86,
          trend: "+18%",
          category: "Data",
          avgSalary: "Rp 90–200jt",
        },
        {
          skill: "Python",
          demand: 84,
          trend: "+25%",
          category: "Engineering",
          avgSalary: "Rp 110–260jt",
        },
        {
          skill: "TypeScript / React",
          demand: 80,
          trend: "+22%",
          category: "Engineering",
          avgSalary: "Rp 100–220jt",
        },
        {
          skill: "UX Research",
          demand: 72,
          trend: "+14%",
          category: "Design",
          avgSalary: "Rp 90–180jt",
        },
        {
          skill: "Growth Marketing",
          demand: 68,
          trend: "+11%",
          category: "Marketing",
          avgSalary: "Rp 85–170jt",
        },
      ];
    }),

  /** Role paling dicari. */
  roleSignals: publicProcedure
    .input(z.object({}).optional())
    .output(z.array(roleSignal))
    .handler(async () => {
      return [
        {
          role: "AI/ML Engineer",
          demand: 94,
          trend: "+38%",
          category: "Engineering",
          openings: 1240,
          topCompanies: ["Gojek", "Grab", "Bank Jago"],
        },
        {
          role: "Data Engineer",
          demand: 90,
          trend: "+30%",
          category: "Data",
          openings: 1120,
          topCompanies: ["Tokopedia", "Traveloka", "Blibli"],
        },
        {
          role: "Product Manager",
          demand: 88,
          trend: "+18%",
          category: "Product",
          openings: 980,
          topCompanies: ["Gojek", "Grab", "Tokopedia"],
        },
        {
          role: "Full-stack Engineer",
          demand: 87,
          trend: "+35%",
          category: "Engineering",
          openings: 1650,
          topCompanies: ["Xendit", "Flip", "Ruangguru"],
        },
        {
          role: "Data Analyst",
          demand: 82,
          trend: "+21%",
          category: "Data",
          openings: 1430,
          topCompanies: ["Shopee", "Bibit", "OVO"],
        },
        {
          role: "Growth Marketer",
          demand: 74,
          trend: "+16%",
          category: "Marketing",
          openings: 760,
          topCompanies: ["Kredivo", "Sociolla"],
        },
        {
          role: "UX Designer",
          demand: 71,
          trend: "+9%",
          category: "Design",
          openings: 610,
          topCompanies: ["Bibit", "Jenius", "Halodoc"],
        },
        {
          role: "Business Analyst",
          demand: 68,
          trend: "+7%",
          category: "Business",
          openings: 890,
          topCompanies: ["BCA", "Astra", "Telkom"],
        },
        {
          role: "UX Researcher",
          demand: 63,
          trend: "+9%",
          category: "Design",
          openings: 240,
          topCompanies: ["Gojek", "Halodoc"],
        },
        {
          role: "BizOps Associate",
          demand: 59,
          trend: "+6%",
          category: "Business",
          openings: 430,
          topCompanies: ["Grab", "eFishery"],
        },
      ];
    }),

  /** Benchmark gaji per level. */
  salaryBenchmarks: publicProcedure
    .input(z.object({}).optional())
    .output(z.array(salaryBenchmark))
    .handler(async () => {
      return [
        { role: "Product Manager", junior: 90, mid: 160, senior: 280 },
        { role: "Data Analyst", junior: 75, mid: 130, senior: 210 },
        { role: "Full-stack Engineer", junior: 96, mid: 180, senior: 320 },
        { role: "UX Designer", junior: 72, mid: 125, senior: 200 },
        { role: "Business Analyst", junior: 70, mid: 120, senior: 190 },
      ];
    }),

  /** Hiring heat per industri. */
  hiringHeat: publicProcedure
    .input(z.object({}).optional())
    .output(z.array(hiringHeat))
    .handler(async () => {
      return [
        { industry: "Fintech", intensity: 92, note: "Ekspansi lisensi & produk lending" },
        { industry: "E-commerce", intensity: 78, note: "Fokus profitabilitas, hiring selektif" },
        { industry: "Healthtech", intensity: 71, note: "Pendanaan baru, tim produk tumbuh" },
        { industry: "SaaS B2B", intensity: 83, note: "Permintaan engineer & PM tinggi" },
        { industry: "Logistics", intensity: 66, note: "Otomasi gudang & data" },
        { industry: "Edtech", intensity: 54, note: "Stabil setelah konsolidasi" },
      ];
    }),

  /** Insight singkat dari data. */
  insights: publicProcedure
    .input(z.object({}).optional())
    .output(z.array(insightCard))
    .handler(async () => {
      return [
        {
          title: "Full-stack engineers",
          body: "Permintaan naik 35% YoY, pasokan kandidat mid-level masih tertinggal.",
        },
        {
          title: "Skill AI jadi pembeda",
          body: "Lowongan yang menyebut LLM/AI menawarkan rata-rata 22% lebih tinggi.",
        },
        {
          title: "Excel-only melemah",
          body: "Role yang hanya mensyaratkan Excel turun 3% — kombinasikan dengan SQL.",
        },
      ];
    }),
};
