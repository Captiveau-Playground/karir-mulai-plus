import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Compass,
  FileSearch,
  LineChart,
  Mail,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MULAI+ Career — Cek Skor CV Gratis & Temukan Jalur Kariermu" },
      {
        name: "description",
        content:
          "Audit CV berbasis AI, rekomendasi jalur karier, sinyal pasar kerja Indonesia, dan mentor dalam satu platform. Gratis untuk mahasiswa & fresh graduate.",
      },
      { property: "og:title", content: "MULAI+ Career — Akselerator Karier Berbasis Data" },
      {
        property: "og:description",
        content:
          "Skor CV kamu dalam 30 detik, cari tahu jalur karier yang paling cocok, dan dapatkan mentor yang sudah melewatinya.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const HERO_STATS = [
  { value: "4.8/5", label: "Kepuasan user" },
  { value: "30 detik", label: "Skor CV instan" },
  { value: "120+", label: "Data role & skill" },
  { value: "6", label: "Mentor tersedia" },
];

const ABOUT_STATS = [
  { value: "4.8/5", label: "Kepuasan user" },
  { value: "6", label: "Mentor tersedia" },
];

const STEPS = [
  {
    icon: FileSearch,
    title: "1. Audit CV gratis",
    desc: "Unggah atau tempel CV, dapatkan skor 1-100 + perbaikan per bagian dalam 30 detik.",
  },
  {
    icon: Compass,
    title: "2. Temukan jalur karier",
    desc: "Skill, minat, dan kepribadianmu dicocokkan dengan role yang benar-benar tumbuh di pasar.",
  },
  {
    icon: Users,
    title: "3. Belajar dari mentor",
    desc: "Booking sesi dengan orang yang sudah melewati jalur yang ingin kamu tempuh.",
  },
];

const FEATURES = [
  {
    icon: FileSearch,
    title: "AI CV Audit",
    desc: "Skor struktur, keyword ATS, dampak terukur, dan kustomisasi — plus contoh rewrite kalimat yang bisa langsung dipakai.",
    cta: "Audit sekarang",
    to: "/cv-audit" as const,
  },
  {
    icon: Compass,
    title: "Career Recommend",
    desc: "Skill, minat, dan tipe kepribadian (RIASEC) dicocokkan ke jalur karier yang tumbuh — lengkap dengan gap skill & roadmap belajar.",
    cta: "Cari tahu jalurmu",
    to: "/career" as const,
  },
  {
    icon: LineChart,
    title: "Market Signals",
    desc: "Role dan skill paling dicari, benchmark gaji per level, dan peta industri yang sedang agresif merekrut di Indonesia.",
    cta: "Lihat tren",
    to: "/market" as const,
  },
  {
    icon: Users,
    title: "Mentoring",
    desc: "Mentor yang sudah melewati jalur yang kamu tuju. Filter by budget, jadwal, dan spesialisasi; booking langsung.",
    cta: "Cari mentor",
    to: "/mentors" as const,
  },
];

const EXPLORE_STATS = [
  { value: "120+", label: "Data role & skill" },
  { value: "30+", label: "Industri terpantau" },
  { value: "10", label: "Level gaji" },
];

const EXPLORE_LINKS = [
  { href: "/market", label: "Role paling dicari", value: "Top 20 role" },
  { href: "/market", label: "Skill paling diminta", value: "Live trending" },
  { href: "/market", label: "Benchmark gaji", value: "Per level & industri" },
];

const BLOG_POSTS = [
  {
    href: "/blog",
    image: "/blog/blog-QNLOwv4Zq0rM-Thumbnail---WGS--2-.png",
    alt: "Skor CV naik setelah audit",
    category: "Career",
    tag: "Tips",
    title:
      "Skor CV 61 → 78 dalam Seminggu: Apa yang Sebenarnya Diubah?",
    date: "12 Agustus 2026",
    read: "4 min read",
  },
  {
    href: "/blog",
    image: "/blog/blog-efmn7uMkruim-Thumbnail-Article--1.png",
    alt: "Self-Discovery sebelum pilih karier",
    category: "Career",
    tag: "Artikel",
    title:
      "Kenapa Self-Discovery Harus Dimulai Sebelum Pilih Jalur Karier, Bukan Setelahnya",
    date: "10 Agustus 2026",
    read: "4 min read",
  },
  {
    href: "/blog",
    image: "/blog/blog-XzNSIboIiSD1-Thumbnail-Article--4.png",
    alt: "Kebingungan karir di Indonesia",
    category: "Career",
    tag: "Data",
    title:
      "42% Mahasiswa Indonesia Alami Kebingungan Karir — Ini Data & Cara Mencegahnya",
    date: "8 Agustus 2026",
    read: "3 min read",
  },
  {
    href: "/blog",
    image: "/blog/blog-0mkc8Brfn3Oj-Thumbnail---WGS--1-.png",
    alt: "Roadmap belajar skill",
    category: "Career",
    tag: "Panduan",
    title:
      "Roadmap Belajar 90 Hari untuk Role Data Analyst: Gap Skill, Tools, dan Target",
    date: "5 Agustus 2026",
    read: "5 min read",
  },
];

