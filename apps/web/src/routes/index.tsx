import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Compass,
  GraduationCap,
  Mail,
  Search,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MULAI+ — Bimbingan Universitas, Jurusan & Beasiswa | MULAI+" },
      {
        name: "description",
        content:
          "MULAI+ membimbingmu memilih universitas dan jurusan yang tepat. Program mentoring terstruktur dengan mentor berpengalaman, bimbingan beasiswa, dan persiapan PTN.",
      },
      { property: "og:title", content: "MULAI+ — Bimbingan Universitas, Jurusan & Beasiswa" },
      {
        property: "og:description",
        content:
          "Tes minat bakat gratis untuk menemukan jurusan & PTN impianmu — didukung data passing grade 10k+ prodi dan mentor 1-on-1.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Landing,
});

const HERO_STATS = [
  { value: "10k+", label: "Program Studi" },
  { value: "335+", label: "Universitas" },
  { value: "38", label: "Provinsi" },
];

const ABOUT_STATS = [
  { value: "10+", label: "Mentor Aktif" },
  { value: "6 Minggu", label: "Program Terstruktur" },
];

const FEATURE_POINTS = [
  "Tes Minat — Holland RIASEC",
  "Tes Bakat — 5 kemampuan",
  "AI + data 18k prodi",
  "Hasil instan + laporan PDF",
];

const ASSESSMENT_MODES: {
  icon: typeof Compass;
  title: string;
  sub: string;
  chips?: string[];
}[] = [
  {
    icon: Compass,
    title: "Tes Minat",
    sub: "Holland · 10 soal",
  },
  {
    icon: Sparkles,
    title: "Tes Bakat",
    sub: "5 kemampuan · 10 soal",
  },
  {
    icon: BrainCircuit,
    title: "Mesin MULAI+",
    sub: "",
    chips: ["18.000+ prodi", "AI summary"],
  },
] as const;

const RECOMMENDATIONS = [
  { name: "Kedokteran", value: 92 },
  { name: "Teknik Informatika", value: 85 },
  { name: "Psikologi", value: 78 },
];

const PROGRAMS = [
  {
    href: "/onboarding",
    icon: GraduationCap,
    accent: "bg-brand-red",
    title: "Program Beasiswa Mentoring",
    batch: "Batch 1",
    desc: "Program Beasiswa Mentoring MULAI+ adalah ruang pendampingan reflektif selama 6 minggu bagi siswa SMA/sederajat yang sedang berada dalam fase kebingungan menentukan arah pendidikan. Program ini bukan kompetisi akademik dan tidak menjanjikan kelulusan instan PTN. Fokus utama kami adalah membantu peserta memahami diri, konteks dunia kuliah, dan mengambil keputusan secara sadar.",
    points: [
      "Akses ke 6-Week Direction Curriculum",
      "Self-Mapping & Reflection Sheet",
      "Small Group Mentoring Sessions",
      "Strategy Overview Masuk PTN (Plan A, B, C Framework)",
    ],
  },
  {
    href: "/onboarding",
    icon: Target,
    accent: "bg-brand-orange",
    title: "Reguler Mentoring",
    batch: "Batch 1",
    desc: "Program utama MULAI+ dengan akses penuh ke sistem pemetaan arah dan strategi akademik terstruktur selama 6 minggu. Dirancang untuk siswa yang ingin proses mendalam, sistematis, dan memiliki output yang jelas.",
    points: [
      "6-Week Structured Direction Curriculum",
      "Major Matching (Top 3 Fit Recommendation)",
      "University Strategy Blueprint (Plan A, B, C)",
      "Small Group Mentoring Sessions",
    ],
  },
];

const EXPLORE_STATS = [
  { value: "335", label: "Universitas" },
  { value: "14,752", label: "Program Studi" },
  { value: "38", label: "Provinsi" },
];

const EXPLORE_LINKS = [
  { href: "/market", label: "Universitas", value: "335 PT" },
  { href: "/market", label: "Program Studi", value: "14,752 jurusan" },
  { href: "/market", label: "Passing Grade", value: "146 PTN" },
];

