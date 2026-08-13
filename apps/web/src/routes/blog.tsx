import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Tips Karier & Data Pasar | MULAI+ Career" },
      {
        name: "description",
        content: "Tips, panduan, dan data seputar dunia kerja dan karier dari MULAI+ Career.",
      },
    ],
  }),
  component: BlogPage,
});

const POSTS = [
  {
    image: "/blog/blog-QNLOwv4Zq0rM-Thumbnail---WGS--2-.png",
    alt: "Skor CV naik setelah audit",
    category: "Career",
    tag: "Tips",
    title: "Skor CV 61 → 78 dalam Seminggu: Apa yang Sebenarnya Diubah?",
    excerpt:
      "Bukan sekadar menambah keyword. Dari struktur ATS yang berantakan sampai kalimat dampak yang tidak terukur — ini breakdown konkret perubahan yang menaikkan skor CV hingga 17 poin dalam seminggu.",
    date: "12 Agustus 2026",
    read: "4 min read",
  },
  {
    image: "/blog/blog-efmn7uMkruim-Thumbnail-Article--1.png",
    alt: "Self-Discovery sebelum pilih jalur karier",
    category: "Career",
    tag: "Artikel",
    title:
      "Kenapa Self-Discovery Harus Dimulai Sebelum Pilih Jalur Karier, Bukan Setelahnya",
    excerpt:
      "\"Aku baru realize passion aku saat sudah 5 tahun kerja di posisi yang salah.\" Cerita seperti ini sangat umum didengar dari profesional yang terlambat menyadari bahwa pilihan karier mereka tidak selaras dengan siapa mereka sebenarnya.",
    date: "10 Agustus 2026",
    read: "4 min read",
  },
  {
    image: "/blog/blog-XzNSIboIiSD1-Thumbnail-Article--4.png",
    alt: "Kebingungan karier di Indonesia",
    category: "Career",
    tag: "Data",
    title:
      "42% Mahasiswa Indonesia Alami Kebingungan Karir — Ini Data & Cara Mencegahnya",
    excerpt:
      "Menurut data Kemendikbudristek tahun 2023, 42% mahasiswa Indonesia mengalami ketidakpastian dalam keputusan karir. Angka ini bukti nyata bahwa kebingungan bukan kegagalan personal, melainkan tantangan struktural.",
    date: "8 Agustus 2026",
    read: "3 min read",
  },
  {
    image: "/blog/blog-0mkc8Brfn3Oj-Thumbnail---WGS--1-.png",
    alt: "Roadmap belajar skill",
    category: "Career",
    tag: "Panduan",
    title:
      "Roadmap Belajar 90 Hari untuk Role Data Analyst: Gap Skill, Tools, dan Target",
    excerpt:
      "Dari SQL dan Python dasar sampai portfolio yang layak dilamar — jadwal mingguan, sumber belajar, dan checkpoint evaluasi untuk role Data Analyst dalam 90 hari.",
    date: "5 Agustus 2026",
    read: "5 min read",
  },
];

function BlogPage() {
  const { data: serverPosts } = useQuery({
    queryKey: ["blog", "published"],
    queryFn: () => client.config.blogPublished(),
    placeholderData: [],
    retry: 1,
  });

  const posts =
    serverPosts && serverPosts.length > 0
      ? (serverPosts as unknown as typeof POSTS)
      : POSTS;

  return (
    <AppShell>
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="mb-3 inline-flex bg-brand-orange/10 px-2 py-0.5 font-manrope text-[10px] font-semibold uppercase tracking-wider text-brand-orange">
            Blog
          </span>
          <h1 className="font-bricolage text-3xl font-bold text-brand-navy sm:text-4xl">
            Artikel & Tips Karier
          </h1>
          <p className="mt-2 font-manrope text-sm text-text-muted">
            Tips, panduan, dan data seputar dunia kerja dan karier dari MULAI+ Career.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.title}
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
              <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
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
    </AppShell>
  );
}