const MENTORS = [
  { name: "Nimitta", uni: "Data Analyst · Fintech", img: "/mentors/nimitta.webp" },
  { name: "Andhani", uni: "Product Manager · SaaS", img: "/mentors/andani.webp" },
  { name: "Billy", uni: "Software Engineer · Startup", img: "/mentors/billy.webp" },
  { name: "Salma", uni: "UX Researcher · Agency", img: "/mentors/salma.webp" },
  { name: "Nailir", uni: "Data Engineer · E-commerce", img: "/mentors/nelly.webp" },
  { name: "Hariz", uni: "Backend Dev · Fintech", img: "/mentors/haris.webp" },
  { name: "Febby", uni: "Marketing Lead · D2C", img: "/mentors/febby.webp" },
  { name: "Addina", uni: "HR & Talent · Tech", img: "/mentors/addina.webp" },
  { name: "Dita", uni: "Content Strategist · Media", img: "/mentors/dita.webp" },
  { name: "Naily", uni: "Business Analyst · Bank", img: "/mentors/naily.webp" },
];

const FAQ = [
  {
    q: "Apakah gratis?",
    a: "Ya — skor CV, rekomendasi jalur, dan pencarian mentor gratis selamanya. Deep audit & sesi mentor adalah fitur premium.",
  },
  {
    q: "Data CV saya aman?",
    a: "Prototipe ini memproses CV di perangkatmu. Saat backend live, kami tidak menyimpan CV tanpa izinmu.",
  },
  {
    q: "Untuk siapa produk ini?",
    a: "Mahasiswa tingkat akhir, fresh graduate, dan profesional 0–3 tahun yang ingin tahu arah karier atau meningkatkan peluang diterima kerja.",
  },
  {
    q: "Apakah datanya real?",
    a: "Sinyal pasar (gaji, tren skill, hiring heat) diagregasi dari lowongan Indonesia dan diperbarui berkala.",
  },
  {
    q: "Berapa lama prosesnya?",
    a: "Skor CV instan dalam 30 detik. Rekomendasi jalur karier ±10 menit setelah tes minat & bakat. Sesi mentor bisa di-booking kapan saja.",
  },
];

const FOOTER_LINKS = [
  { title: "Fitur", links: ["CV Audit", "Career Recommend", "Market Signals", "Mentoring"] },
  { title: "Explore", links: ["Role & Skill", "Benchmark Gaji", "Tren Industri", "Roadmap Belajar"] },
  {
    title: "Perusahaan",
    links: ["Tentang Kami", "Mentor", "Blog", "Kontak"],
  },
];

const NAV_GROUPS = [
  {
    label: "Fitur",
    items: [
      { href: "/cv-audit", label: "CV Audit", desc: "Skor & perbaikan instan" },
      { href: "/career", label: "Career Recommend", desc: "Jalur karier terbaik" },
      { href: "/market", label: "Market Signals", desc: "Data pasar kerja live" },
      { href: "/mentors", label: "Mentoring", desc: "Mentor 1-on-1" },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/market", label: "Role paling dicari", desc: "Top 20 role Indonesia" },
      { href: "/market", label: "Benchmark Gaji", desc: "Per level & industri" },
      { href: "/roadmap", label: "Roadmap Belajar", desc: "Checklist mingguan" },
    ],
  },
  {
    label: "Assessment",
    items: [
      { href: "/onboarding", label: "Tes Minat Bakat", desc: "RIASEC · ±10 menit" },
      { href: "/career", label: "Career Match", desc: "Kecocokan role" },
    ],
  },
  {
    label: "Blog",
    items: [
      { href: "/blog", label: "Artikel", desc: "Tips & panduan karier" },
      { href: "/blog", label: "News", desc: "Update produk & program" },
    ],
  },
];