const BLOG_POSTS = [
  {
    href: "/blog",
    image: "/blog/blog-QNLOwv4Zq0rM-Thumbnail---WGS--2-.png",
    alt: "Group Mentoring Week 2 MULAI+ Batch 1",
    category: "Education",
    tag: "News",
    title:
      "Group Mentoring Week 2 MULAI+ Batch 1: Peserta Mulai Menggali Diri, Mana Tipe Mahasiswa Mereka?",
    date: "27 Juni 2026",
    read: "3 min read",
  },
  {
    href: "/blog",
    image: "/blog/blog-efmn7uMkruim-Thumbnail-Article--1.png",
    alt: "Self-Discovery sebelum pilih jurusan",
    category: "Education",
    tag: "Artikel",
    title:
      "Kenapa Self-Discovery Harus Dimulai Sebelum Pilih Jurusan, Bukan Setelahnya",
    date: "27 Juni 2026",
    read: "4 min read",
  },
  {
    href: "/blog",
    image: "/blog/blog-XzNSIboIiSD1-Thumbnail-Article--4.png",
    alt: "42% Mahasiswa Indonesia Alami Kebingungan Karir",
    category: "Education",
    tag: "Artikel",
    title:
      "42% Mahasiswa Indonesia Alami Kebingungan Karir, Kenapa Itu Terjadi dan Bagaimana Mencegahnya",
    date: "26 Juni 2026",
    read: "3 min read",
  },
  {
    href: "/blog",
    image: "/blog/blog-0mkc8Brfn3Oj-Thumbnail---WGS--1-.png",
    alt: "Group Mentoring Week 1 MULAI+ Batch 1",
    category: "Education",
    tag: "News",
    title:
      "Group Mentoring Week 1 MULAI+ Batch 1: Peserta Diminta Mengenal Diri Sendiri Sebelum Pilih Jurusan",
    date: "25 Juni 2026",
    read: "3 min read",
  },
];

const MENTORS = [
  { name: "Nimitta", uni: "Universitas Brawijaya", img: "/mentors/nimitta.webp" },
  { name: "Andhani", uni: "Universitas Brawijaya", img: "/mentors/andani.webp" },
  { name: "Billy", uni: "Universitas Airlangga", img: "/mentors/billy.webp" },
  { name: "Salma", uni: "Universitas Gajah Mada", img: "/mentors/salma.webp" },
  { name: "Nailir", uni: "Universitas Negeri Semarang", img: "/mentors/nelly.webp" },
  { name: "Hariz", uni: "PENS", img: "/mentors/haris.webp" },
  { name: "Febby", uni: "UPN Veteran Jatim", img: "/mentors/febby.webp" },
  { name: "Addina", uni: "Universitas Airlangga", img: "/mentors/addina.webp" },
  { name: "Dita", uni: "UPN Veteran Jatim", img: "/mentors/dita.webp" },
  { name: "Naily", uni: "Universitas Gajah Mada", img: "/mentors/naily.webp" },
];

const FAQ = [
  {
    q: "Siapa aja yang bisa mendaftar MULAI+?",
    a: "MULAI+ terbuka untuk siswa SMA/sederajat (kelas 10–12) dan gap year yang sedang mencari arah pendidikan, jurusan, atau strategi masuk PTN. Tidak ada syarat nilai minimum — yang kami butuhkan hanyalah kesediaan untuk menjalani proses secara reflektif.",
  },
  {
    q: "Apakah program ini gratis?",
    a: "MULAI+ memiliki dua jenis program: Regular Mentoring (berbayar) dan Beasiswa Mentoring (melalui proses seleksi). Program beasiswa tersedia bagi siswa terpilih yang memenuhi kriteria dan lolos tahap seleksi.",
  },
  {
    q: "Bagaimana sistem seleksinya?",
    a: "Untuk program beasiswa, peserta akan melalui beberapa tahap: Pengisian formulir pendaftaran, menjawab pertanyaan reflektif (non-akademik), seleksi berbasis kebutuhan dan komitmen, pengumuman peserta terpilih secara personal, dan persetujuan kontrak komitmen sederhana. Kami menilai berdasarkan komitmen, kesiapan berkembang, dan kesesuaian dengan program.",
  },
  {
    q: "Berapa lama program berlangsung?",
    a: "Durasi program umumnya berlangsung selama kurang lebih 6 minggu, tergantung batch dan jenis program yang diikuti. Selama periode tersebut, peserta akan mengikuti sesi mentoring, refleksi, dan penyusunan strategi secara bertahap.",
  },
  {
    q: "Apakah program ini dilakukan online atau offline?",
    a: "Seluruh sesi dalam program MULAI+ dilaksanakan secara online untuk memastikan akses yang fleksibel dan merata bagi peserta dari berbagai daerah.",
  },
];

const FOOTER_LINKS = [
  { title: "Program", links: ["Beasiswa Mentoring", "Reguler Mentoring", "FAQ", "Cara Daftar"] },
  {
    title: "Explore",
    links: ["Universitas", "Program Studi", "Passing Grade", "Bandingkan Kampus"],
  },
  {
    title: "Perusahaan",
    links: ["Tentang Kami", "Mentor", "Blog", "Kontak"],
  },
];

