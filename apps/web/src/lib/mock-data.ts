export const currentUser = {
  id: "user123",
  name: "Budi Santoso",
  email: "budi@example.com",
  currentRole: "Business Analyst",
  yearsExp: 2,
  skills: ["Excel", "SQL", "Analytics", "Stakeholder Management"],
  assessmentScores: { RIASEC: "Investigative", MBTI: "INTJ" },
};

export type CvFeedback = {
  section: string;
  issue: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
  rewrite?: { before: string; after: string };
};

export const cvAuditResult = {
  cvId: "cv123",
  userId: "user123",
  overallScore: 72,
  reasoning:
    "Struktur CV kamu rapi dan mudah dibaca, tapi dampak kerja belum terukur. Recruiter di role analitis mencari angka: berapa persen efisiensi naik, berapa besar dataset, berapa stakeholder yang kamu kelola.",
  breakdown: { structure: 80, keywords: 65, impact: 70, customization: 60 },
  feedback: [
    {
      section: "Summary",
      issue: "Terlalu generik, tanpa metrik",
      suggestion: "Kuantifikasi pencapaian: Led team of X, improved Y by Z%",
      priority: "high",
      rewrite: {
        before: "Business Analyst yang bersemangat dan pekerja keras.",
        after:
          "Business Analyst (2 thn) yang mengubah data operasional jadi keputusan — memangkas waktu reporting 40% untuk 3 tim bisnis.",
      },
    },
    {
      section: "Experience",
      issue: "Deskripsi tugas, bukan hasil",
      suggestion: "Pakai format Action + Metric + Impact di tiap bullet.",
      priority: "high",
      rewrite: {
        before: "Bertanggung jawab membuat laporan mingguan.",
        after:
          "Mengotomasi 12 laporan mingguan lewat SQL + Sheets, menghemat ~15 jam kerja tim per bulan.",
      },
    },
    {
      section: "Skills",
      issue: "Keyword ATS untuk role target belum ada",
      suggestion:
        "Tambahkan Product Analytics, A/B Testing, Roadmapping, dan tools seperti Amplitude/Jira.",
      priority: "medium",
    },
    {
      section: "Education",
      issue: "Terlalu banyak detail SMA",
      suggestion:
        "Hapus riwayat SMA, ganti dengan coursework/organisasi relevan dan IPK bila di atas 3.3.",
      priority: "low",
    },
  ] as CvFeedback[],
  roleSpecific: [
    "Untuk role Product Manager: tambahkan metrik produk (retention, activation, GMV) di minimal 2 bullet.",
    "Untuk role Data Analyst: sebutkan ukuran dataset dan stack (SQL, dbt, Python) secara eksplisit.",
    "Semua role: pindahkan section Skills ke atas Education agar terbaca ATS lebih awal.",
  ],
};

export const careerPaths = [
  {
    pathId: "pm001",
    title: "Product Manager",
    matchScore: 78,
    marketGrowth: "+12% YoY",
    trend: "up" as const,
    salaryRange: "Rp 80jt - Rp 180jt / thn",
    summary:
      "Cocok karena kamu sudah terbiasa menerjemahkan kebutuhan bisnis jadi requirement dan mengelola stakeholder.",
    skillsGap: {
      have: ["Analytics", "Stakeholder Mgmt", "SQL"],
      need: ["Product Strategy", "User Research", "Roadmapping"],
    },
    learning: [
      { name: "Product Discovery Fundamentals", weeks: 4 },
      { name: "User Research Bootcamp", weeks: 6 },
      { name: "Roadmap & Prioritization", weeks: 3 },
    ],
    sampleJobs: [
      "Product Manager at Gojek",
      "APM at Fintech Startup X",
      "Product Owner at BCA Digital",
    ],
  },
  {
    pathId: "da002",
    title: "Data Analyst",
    matchScore: 71,
    marketGrowth: "+21% YoY",
    trend: "up" as const,
    salaryRange: "Rp 70jt - Rp 150jt / thn",
    summary:
      "Jalur paling cepat: 3 dari 4 skill kamu sudah relevan, tinggal perdalam statistik & visualisasi.",
    skillsGap: {
      have: ["SQL", "Excel", "Analytics"],
      need: ["Python", "Data Visualization", "Statistics"],
    },
    learning: [
      { name: "Python for Data Analysis", weeks: 6 },
      { name: "Dashboarding with Looker/Metabase", weeks: 3 },
      { name: "Applied Statistics", weeks: 5 },
    ],
    sampleJobs: ["Data Analyst at Tokopedia", "Business Intelligence at Traveloka"],
  },
  {
    pathId: "bo003",
    title: "Business Operations",
    matchScore: 66,
    marketGrowth: "+6% YoY",
    trend: "flat" as const,
    salaryRange: "Rp 65jt - Rp 140jt / thn",
    summary:
      "Perpanjangan natural dari peran sekarang, dengan cakupan proses dan efisiensi lintas tim.",
    skillsGap: {
      have: ["Stakeholder Management", "Excel", "Analytics"],
      need: ["Process Design", "Vendor Management", "Financial Modeling"],
    },
    learning: [
      { name: "Ops Process Design", weeks: 4 },
      { name: "Financial Modeling Essentials", weeks: 5 },
    ],
    sampleJobs: ["BizOps Associate at Grab", "Strategy & Ops at SaaS Startup"],
  },
  {
    pathId: "ux004",
    title: "UX Researcher",
    matchScore: 58,
    marketGrowth: "+9% YoY",
    trend: "up" as const,
    salaryRange: "Rp 70jt - Rp 145jt / thn",
    summary: "Cocok bila kamu lebih tertarik pada perilaku pengguna daripada angka bisnis.",
    skillsGap: {
      have: ["Analytics", "Stakeholder Management"],
      need: ["Qualitative Research", "Usability Testing", "Synthesis"],
    },
    learning: [{ name: "Foundations of UX Research", weeks: 6 }],
    sampleJobs: ["UX Researcher at Bibit", "Research Associate at Agency"],
  },
];

