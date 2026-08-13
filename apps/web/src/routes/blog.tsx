import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Bimbingan Universitas & Beasiswa | MULAI+" },
      {
        name: "description",
        content: "Tips, panduan, dan info seputar kuliah dan beasiswa dari MULAI+.",
      },
    ],
  }),
  component: BlogPage,
});

const POSTS = [
  {
    image: "/blog/blog-QNLOwv4Zq0rM-Thumbnail---WGS--2-.png",
    alt: "Group Mentoring Week 2 MULAI+ Batch 1",
    category: "Education",
    tag: "News",
    title:
      "Group Mentoring Week 2 MULAI+ Batch 1: Peserta Mulai Menggali Diri, Mana Tipe Mahasiswa Mereka?",
    excerpt:
      "Satu minggu setelah onboarding yang penuh energi, peserta Batch 1 MULAI+ kembali berkumpul untuk group mentoring session yang lebih mendalam. Kali ini, bukan sekadar perkenalan atau penjelasan teknis, tapi mulai masuk ke fase eksplorasi diri yang serious.",
    date: "27 Juni 2026",
    read: "3 min read",
  },
  {
    image: "/blog/blog-efmn7uMkruim-Thumbnail-Article--1.png",
    alt: "Self-Discovery sebelum pilih jurusan",
    category: "Education",
    tag: "Artikel",
    title:
      "Kenapa Self-Discovery Harus Dimulai Sebelum Pilih Jurusan, Bukan Setelahnya",
    excerpt:
      "\"Aku baru realize passion aku saat sudah semester 5 kuliah teknik.\" Atau: \"Ternyata aku nggak cocok sama jurusan hukum yang aku pilih.\" Cerita seperti ini sangat umum didengar dari mahasiswa yang realize terlambat bahwa pilihan mereka tidak selaras dengan siapa mereka sebenarnya.",
    date: "27 Juni 2026",
    read: "4 min read",
  },
  {
    image: "/blog/blog-XzNSIboIiSD1-Thumbnail-Article--4.png",
    alt: "42% Mahasiswa Indonesia Alami Kebingungan Karir",
    category: "Education",
    tag: "Artikel",
    title:
      "42% Mahasiswa Indonesia Alami Kebingungan Karir, Kenapa Itu Terjadi dan Bagaimana Mencegahnya",
    excerpt:
      "Menurut data dari Kemendikbudristek tahun 2023, 42% mahasiswa Indonesia mengalami kebingungan dan ketidakpastian dalam membuat keputusan karir. Angka itu adalah bukti nyata bahwa confusion tentang masa depan bukan kegagalan personal, melainkan tantangan struktural yang dihadapi banyak orang.",
    date: "26 Juni 2026",
    read: "3 min read",
  },
  {
    image: "/blog/blog-0mkc8Brfn3Oj-Thumbnail---WGS--1-.png",
    alt: "Group Mentoring Week 1 MULAI+ Batch 1",
    category: "Education",
    tag: "News",
    title:
      "Group Mentoring Week 1 MULAI+ Batch 1: Peserta Diminta Mengenal Diri Sendiri Sebelum Pilih Jurusan",
    excerpt:
      "Minggu pertama adalah momentum penting. Bukan untuk langsung bahas jurusan atau universitas, tapi untuk melakukan hal yang lebih fundamental: mengenal diri sendiri. Inilah yang menjadi fokus group mentoring session pertama dengan mentor Billy Thohari.",
    date: "25 Juni 2026",
    read: "3 min read",
  },
];

function BlogPage() {
  return (
    <div className="min-h-screen bg-[#f7f9f3] text-foreground">
      {/* NAVBAR */}
      <nav className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between bg-white/95 px-4 shadow-sm backdrop-blur md:h-16 md:px-8 lg:px-12">
        <Link to="/" className="inline-block w-24 shrink-0 md:w-36">
          <span className="font-bricolage text-xl font-extrabold tracking-tight text-brand-navy md:text-2xl">
            MULAI<span className="text-brand-orange">+</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 md:flex md:gap-2">
          {[
            { label: "Explore", href: "/market" },
            { label: "Program", href: "/onboarding" },
            { label: "Assessment", href: "/onboarding" },
            { label: "Blog", href: "/blog", active: true },
          ].map((n) => (
            <Link
              key={n.label}
              to={n.href}
              className={`flex items-center gap-1 rounded-full px-3 py-2 font-manrope text-sm transition-colors lg:px-4 ${
                n.active
                  ? "bg-brand-navy/5 text-brand-navy"
                  : "text-text-main hover:bg-brand-navy/5 hover:text-brand-navy"
              }`}
            >
              {n.label}
            </Link>
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

      {/* HEADER */}
      <header className="relative overflow-hidden bg-brand-navy pt-24 pb-16 md:pt-32 md:pb-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" />
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-6">
          <span className="font-manrope text-sm font-semibold uppercase tracking-[0.25em] text-brand-orange">
            Blog
          </span>
          <h1 className="mt-3 max-w-3xl font-bricolage text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[64px]">
            Artikel & Berita <span className="text-brand-orange">Terbaru</span>
          </h1>
          <p className="mt-4 max-w-xl font-manrope text-base leading-relaxed text-text-lighter-blue/60 md:text-lg">
            Tips, panduan, dan info seputar kuliah dan beasiswa dari MULAI+.
          </p>
        </div>
      </header>

      {/* POSTS */}
      <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-6 lg:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {POSTS.map((post) => (
            <article
              key={post.title}
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
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-manrope text-[10px] font-medium text-secondary-foreground">
                    {post.category}
                  </span>
                  <span className="rounded-full border border-brand-orange/30 px-2.5 py-0.5 font-manrope text-[10px] uppercase tracking-wider text-brand-orange">
                    {post.tag}
                  </span>
                </div>
                <h2 className="mb-2 font-bricolage text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-orange md:text-xl">
                  {post.title}
                </h2>
                <p className="mb-4 line-clamp-3 font-manrope text-sm leading-relaxed text-text-muted">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-3 font-manrope text-[11px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3" /> {post.read}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 font-manrope text-xs font-bold text-brand-orange">
                    Baca <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative overflow-hidden bg-brand-navy">
        <div className="relative z-10 border-t border-white/10">
          <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
            <p className="font-manrope text-xs text-text-lighter-blue/50">
              © {new Date().getFullYear()} MULAI+. Semua hak dilindungi.
            </p>
            <Link to="/" className="font-manrope text-xs text-text-lighter-blue/50 transition-colors hover:text-brand-orange">
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