const NAV_GROUPS = [
  {
    label: "Explore",
    items: [
      { href: "/market", label: "Universitas", desc: "335+ kampus se-Indonesia" },
      { href: "/market", label: "Program Studi", desc: "10k+ prodi & passing grade" },
      { href: "/market", label: "Passing Grade", desc: "146 PTN" },
    ],
  },
  {
    label: "Program",
    items: [
      { href: "/onboarding", label: "Beasiswa Mentoring", desc: "Batch 1 — seleksi" },
      { href: "/onboarding", label: "Reguler Mentoring", desc: "Batch 1 — program utama" },
    ],
  },
  {
    label: "Assessment",
    items: [
      { href: "/onboarding", label: "Tes Minat", desc: "Holland · 10 soal" },
      { href: "/onboarding", label: "Tes Bakat", desc: "5 kemampuan · 10 soal" },
      { href: "/onboarding", label: "Future Career", desc: "Rekomendasi AI" },
    ],
  },
  {
    label: "Blog",
    items: [
      { href: "/blog", label: "Artikel", desc: "Tips & panduan" },
      { href: "/blog", label: "News", desc: "Update program" },
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
            MULAI<span className="text-brand-orange">+</span>
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
                        <span className="block font-manrope text-sm font-semibold text-brand-navy group-hover:text-brand-navy">
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
              Tes Minat Bakat · Bimbingan Universitas & Beasiswa
            </span>

            <h1 className="max-w-3xl font-bricolage text-3xl font-bold leading-[1.08] tracking-tight text-brand-navy md:text-5xl lg:text-[72px] lg:leading-[1.05]">
              <span className="text-brand-red">Kenali Dirimu,</span> Temukan Jurusan &amp; PTN
              Impianmu
            </h1>

            <p className="max-w-xl font-manrope text-base leading-relaxed text-text-muted md:text-lg lg:text-xl">
              Mulai dari <b className="text-gray-700">Tes Minat Bakat gratis</b> (20 soal, ±10 menit)
              untuk mengenali arahmu — lalu dalami dengan data passing grade 10k+ prodi, akreditasi,
              dan mentor 1-on-1.
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
                  Kenali Dirimu — Gratis
                </button>
              </Link>
              <Link to="/market" className="w-full sm:w-auto">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-brand-navy/15 px-8 py-4 font-manrope text-base font-bold text-brand-navy transition-all duration-300 hover:border-brand-navy/30 hover:bg-brand-navy/5 active:scale-[0.98] sm:px-10 sm:py-4"
                >
                  <GraduationCap className="size-5" />
                  Lihat Universitas
                </button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:justify-center">
            <div className="relative">
              <img
                src="/featured.webp"
                alt="Tes minat bakat MULAI+"
                className="h-auto w-full max-w-[300px] object-contain drop-shadow-2xl lg:max-w-[460px]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 font-manrope text-xs text-text-muted/50 md:col-span-2 md:mt-6">
            <span className="animate-bounce">
              <ChevronDown className="size-4" />
            </span>
            Scroll untuk lihat program
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[55%] w-full bg-white md:h-[65%] lg:h-[75%]" />
      </section>

      {/* ABOUT */}
      <section aria-label="Tentang MULAI+" className="relative w-full bg-white py-16 lg:pb-32" id="about">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-brand-navy/[0.02] blur-[100px]" />
        </div>
        <div className="container relative mx-auto max-w-7xl px-4 md:px-6 lg:px-6">
          <div className="flex flex-col gap-16 lg:flex-row lg:items-center lg:gap-20">
            <div className="flex flex-1 flex-col gap-8">
              <div className="flex flex-col gap-5">
                <span className="inline-flex items-center gap-2 font-manrope text-sm font-semibold tracking-widest text-brand-orange md:text-base">
                  <span className="h-px w-6 bg-brand-orange" />
                  ABOUT MULAI+
                </span>
                <h2 className="font-bricolage text-4xl font-bold leading-tight text-brand-navy md:text-5xl lg:text-[64px]">
                  Bimbingan Nyata Untuk <span className="text-brand-red">Keputusan Masa Depanmu</span>
                </h2>
              </div>
              <div className="flex flex-col gap-4 font-manrope text-base leading-relaxed text-text-muted md:text-lg">
                <p>
                  <span className="font-semibold text-brand-navy">Bingung milih jurusan?</span> MULAI+
                  adalah platform pendampingan terstruktur yang bantu kamu mengambil keputusan akademik
                  — dengan data real-time, mentor 1-on-1, dan strategi yang terbukti.
                </p>
                <p>
                  Bukan sekadar motivasi. Kami hadirkan sistem, refleksi, dan rencana masuk PTN yang
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
              <div className="flex flex-1 gap-4 sm:gap-6 md:gap-9">
                <div className="flex flex-1 flex-col gap-4 sm:gap-6 md:gap-9">
                  <div className="relative h-[200px] w-full overflow-hidden rounded-2xl sm:h-[280px] sm:w-[220px] md:h-[454px] md:w-full">
                    <div className="absolute inset-0 z-10 rounded-2xl ring-1 ring-black/5 ring-inset" />
                    <img
                      src="/about-us/image-1.webp"
                      alt="Sesi mentoring MULAI+ bersama mentor berpengalaman"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="hidden flex-1 flex-col gap-4 pt-12 sm:flex sm:gap-6 md:gap-9">
                  <div className="relative h-[200px] w-full overflow-hidden rounded-2xl sm:h-[280px] sm:w-[220px] md:h-[340px] md:w-full">
                    <div className="absolute inset-0 z-10 rounded-2xl ring-1 ring-black/5 ring-inset" />
                    <img
                      src="/about-us/image-2.webp"
                      alt="Refleksi dan diskusi kelompok dalam program MULAI+"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ASSESSMENT */}
      <section aria-label="Tes Minat Bakat" className="relative w-full bg-white py-14 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-navy to-brand-navy-light p-8 md:p-12">
            <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" aria-hidden="true" />

            <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
                  <Sparkles className="size-3.5 text-teal-300" />
                  <span className="font-manrope text-xs font-medium text-white/80">
                    Fitur Baru · Gratis · ±10 Menit
                  </span>
                </div>
                <h2 className="mt-4 font-bricolage text-3xl font-bold leading-tight md:text-4xl">
                  Belum Yakin Mau Kuliah Apa?
                  <span className="mt-1 block bg-gradient-to-r from-teal-300 to-teal-400 bg-clip-text text-transparent">
                    Kenali Minat & Bakatmu Sekarang
                  </span>
                </h2>
                <p className="mt-4 max-w-lg font-manrope text-sm leading-relaxed text-white/70 md:text-base">
                  20 soal untuk menemukan jurusan yang benar-benar cocok — dicocokkan dengan{" "}
                  <span className="font-semibold text-white">18.000+ prodi</span> dan{" "}
                  <span className="font-semibold text-white">AI</span>, bukan tebakan.
                </p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {FEATURE_POINTS.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 font-manrope text-sm text-white/80">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                        <CheckIcon />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/onboarding"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bricolage text-sm font-bold text-brand-navy shadow-lg transition-all hover:bg-amber-50 active:scale-[0.98]"
                  >
                    Coba Sekarang
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-bricolage text-sm font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98]"
                  >
                    Pelajari Tes Minat
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {ASSESSMENT_MODES.map((m) => (
                  <div
                    key={m.title}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <m.icon className="size-5 text-teal-300" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bricolage text-sm font-bold text-white">{m.title}</p>
                      <p className="font-manrope text-[10px] text-white/50">{m.sub}</p>
                      {m.chips && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {m.chips.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-manrope text-[9px] font-semibold text-white/70"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-manrope text-xs font-bold text-white">
                    Rekomendasi dari data nyata, bukan opini
                  </p>
                  <div className="mt-3 space-y-2">
                    {RECOMMENDATIONS.map((r) => (
                      <div key={r.name}>
                        <div className="flex justify-between font-manrope text-[11px]">
                          <span className="font-semibold text-white/80">{r.name}</span>
                          <span className="font-bold text-teal-300">{r.value}%</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
                            style={{ width: `${r.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROGRAMS */}
      <section aria-label="Program" className="relative w-full overflow-hidden bg-brand-navy py-16 lg:py-24" id="featured-programs">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-brand-red/10 blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <div className="flex w-full flex-col gap-10 lg:w-[65%]">
            <div className="flex flex-col gap-4 text-center lg:text-right">
              <span className="font-manrope text-xl font-bold uppercase tracking-widest text-brand-orange lg:text-2xl">
                Featured Programs
              </span>
              <h2 className="font-bricolage text-4xl font-bold leading-tight text-white lg:text-6xl">
                MULAI+ Mentoring Programs 2026
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-6">
              {PROGRAMS.map((p) => (
                <Link
                  key={p.title}
                  to={p.href}
                  className="group/card relative flex flex-col justify-between rounded-3xl bg-brand-navy-light p-8 ring-1 ring-white/[0.06] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-orange/5 hover:ring-brand-orange/20"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/[0.02] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100" />
                  <div className="relative flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg sm:h-14 sm:w-14 ${p.accent}`}>
                          <p.icon className="size-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-col flex-wrap items-start gap-2">
                            <h3 className="font-bricolage text-lg font-bold leading-tight text-white sm:text-2xl">
                              {p.title}
                            </h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 font-manrope text-xs font-medium text-text-light-blue">
                              {p.batch}
                            </span>
                          </div>
                          <p className="font-manrope text-xs leading-relaxed text-text-light-blue/80 sm:text-sm">
                            {p.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-2 font-manrope text-xs text-text-light-blue sm:text-sm">
                          <CheckIcon className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative mt-8 inline-flex items-center gap-2 font-bricolage text-sm font-bold text-white transition-colors group-hover/card:text-brand-orange">
                    Daftar Sekarang
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover/card:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DATA EXPLORER */}
      <section aria-label="Data Explorer" className="relative w-full bg-white py-16 lg:py-24">
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="flex flex-1 flex-col gap-3">
              <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
                Data Explorer
              </span>
              <h2 className="font-bricolage text-2xl font-bold leading-tight text-brand-navy sm:text-3xl lg:text-5xl">
                Cari <span className="text-brand-red">Jurusan</span> atau{" "}
                <span className="text-brand-red">Universitas</span>mu
              </h2>
              <p className="max-w-lg font-manrope text-sm leading-relaxed text-text-muted sm:text-base">
                Data passing grade, akreditasi, dari 335 PT dan 10.000+ prodi se-Indonesia.
              </p>

              <div className="relative z-20 mt-2">
                <div className="mb-3 flex items-center gap-1.5">
                  {["Program Studi", "Universitas"].map((tab, i) => (
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
                    placeholder="Cari jurusan/prodi..."
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
                      <GraduationCap className="size-5 text-brand-navy" />
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
                Artikel & Berita Terbaru
              </h2>
              <p className="mt-1 font-manrope text-sm text-text-muted">
                Tips, panduan, dan info seputar kuliah dan beasiswa
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
              10+ mentor dari berbagai universitas terbaik siap bimbing kamu 1-on-1, dari pemilihan
              jurusan sampai strategi masuk PTN.
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
                kepala. Karena itu, kami rangkum berbagai hal penting seputar program MULAI+ bisa
                ambil keputusan dengan tenang dan percaya diri.
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
              <img alt="" src="/cta.webp" className="h-full w-full object-cover object-center" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-brand-navy via-brand-navy/80 to-transparent" />

            <div className="relative z-10 flex max-w-2xl flex-col justify-center gap-8 px-6 py-16 md:px-14 md:py-20 lg:px-16 lg:py-28">
              <h2 className="font-bricolage text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-[64px] lg:leading-[1.1]">
                Siap Mulai <span className="text-brand-orange">Langkah Pertamamu</span>?
              </h2>
              <p className="max-w-lg font-manrope text-base leading-relaxed text-text-lighter-blue/60 md:text-lg">
                Daftar Mentoring Scholarship sekarang. Mentor berpengalaman, program terstruktur,
                dan beasiswa untuk masa depanmu.
              </p>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/onboarding"
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-4 font-manrope text-base font-bold text-white shadow-lg shadow-brand-orange/25 transition-all duration-300 hover:scale-[1.02] hover:bg-brand-orange/90 hover:shadow-xl active:scale-[0.98] md:px-12 md:py-5 md:text-lg"
                >
                  Daftar Sekarang
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="https://wa.me/6285730367310?text=Halo%20MULAI+%2C%20saya%20ingin%20tanya%20tentang%20program%20mentoring"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border-2 border-white/20 px-8 py-4 font-manrope text-sm font-semibold text-white/80 transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-[0.98] md:px-10 md:py-5 md:text-base"
                >
                  Tanya via WhatsApp
                </a>
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
                Subscribe to our newsletter for the latest program updates, university tips, and
                exclusive mentorship opportunities.
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
                  MULAI<span className="text-brand-orange">+</span>
                </span>
                <p className="max-w-xs font-manrope text-sm leading-relaxed text-text-lighter-blue/60">
                  Platform bimbingan universitas, jurusan & beasiswa. Bantu kamu mengambil keputusan
                  akademik dengan data nyata dan mentor berpengalaman.
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