export type CareerPath = (typeof careerPaths)[number];

export const skillSignals = [
  {
    skill: "AI / Machine Learning",
    demand: 95,
    trend: "+42%",
    avgSalary: "Rp 150jt+",
    category: "Data",
  },
  { skill: "Data Engineering", demand: 91, trend: "+34%", avgSalary: "Rp 140jt", category: "Data" },
  {
    skill: "Product Analytics",
    demand: 88,
    trend: "+27%",
    avgSalary: "Rp 120jt",
    category: "Product",
  },
  { skill: "SQL", demand: 86, trend: "+11%", avgSalary: "Rp 95jt", category: "Data" },
  {
    skill: "React / Frontend",
    demand: 84,
    trend: "+18%",
    avgSalary: "Rp 130jt",
    category: "Engineering",
  },
  {
    skill: "Cloud (AWS/GCP)",
    demand: 83,
    trend: "+25%",
    avgSalary: "Rp 145jt",
    category: "Engineering",
  },
  { skill: "UX Research", demand: 76, trend: "+14%", avgSalary: "Rp 110jt", category: "Design" },
  {
    skill: "Growth Marketing",
    demand: 74,
    trend: "+16%",
    avgSalary: "Rp 105jt",
    category: "Marketing",
  },
  {
    skill: "Figma / UI Design",
    demand: 72,
    trend: "+8%",
    avgSalary: "Rp 100jt",
    category: "Design",
  },
  { skill: "Roadmapping", demand: 70, trend: "+12%", avgSalary: "Rp 125jt", category: "Product" },
  {
    skill: "Financial Modeling",
    demand: 66,
    trend: "+5%",
    avgSalary: "Rp 115jt",
    category: "Business",
  },
  {
    skill: "Stakeholder Management",
    demand: 64,
    trend: "+4%",
    avgSalary: "Rp 95jt",
    category: "Business",
  },
  {
    skill: "Excel / Spreadsheet",
    demand: 61,
    trend: "-3%",
    avgSalary: "Rp 70jt",
    category: "Business",
  },
  { skill: "Copywriting", demand: 55, trend: "-6%", avgSalary: "Rp 65jt", category: "Marketing" },
  { skill: "Manual QA", demand: 41, trend: "-12%", avgSalary: "Rp 72jt", category: "Engineering" },
];

export const roleSignals = [
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

export const salaryBenchmarks = [
  { role: "Product Manager", junior: 90, mid: 160, senior: 280 },
  { role: "Data Analyst", junior: 75, mid: 130, senior: 210 },
  { role: "Full-stack Engineer", junior: 96, mid: 180, senior: 320 },
  { role: "UX Designer", junior: 72, mid: 125, senior: 200 },
  { role: "Business Analyst", junior: 70, mid: 120, senior: 190 },
];

export const hiringHeat = [
  { industry: "Fintech", intensity: 92, note: "Ekspansi lisensi & produk lending" },
  { industry: "E-commerce", intensity: 78, note: "Fokus profitabilitas, hiring selektif" },
  { industry: "Healthtech", intensity: 71, note: "Pendanaan baru, tim produk tumbuh" },
  { industry: "Edtech", intensity: 54, note: "Stabil setelah konsolidasi" },
  { industry: "Logistics", intensity: 66, note: "Otomasi gudang & data" },
  { industry: "SaaS B2B", intensity: 83, note: "Permintaan engineer & PM tinggi" },
];

export const insightCards = [
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

export const mentors = [
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

export type Mentor = (typeof mentors)[number];

export const formatIdr = (v: number) => (v === 0 ? "Gratis" : `Rp ${(v / 1000).toFixed(0)}K`);

export const skillOptions = [
  "Excel",
  "SQL",
  "Analytics",
  "Stakeholder Management",
  "Python",
  "Figma",
  "User Research",
  "Roadmapping",
  "A/B Testing",
  "Copywriting",
  "React",
  "Financial Modeling",
  "Project Management",
  "Data Visualization",
];