function Landing() {
  const search = useSearch({ from: "/" });
  const ref = (search as { ref?: string }).ref;
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (ref && ref.length >= 4) {
      db.setReferralBonus(true);
      toast.success("Kode referral diterima! 🎁", {
        description: "Teman kamu membukakan akses hasil audit premium untuk kamu.",
      });
    }
  }, [ref]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between px-4 transition-all duration-300 md:h-16 md:px-8 lg:px-12 ${
          scrolled ? "bg-white/95 shadow-sm backdrop-blur" : "bg-transparent"
        }`}
      >
        <Link to="/" className="inline-block w-24 shrink-0 md:w-36">
          <span className="font-bricolage text-xl font-extrabold tracking-tight text-brand-navy md:text-2xl">
            MULAI<span className="text-brand-orange">+</span>{" "}
            <span className="font-manrope text-xs font-bold tracking-widest text-brand-orange uppercase md:text-sm">
              Career
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex md:gap-2">
          {NAV_GROUPS.map((g) => (
            <div key={g.label} className="relative" onMouseEnter={() => setOpenMenu(g.label)} onMouseLeave={() => setOpenMenu(null)}>
              <button
                type="button"
                className={`flex items-center gap-1 rounded-full px-3 py-2 font-manrope text-sm transition-colors lg:px-4 ${
                  openMenu === g.label ? "bg-brand-navy/5 text-brand-navy" : "text-text-main hover:bg-brand-navy/5 hover:text-brand-navy"
                }`}
              >
                {g.label}
                <ChevronDown className="size-3.5" />
              </button>
              {openMenu === g.label && (
                <div className="absolute left-0 top-full w-64 rounded-2xl border border-border bg-white p-2 shadow-xl">
                  {g.items.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="group flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-brand-navy/5"
                    >
                      <span>
                        <span className="block font-manrope text-sm font-semibold text-brand-navy">
                          {item.label}
                        </span>
                        <span className="block font-manrope text-xs text-text-muted">{item.desc}</span>
                      </span>
                      <ChevronRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Link
            to="/login"
            className="rounded-full px-4 py-2 font-manrope text-sm font-bold text-text-main transition-colors hover:bg-muted lg:px-6"
          >
            Login
          </Link>
          <Link
            to="/onboarding"
            className="rounded-full bg-brand-navy px-4 py-2 font-manrope text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-brand-navy-light hover:shadow-md lg:px-6"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section
        aria-label="Hero"
        className="relative flex min-h-[90svh] w-full flex-col overflow-hidden bg-white pt-20 pb-8 md:min-h-svh md:pt-28 md:pb-12 lg:pt-36 lg:pb-16"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 h-[250px] w-[250px] rounded-full opacity-[0.08] md:-top-32 md:-right-32 md:h-[350px] md:w-[350px]" style={{ background: "var(--brand-orange)" }} />
          <div className="absolute -bottom-20 -left-20 h-[200px] w-[200px] rounded-full opacity-[0.05] md:-bottom-28 md:-left-28 md:h-[280px] md:w-[280px]" style={{ background: "var(--brand-navy)" }} />
        </div>

        <div className="container relative z-10 mx-auto flex max-w-7xl flex-1 flex-col justify-center gap-6 px-4 md:grid md:grid-cols-2 md:items-center md:gap-12 md:px-6 lg:px-6">
          <div className="flex flex-col gap-6 md:gap-8">
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-brand-orange/20 bg-brand-orange/5 px-3.5 py-1.5 font-manrope font-medium text-[11px] text-brand-orange tracking-wide">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange" />
              </span>
              Gratis untuk mahasiswa & fresh graduate
            </span>

            <h1 className="max-w-3xl font-bricolage text-3xl font-bold leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-[72px] lg:leading-[1.05]">
              <span className="text-brand-red">Skor CV-mu hari ini,</span>{" "}
              jalur kariermu besok.
            </h1>

            <p className="max-w-xl font-manrope text-base leading-relaxed text-text-muted md:text-lg lg:text-xl">
              MULAI+ menggabungkan <b className="text-gray-700">audit CV berbasis AI</b>, kecocokan
              jalur karier, data pasar kerja Indonesia, dan mentoring — satu tempat untuk memulai
              karier dengan percaya diri.
            </p>

            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-2 rounded-full bg-brand-navy/5 px-3.5 py-1.5 font-manrope text-xs text-text-muted md:px-5 md:py-2 md:text-sm">
                  <span className="font-semibold text-brand-navy">{s.value}</span>
                  <span className="text-text-muted/60">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <Link to="/onboarding" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-full bg-brand-red px-8 py-4 font-manrope text-base font-bold text-white shadow-lg shadow-brand-red/25 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-red/90 hover:shadow-xl active:scale-[0.98] sm:px-10 sm:py-4"
                >
                  Cek skor CV gratis
                </button>
              </Link>
              <Link to="/market" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-brand-navy/15 px-8 py-4 font-manrope text-base font-bold text-brand-navy transition-all duration-300 hover:border-brand-navy/30 hover:bg-brand-navy/5 active:scale-[0.98] sm:px-10 sm:py-4"
                >
                  <LineChart className="size-5" />
                  Lihat data pasar kerja
                </button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:justify-center">
            <div className="relative w-full max-w-[300px] lg:max-w-[420px]">
              {/* CV Score card mockup */}
              <div className="relative rounded-3xl bg-brand-navy p-6 text-white shadow-2xl shadow-brand-navy/20 lg:p-8">
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-orange/20 blur-3xl" />
                <div className="flex items-center justify-between">
                  <span className="font-manrope text-xs font-semibold uppercase tracking-widest text-text-lighter-blue/60">
                    CV Score
                  </span>
                  <span className="rounded-full bg-brand-orange/20 px-3 py-1 font-manrope text-[10px] font-bold text-brand-orange">
                    AI Audit
                  </span>
                </div>
                <p className="mt-4 font-bricolage text-6xl font-extrabold tracking-tight lg:text-7xl">
                  78<span className="text-lg text-text-lighter-blue/60">/100</span>
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-success">▲</span>
                  <span className="font-manrope text-xs text-text-lighter-blue/70">
                    Naik dari 61 setelah saran rewrite
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { label: "Struktur & ATS", value: 88, color: "bg-teal-400" },
                    { label: "Dampak terukur", value: 72, color: "bg-brand-orange" },
                    { label: "Keyword relevan", value: 81, color: "bg-brand-red" },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between font-manrope text-[10px]">
                        <span className="text-white/80">{row.label}</span>
                        <span className="font-bold text-white/80">{row.value}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-orange/15">
                  <Compass className="size-5 text-brand-orange" />
                </span>
                <div>
                  <p className="font-manrope text-xs font-bold text-brand-navy">Jalur karier terbaik</p>
                  <p className="font-manrope text-[10px] text-text-muted">Data Analyst · 92% cocok</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 font-manrope text-xs text-text-muted/50 md:col-span-2 md:mt-6">
            <span className="animate-bounce">
              <ChevronDown className="size-4" />
            </span>
            Scroll untuk lihat fitur
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55%] w-full bg-white md:h-[65%] lg:h-[75%]" />
      </section>

      {/* ABOUT */}
      <section aria-label="Tentang MULAI+ Career" className="relative w-full bg-white py-16 lg:pb-32" id="about">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-brand-navy/[0.02] blur-[100px]" />
        </div>
        <div className="container relative mx-auto max-w-7xl px-4 md:px-6 lg:px-6">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-20">
            <div className="flex flex-1 flex-col gap-8">
              <div className="flex flex-col gap-5">
                <span className="inline-flex items-center gap-2 font-manrope text-sm font-semibold tracking-widest text-brand-orange md:text-base">
                  <span className="h-px w-6 bg-brand-orange" />
                  TENTANG MULAI+ CAREER
                </span>
                <h2 className="font-bricolage text-4xl font-bold leading-tight text-brand-navy md:text-5xl lg:text-[64px]">
                  Akselerator Karier{" "}
                  <span className="text-brand-red">Berbasis Data</span>
                </h2>
              </div>
              <div className="flex flex-col gap-4 font-manrope text-base leading-relaxed text-text-muted md:text-lg">
                <p>
                  <span className="font-semibold text-brand-navy">Bingung mau jadi apa?</span>{" "}
                  MULAI+ Career adalah platform pendampingan terstruktur yang bantu kamu mengambil
                  keputusan karier — dengan audit CV berbasis AI, data pasar kerja real-time, dan
                  mentor 1-on-1.
                </p>
                <p>
                  Bukan sekadar motivasi. Kami hadirkan sistem, refleksi, dan rencana karier yang
                  matang. Tempat di mana kebingungan diolah jadi kejelasan, dan keraguan diubah jadi
                  keputusan.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {ABOUT_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 rounded-full bg-brand-navy/5 px-4 py-2 font-manrope text-sm"
                  >
                    <span className="font-semibold text-brand-navy">{s.value}</span>
                    <span className="text-text-muted/60">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1 justify-center lg:justify-end">
              <div className="grid w-full grid-cols-2 gap-4 sm:gap-6 md:gap-9">
                <div className="flex flex-col gap-4 sm:gap-6">
                  <div className="relative h-[200px] w-full overflow-hidden rounded-2xl sm:h-[280px] md:h-[454px]">
                    <div className="absolute inset-0 z-10 rounded-2xl ring-1 ring-black/5 ring-inset" />
                    <div className="flex h-full flex-col justify-end bg-gradient-to-b from-brand-navy/0 to-brand-navy/10 p-5">
                      <div className="rounded-2xl bg-white/90 p-4 backdrop-blur">
                        <p className="font-bricolage text-2xl font-extrabold text-brand-navy">4.8/5</p>
                        <p className="font-manrope text-xs text-text-muted">Kepuasan user</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 pt-12 sm:gap-6">
                  <div className="relative h-[200px] w-full overflow-hidden rounded-2xl sm:h-[280px] md:h-[340px]">
                    <div className="absolute inset-0 z-10 rounded-2xl ring-1 ring-black/5 ring-inset" />
                    <div className="flex h-full flex-col justify-end bg-gradient-to-b from-brand-navy/0 to-brand-navy/10 p-5">
                      <div className="rounded-2xl bg-white/90 p-4 backdrop-blur">
                        <p className="font-bricolage text-2xl font-extrabold text-brand-navy">30 detik</p>
                        <p className="font-manrope text-xs text-text-muted">Skor CV instan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CARA KERJA — gradient card */}
      <section aria-label="Cara Kerja" className="relative w-full bg-white py-14 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-navy to-brand-navy-light p-8 md:p-12">
            <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" aria-hidden="true" />

            <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                  <Sparkles className="size-3.5 text-teal-300" />
                  <span className="font-manrope text-xs font-medium text-white/80">
                    Gratis · Mulai dalam 3 langkah
                  </span>
                </div>
                <h2 className="mt-4 font-bricolage text-3xl font-bold leading-tight md:text-4xl">
                  Belum Yakin Mau Jadi Apa?
                  <span className="mt-1 block bg-gradient-to-r from-teal-300 to-teal-400 bg-clip-text text-transparent">
                    Mulai dari Audit CV Gratis
                  </span>
                </h2>
                <p className="mt-4 max-w-lg font-manrope text-sm leading-relaxed text-white/70 md:text-base">
                  Skor CV-mu dalam 30 detik, dicocokkan dengan{" "}
                  <span className="font-semibold text-white">120+ data role & skill</span> dan{" "}
                  <span className="font-semibold text-white">AI</span>, bukan tebakan.
                </p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {STEPS.map((s) => (
                    <li key={s.title} className="flex items-start gap-2.5 font-manrope text-sm text-white/80">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <CheckIcon />
                      </span>
                      <span>
                        <span className="block font-semibold text-white">{s.title}</span>
                        <span className="block text-xs text-white/60">{s.desc}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/onboarding"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bricolage text-sm font-bold text-brand-navy shadow-lg transition-all hover:bg-amber-50 active:scale-[0.98]"
                  >
                    Mulai sekarang — gratis
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/cv-audit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-bricolage text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                  >
                    Audit CV langsung
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {FEATURES.map((f) => (
                  <Link key={f.title} to={f.to} className="block">
                    <div className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <f.icon className="size-5 text-teal-300" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bricolage text-sm font-bold text-white">{f.title}</p>
                          <ChevronRight className="size-4 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-orange" />
                        </div>
                        <p className="mt-1 font-manrope text-xs leading-relaxed text-white/60">{f.desc}</p>
                        <span className="mt-1.5 inline-block font-manrope text-[11px] font-semibold text-brand-orange">
                          {f.cta}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DATA EXPLORER — Market */}
      <section aria-label="Data Explorer" className="relative w-full bg-white py-16 lg:py-24">
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="flex flex-1 flex-col gap-3">
              <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
                Market Signals
              </span>
              <h2 className="font-bricolage text-2xl font-bold leading-tight text-brand-navy sm:text-3xl lg:text-5xl">
                Lihat Apa yang <span className="text-brand-red">Benar-Benar Dicari</span> Pasar
              </h2>
              <p className="max-w-lg font-manrope text-sm leading-relaxed text-text-muted sm:text-base">
                Data gaji, tren skill, dan hiring heat dari lowongan kerja Indonesia — diperbarui
                berkala.
              </p>

              <div className="relative z-20 mt-2">
                <div className="mb-3 flex items-center gap-1.5">
                  {["Role", "Skill", "Gaji"].map((tab, i) => (
                    <button
                      key={tab}
                      type="button"
                      className={`rounded-full px-4 py-2 font-manrope text-sm font-medium transition-all ${
                        i === 0 ? "bg-brand-navy text-white shadow-sm" : "text-text-muted hover:bg-brand-navy/5 hover:text-brand-navy"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <form
                  className="relative z-10 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all sm:gap-3 sm:px-5 sm:py-3.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = "/market";
                  }}
                >
                  <Search className="size-4 text-text-muted" />
                  <input
                    placeholder="Cari role / skill / jabatan..."
                    className="h-auto min-w-0 flex-1 rounded-2xl border-0 bg-transparent px-1 font-manrope text-sm text-text-main shadow-none outline-none ring-0 placeholder:text-text-muted/50 focus:outline-none focus:ring-0"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-brand-navy px-4 py-1.5 font-manrope text-xs font-medium text-white transition-all hover:bg-brand-navy/90 sm:px-5 sm:py-2 sm:text-sm"
                  >
                    Cari
                  </button>
                </form>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="font-manrope text-xs font-semibold uppercase tracking-wide text-text-muted">Populer</span>
                  {EXPLORE_STATS.map((s) => (
                    <span
                      key={s.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 font-manrope text-xs text-text-muted"
                    >
                      <span className="font-bold text-brand-navy">{s.value}</span> {s.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-[380px]">
              {EXPLORE_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/20 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-brand-navy/5">
                      <LineChart className="size-5 text-brand-navy" />
                    </span>
                    <div>
                      <p className="font-manrope text-sm font-semibold text-brand-navy">{l.label}</p>
                      <p className="font-manrope text-xs text-text-muted">{l.value}</p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
              <Link
                to="/market"
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 font-manrope text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-brand-navy/90 hover:shadow-md"
              >
                Jelajahi Semua Data
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section aria-label="Blog" className="relative w-full bg-[#f7f9f3] py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/3 h-64 w-64 rounded-full bg-brand-navy/[0.01] blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="mb-3 inline-flex border-0 bg-brand-orange/10 px-2 py-0.5 font-manrope text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
                Blog
              </span>
              <h2 className="font-bricolage text-2xl font-bold text-brand-navy sm:text-3xl lg:text-4xl">
                Artikel & Tips Karier Terbaru
              </h2>
              <p className="mt-1 font-manrope text-sm text-text-muted">
                Tips, panduan, dan data seputar dunia kerja dan karier
              </p>
            </div>
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-navy px-5 py-2.5 font-manrope text-sm text-white shadow-sm transition-all hover:bg-brand-navy/90 hover:shadow-md"
            >
              Lihat Semua
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {BLOG_POSTS.map((post) => (
              <div key={post.title} className="w-[75vw] min-w-[260px] shrink-0 snap-start md:w-[320px]">
                <a
                  href={post.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/20 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-navy/[0.04]">
                    <img
                      src={post.image}
                      alt={post.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-manrope text-[9px] font-medium text-secondary-foreground">
                        {post.category}
                      </span>
                      <span className="rounded-full border border-brand-orange/30 px-2 py-0.5 font-manrope text-[9px] uppercase tracking-wider text-brand-orange">
                        {post.tag}
                      </span>
                    </div>
                    <h3 className="mb-1.5 line-clamp-2 font-bricolage text-sm font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-orange">
                      {post.title}
                    </h3>
                    <div className="mt-auto flex items-center gap-3 pt-2 font-manrope text-[11px] text-text-muted">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3" /> {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="size-3" /> {post.read}
                      </span>
                    </div>
                    <div className="mt-3 h-0.5 w-0 bg-brand-orange transition-all duration-300 group-hover:w-full" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENTORS */}
      <section aria-label="Temui Mentor" className="relative w-full overflow-hidden bg-brand-navy py-16 lg:py-24" id="mentors">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="mb-10 flex flex-col items-center gap-4 text-center md:mb-14">
            <span className="font-manrope text-lg font-semibold uppercase tracking-[0.25em] text-brand-orange md:text-2xl">
              MEET THE MENTORS
            </span>
            <h2 className="max-w-4xl font-bricolage text-3xl font-bold leading-tight text-white md:text-5xl lg:text-[64px]">
              Belajar Bareng yang Pernah di Posisi Kamu
            </h2>
            <p className="max-w-xl font-manrope text-base leading-relaxed text-text-lighter-blue/60 md:text-lg">
              10+ mentor dari berbagai industri siap bimbing kamu 1-on-1, dari persiapan CV sampai
              strategi pindah karier.
            </p>
          </div>

          <div className="relative w-full overflow-hidden rounded-lg pb-8">
            <div className="flex w-max gap-5">
              {[...MENTORS, ...MENTORS].map((m, i) => (
                <div
                  key={`${m.name}-${i}`}
                  className="group/card relative h-64 w-44 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm md:h-96 md:w-56"
                >
                  <div className="pointer-events-none absolute top-3 right-3 z-10 opacity-20">
                    <img src="/letter-icon-logo.svg" alt="" className="md:w-24" />
                  </div>
                  <img
                    src={m.img}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-all duration-500 group-hover/card:scale-105"
                  />
                  <div className="pointer-events-none absolute right-0 bottom-0 left-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/60 to-transparent px-4 pt-12 pb-3 md:pt-16 md:pb-4">
                    <h3 className="truncate font-manrope text-xl font-semibold leading-tight text-white md:text-2xl">
                      {m.name}
                    </h3>
                    <span className="truncate font-manrope text-xs font-medium leading-snug text-text-light-blue md:text-sm">
                      {m.uni}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              to="/mentors"
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 font-manrope text-sm font-bold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 active:scale-[0.98] md:px-10 md:py-4 md:text-base"
            >
              Lihat Semua Mentor & Program
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section aria-label="FAQ" className="w-full overflow-x-hidden bg-white py-16 lg:py-24" id="faq">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <div className="flex w-full flex-col gap-12 lg:flex-row lg:justify-between lg:gap-9">
            <div className="flex flex-col gap-9 lg:w-[40%]">
              <div className="flex flex-col gap-4">
                <span className="font-manrope text-2xl font-semibold tracking-[0.25em] text-brand-orange">
                  FAQ
                </span>
                <h2 className="font-bricolage text-4xl font-bold leading-tight text-brand-navy md:text-5xl lg:text-[64px]">
                  Hal Yang Paling Sering Ditanyain
                </h2>
              </div>
              <p className="font-manrope text-lg leading-relaxed tracking-tight text-text-muted lg:text-2xl">
                Kami tahu, sebelum memulai sesuatu yang baru pasti ada banyak pertanyaan muncul di
                kepala. Karena itu, kami rangkum berbagai hal penting seputar MULAI+ Career supaya
                kamu bisa ambil keputusan dengan tenang dan percaya diri.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 lg:w-[60%]">
              {FAQ.map((f, i) => (
                <div
                  key={f.q}
                  className={`rounded-xl px-6 py-6 shadow-sm transition-colors ${
                    openFaq === i ? "bg-brand-navy" : "bg-brand-navy/5 hover:bg-brand-navy/10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 text-left"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          openFaq === i ? "bg-white/10" : "bg-brand-navy/10"
                        }`}
                      >
                        <Star className={`size-4 ${openFaq === i ? "text-brand-orange" : "text-brand-navy"}`} />
                      </span>
                      <span
                        className={`font-manrope text-lg font-semibold leading-snug tracking-[-0.05em] lg:text-2xl ${
                          openFaq === i ? "text-white" : "text-brand-navy"
                        }`}
                      >
                        {f.q}
                      </span>
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                        openFaq === i ? "rotate-45 bg-brand-orange" : "bg-brand-navy/10"
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className={openFaq === i ? "text-brand-navy" : "text-brand-navy"}
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="mt-4 font-manrope text-sm leading-relaxed text-text-lighter-blue/70">
                      {f.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-label="Ajakan Bertindak" className="w-full bg-white py-16 md:py-20 lg:py-24" id="cta">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <div className="relative overflow-hidden bg-brand-navy md:rounded-[48px]">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <img alt="" src="/cta.webp" className="h-full w-full object-cover object-center opacity-30" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-brand-navy via-brand-navy/80 to-transparent" />

            <div className="relative z-10 flex max-w-2xl flex-col justify-center gap-8 px-6 py-16 md:px-14 md:py-20 lg:px-16 lg:py-28">
              <h2 className="font-bricolage text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-[64px] lg:leading-[1.1]">
                Siap Tahu <span className="text-brand-orange">Arah Kariermu</span>?
              </h2>
              <p className="max-w-lg font-manrope text-base leading-relaxed text-text-lighter-blue/60 md:text-lg">
                Gratis, kurang dari 2 menit, dan hasilnya langsung bisa kamu pakai.
              </p>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/onboarding"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-4 font-manrope text-base font-bold text-white shadow-lg shadow-brand-orange/25 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 hover:shadow-xl active:scale-[0.98] md:px-12 md:py-5 md:text-lg"
                >
                  Mulai sekarang — gratis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/cv-audit"
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 font-manrope text-sm font-semibold text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-[0.98] md:px-10 md:py-5 md:text-base"
                >
                  <FileSearch className="size-4" />
                  Cek skor CV dulu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-brand-navy">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="pointer-events-none absolute top-0 -left-48 h-96 w-96 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-48 bottom-0 h-96 w-96 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="pointer-events-none absolute top-12 right-0 left-0 w-full select-none overflow-hidden leading-none opacity-40">
          <img alt="" src="/footer-type.svg" className="w-full object-cover" />
        </div>

        <div className="relative z-10 border-b border-white/10">
          <div className="container mx-auto max-w-7xl px-4 py-12 lg:py-16">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center lg:gap-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-manrope text-xs uppercase tracking-wide text-text-lighter-blue">
                  Stay in the loop
                </span>
              </div>
              <h2 className="font-bricolage text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
                Ready to <span className="text-brand-orange">mulai+</span>?
              </h2>
              <p className="max-w-lg font-manrope text-base leading-relaxed text-text-lighter-blue lg:text-lg">
                Subscribe to our newsletter for career tips, market insights, and exclusive
                mentorship opportunities.
              </p>
              <form
                className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 ring-1 ring-white/5 backdrop-blur-sm transition-all duration-300 focus-within:border-brand-orange/50 focus-within:ring-brand-orange/20"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Terima kasih! Kamu sudah berlangganan newsletter MULAI+ 📬");
                  (e.target as HTMLFormElement).reset();
                }}
              >
                <Mail className="ml-2 size-4 text-text-lighter-blue/40" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full bg-transparent py-2 font-manrope text-sm text-white placeholder:text-text-lighter-blue/40 focus:outline-none"
                />
                <button
                  type="submit"
                  className="group cursor-pointer rounded-xl bg-brand-red px-5 py-2.5 font-manrope text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-brand-red/90 hover:shadow-lg"
                >
                  <span className="flex items-center gap-1.5">
                    Subscribe
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="container mx-auto max-w-7xl px-4 py-10 lg:py-14">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div className="flex flex-col gap-4">
                <span className="font-bricolage text-2xl font-extrabold tracking-tight text-white">
                  MULAI<span className="text-brand-orange">+</span>{" "}
                  <span className="font-manrope text-xs font-bold uppercase tracking-widest text-brand-orange">
                    Career
                  </span>
                </span>
                <p className="max-w-xs font-manrope text-sm leading-relaxed text-text-lighter-blue/60">
                  Sub-product MULAI+ untuk akselerasi karier. Audit CV, rekomendasi jalur, data
                  pasar kerja, dan mentor — satu platform.
                </p>
                <div className="flex gap-2 pt-1">
                  {["IG", "TT", "YT"].map((s) => (
                    <span
                      key={s}
                      className="grid size-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 font-manrope text-xs font-semibold text-text-lighter-blue transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {FOOTER_LINKS.map((col) => (
                <div key={col.title} className="flex flex-col gap-3">
                  <p className="font-manrope text-sm font-bold uppercase tracking-widest text-white/80">
                    {col.title}
                  </p>
                  {col.links.map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="font-manrope text-sm text-text-lighter-blue/60 transition-colors hover:text-brand-orange"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10">
          <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
            <p className="font-manrope text-xs text-text-lighter-blue/50">
              © {new Date().getFullYear()} MULAI+. Semua hak dilindungi.
            </p>
            <div className="flex gap-6">
              <a href="#" className="font-manrope text-xs text-text-lighter-blue/50 transition-colors hover:text-brand-orange">
                Kebijakan Privasi
              </a>
              <a href="#" className="font-manrope text-xs text-text-lighter-blue/50 transition-colors hover:text-brand-orange">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CheckIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
