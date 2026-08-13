import { z } from "zod";

import { publicProcedure } from "../index";

/* ============================================================
 * Mentor MULAI+ Career — daftar mentor dari server.
 * Fallback client memakai mock-data saat offline/gagal fetch.
 * ============================================================ */

const mentor = z.object({
  mentorId: z.string(),
  name: z.string(),
  initials: z.string(),
  currentRole: z.string(),
  company: z.string(),
  industry: z.string(),
  yearsExp: z.number(),
  specializations: z.array(z.string()),
  rating: z.number(),
  sessions: z.number(),
  priceIdr: z.number(),
  availability: z.string(),
  formats: z.array(z.string()),
  bio: z.string(),
});

export const mentorsRouter = {
  /** Daftar semua mentor aktif. */
  list: publicProcedure
    .input(z.object({}).optional())
    .output(z.array(mentor))
    .handler(async () => {
      return [
        {
          mentorId: "mentor123",
          name: "Arina Wijaya",
          initials: "AW",
          currentRole: "Senior Product Manager",
          company: "E-commerce Unicorn",
          industry: "E-commerce",
          yearsExp: 8,
          specializations: ["Career transition", "PM interview prep", "Startup product"],
          rating: 4.8,
          sessions: 132,
          priceIdr: 500000,
          availability: "Weekends",
          formats: ["Video call", "Async review"],
          bio: "Membantu career switcher masuk ke role PM. Fokus pada storytelling pengalaman non-produk jadi narasi produk yang kuat.",
        },
        {
          mentorId: "mentor124",
          name: "Dimas Prakoso",
          initials: "DP",
          currentRole: "Head of Data",
          company: "Fintech Series B",
          industry: "Fintech",
          yearsExp: 11,
          specializations: ["Data career", "SQL & Python", "Portfolio review"],
          rating: 4.9,
          sessions: 208,
          priceIdr: 650000,
          availability: "Weekday evenings",
          formats: ["Video call", "Hybrid"],
          bio: "Membangun tim data dari 2 ke 25 orang. Suka membedah portfolio analitik dan menyiapkan case interview.",
        },
        {
          mentorId: "mentor125",
          name: "Sarah Lestari",
          initials: "SL",
          currentRole: "Design Lead",
          company: "Healthtech",
          industry: "Healthtech",
          yearsExp: 7,
          specializations: ["UX research", "Portfolio review", "Design system"],
          rating: 4.7,
          sessions: 96,
          priceIdr: 450000,
          availability: "Flexible",
          formats: ["Video call"],
          bio: "Mentor untuk desainer & researcher awal karier yang ingin pindah ke produk digital berdampak.",
        },
        {
          mentorId: "mentor126",
          name: "Reza Fadhil",
          initials: "RF",
          currentRole: "Engineering Manager",
          company: "SaaS B2B",
          industry: "SaaS B2B",
          yearsExp: 10,
          specializations: ["Fullstack roadmap", "Tech interview", "Leveling up"],
          rating: 4.6,
          sessions: 174,
          priceIdr: 0,
          availability: "Weekends",
          formats: ["Async review"],
          bio: "Sesi gratis untuk mahasiswa & fresh grad. Bahas roadmap belajar dan review proyek pertama kamu.",
        },
        {
          mentorId: "mentor127",
          name: "Nadia Kusuma",
          initials: "NK",
          currentRole: "BizOps Lead",
          company: "Logistics Scale-up",
          industry: "Logistics",
          yearsExp: 6,
          specializations: ["BizOps", "Process design", "Career transition"],
          rating: 4.5,
          sessions: 61,
          priceIdr: 350000,
          availability: "Weekday evenings",
          formats: ["Video call", "Async review"],
          bio: "Dari Business Analyst ke BizOps Lead dalam 4 tahun. Berbagi playbook transisi yang realistis.",
        },
        {
          mentorId: "mentor128",
          name: "Yoga Pratama",
          initials: "YP",
          currentRole: "Growth Lead",
          company: "Fintech Lending",
          industry: "Fintech",
          yearsExp: 9,
          specializations: ["Growth marketing", "Experimentation", "PM interview prep"],
          rating: 4.4,
          sessions: 88,
          priceIdr: 400000,
          availability: "Flexible",
          formats: ["Video call", "Hybrid"],
          bio: "Menjalankan 300+ eksperimen growth. Cocok untuk kamu yang ingin karier di persimpangan produk & marketing.",
        },
      ];
    }),
};
