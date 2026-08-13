import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileSearch,
  LineChart,
  Search,
  Star,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useConfigValue } from "@/hooks/use-server-data";
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

const TESTIMONIALS = [
  {
    name: "Dina P., Data Analyst @ Fintech",
    text: "Skor CV saya 61 → 78 setelah ikut saran rewrite-nya. Bulan berikutnya dapat 3 panggilan interview.",
  },
  {
    name: "Raka S., Mahasiswa akhir",
    text: "Awalnya bingung mau jadi apa. Rekomendasi jalurnya sangat spesifik, lengkap dengan gap skill dan roadmap belajar.",
  },
  {
    name: "Maya K., Career switcher",
    text: "Data gaji & tren skill-nya bikin saya yakin pindah dari marketing ke product. Mentornya tepat sasaran.",
  },
];

const BLOG_POSTS = [
  {
    href: "/blog",
    image: "/blog/blog-efmn7uMkruim-Thumbnail-Article--1.png",
    alt: "Self-Discovery sebelum pilih jalur karier",
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
    alt: "Kebingungan karier di Indonesia",
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
];

function Landing() {
  const search = useSearch({ from: "/" });
  const ref = (search as { ref?: string }).ref;
  const [openFaq, setOpenFaq] = useState(0);
  const heroStats = useConfigValue<{ value: string; label: string }[]>("landing.heroStats", HERO_STATS);
  const faqItems = useConfigValue<{ q: string; a: string }[]>("landing.faq", FAQ);
  const ctaConfig = useConfigValue<{ title: string; subtitle?: string; button?: string }>(
    "landing.cta",
    { title: "Siap Tahu Arah Kariermu?", subtitle: "Gratis, kurang dari 2 menit, dan hasilnya langsung bisa kamu pakai.", button: "Mulai sekarang — gratis" },
  );

  useEffect(() => {
    if (ref && ref.length >= 4) {
      db.setReferralBonus(true);
      toast.success("Kode referral diterima! 🎁", {
        description: "Teman kamu membukakan akses hasil audit premium untuk kamu.",
      });
    }
  }, [ref]);

  return (
    <AppShell full>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/70 bg-background">
        <div className="pointer-events-none absolute -top-24 -right-24 h-[280px] w-[280px] rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[260px] w-[260px] rounded-full bg-brand-navy/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 md:grid md:grid-cols-2 md:items-center md:gap-12 md:px-6 md:py-24 lg:py-32">
          <div className="flex flex-col gap-6 md:gap-7">
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-brand-orange/20 bg-brand-orange/5 px-3.5 py-1.5 font-manrope text-[11px] font-medium tracking-wide text-brand-orange">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange" />
              </span>
              Gratis untuk mahasiswa & fresh graduate
            </span>

            <h1 className="max-w-2xl font-bricolage text-4xl font-bold leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-[64px]">
              <span className="text-brand-red">Skor CV-mu hari ini,</span> jalur kariermu besok.
            </h1>

            <p className="max-w-xl font-manrope text-base leading-relaxed text-text-muted md:text-lg">
              MULAI+ menggabungkan <b className="text-gray-700">audit CV berbasis AI</b>, kecocokan
              jalur karier, data pasar kerja Indonesia, dan mentoring — satu tempat untuk memulai
              karier dengan percaya diri.
            </p>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Link
                to="/onboarding"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 font-manrope text-base font-bold text-brand-foreground shadow-lg shadow-brand/25 transition-all duration-300 hover:scale-[1.02] hover:bg-brand/90 hover:shadow-xl active:scale-[0.98]"
              >
                Cek skor CV gratis
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/market"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-navy/15 px-8 py-4 font-manrope text-base font-bold text-brand-navy transition-all duration-300 hover:border-brand-navy/30 hover:bg-brand-navy/5 active:scale-[0.98]"
              >
                <LineChart className="size-5" />
                Lihat data pasar kerja
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:gap-3">
              {heroStats.map((s) => (
                <div key={s.label} className="flex items-center gap-2 rounded-full bg-brand-navy/5 px-3.5 py-1.5 font-manrope text-xs text-text-muted md:px-5 md:py-2 md:text-sm">
                  <span className="font-semibold text-brand-navy">{s.value}</span>
                  <span className="text-text-muted/60">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
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
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
            Cara Kerja
          </span>
          <h2 className="max-w-2xl font-bricolage text-3xl font-bold leading-tight text-brand-navy md:text-4xl lg:text-5xl">
            Mulai dalam 3 langkah
          </h2>
          <p className="max-w-xl font-manrope text-base leading-relaxed text-text-muted">
            Dari CV yang belum jelas sampai rencana karier yang matang — semua terstruktur.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-navy/5">
                <s.icon className="size-5 text-brand-navy" />
              </span>
              <h3 className="mt-4 font-bricolage text-lg font-bold text-brand-navy">{s.title}</h3>
              <p className="mt-2 font-manrope text-sm leading-relaxed text-text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FITUR */}
      <section className="border-y border-border/70 bg-muted py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
              Fitur
            </span>
            <h2 className="max-w-2xl font-bricolage text-3xl font-bold leading-tight text-brand-navy md:text-4xl lg:text-5xl">
              Satu platform, empat kekuatan
            </h2>
            <p className="max-w-xl font-manrope text-base leading-relaxed text-text-muted">
              Bukan sekadar tool CV — ini mesin akselerasi karier yang menyatukan psikologi karier,
              data pasar, dan manusia.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <Link key={f.title} to={f.to}>
                <div className="group h-full rounded-2xl border border-border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/20 hover:shadow-md">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-navy/5">
                    <f.icon className="size-5 text-brand-navy" />
                  </span>
                  <h3 className="mt-4 font-bricolage text-xl font-bold text-brand-navy">{f.title}</h3>
                  <p className="mt-2 font-manrope text-sm leading-relaxed text-text-muted">{f.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 font-manrope text-sm font-semibold text-brand-orange">
                    {f.cta}
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET SIGNALS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="flex flex-1 flex-col gap-4">
            <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
              Market Signals
            </span>
            <h2 className="max-w-xl font-bricolage text-3xl font-bold leading-tight text-brand-navy md:text-4xl lg:text-5xl">
              Lihat Apa yang <span className="text-brand-red">Benar-Benar Dicari</span> Pasar
            </h2>
            <p className="max-w-lg font-manrope text-base leading-relaxed text-text-muted">
              Data gaji, tren skill, dan hiring heat dari lowongan kerja Indonesia — diperbarui
              berkala.
            </p>
            <form
              className="relative z-10 mt-2 flex max-w-md items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-all sm:gap-3 sm:px-5 sm:py-3.5"
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
            <Link
              to="/market"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 font-manrope text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-brand-navy/90 hover:shadow-md"
            >
              Jelajahi Semua Data
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-[380px]">
            {[
              { label: "Role paling dicari", value: "Top 20 role Indonesia" },
              { label: "Benchmark gaji", value: "Per level & industri" },
              { label: "Tren skill", value: "Live trending" },
            ].map((l) => (
              <Link
                key={l.label}
                to="/market"
                className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/20 hover:shadow-md"
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
          </div>
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="border-y border-border/70 bg-muted py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
              Testimoni
            </span>
            <h2 className="max-w-2xl font-bricolage text-3xl font-bold leading-tight text-brand-navy md:text-4xl lg:text-5xl">
              Mereka sudah mulai
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <CheckCircle2 className="size-5 text-success" />
                <blockquote className="mt-3 font-manrope text-sm leading-relaxed">"{t.text}"</blockquote>
                <figcaption className="mt-4 font-manrope text-xs font-semibold text-text-muted">
                  {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="mb-3 inline-flex bg-brand-orange/10 px-2 py-0.5 font-manrope text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
              Blog
            </span>
            <h2 className="font-bricolage text-2xl font-bold text-brand-navy sm:text-3xl lg:text-4xl">
              Artikel & Tips Karier
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

        <div className="grid gap-5 md:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <a
              key={post.title}
              href={post.href}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/20 hover:shadow-md"
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
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/70 bg-muted py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex w-full flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-5 lg:w-[40%]">
              <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
                FAQ
              </span>
              <h2 className="font-bricolage text-3xl font-bold leading-tight text-brand-navy md:text-4xl lg:text-5xl">
                Hal Yang Paling Sering Ditanyain
              </h2>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-[60%]">
              {faqItems.map((f, i) => (
                <div
                  key={f.q}
                  className={`rounded-xl px-6 py-5 shadow-sm transition-colors ${
                    openFaq === i ? "bg-brand-navy" : "bg-card hover:border-brand-orange/20"
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
                        className={`font-manrope text-base font-semibold leading-snug lg:text-lg ${
                          openFaq === i ? "text-white" : "text-brand-navy"
                        }`}
                      >
                        {f.q}
                      </span>
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 ${
                        openFaq === i ? "rotate-45 bg-brand-orange" : "bg-brand-navy/10"
                      }`}
                    >
                      <svg
                        width="12"
                        height="12"
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
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="relative overflow-hidden rounded-[32px] bg-brand-navy p-10 md:p-14">
          <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-orange/10 blur-3xl" />

          <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="font-bricolage text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
                {ctaConfig.title ?? "Siap Tahu Arah Kariermu?"}
              </h2>
              <p className="mt-3 font-manrope text-base leading-relaxed text-text-lighter-blue/60 md:text-lg">
                {ctaConfig.subtitle ?? "Gratis, kurang dari 2 menit, dan hasilnya langsung bisa kamu pakai."}
              </p>
            </div>
            <Link
              to="/onboarding"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-orange px-8 py-4 font-manrope text-base font-bold text-white shadow-lg shadow-brand-orange/25 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 hover:shadow-xl active:scale-[0.98] md:px-10 md:py-5"
            >
              {ctaConfig.button ?? "Mulai sekarang — gratis"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
