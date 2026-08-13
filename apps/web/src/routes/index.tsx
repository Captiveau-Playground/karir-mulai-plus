import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  FileSearch,
  LineChart,
  Sparkles,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MULAI+ — Cek Skor CV Gratis & Temukan Jalur Kariermu" },
      {
        name: "description",
        content:
          "Audit CV berbasis AI, rekomendasi jalur karier, sinyal pasar kerja Indonesia, dan mentor dalam satu platform. Gratis untuk mahasiswa & fresh graduate.",
      },
      { property: "og:title", content: "MULAI+ — Akselerator Karier Berbasis Data" },
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

const STATS = [
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
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="gradient-brand grid size-8 place-items-center rounded-xl text-sm font-bold text-brand-foreground">
              M+
            </span>
            <span className="font-display text-base font-semibold">MULAI+</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/onboarding"
              className="hidden rounded-xl border border-border px-4 py-2 text-sm font-semibold sm:inline-flex"
            >
              Masuk
            </Link>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-coral-foreground card-hover"
            >
              Mulai gratis <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[480px] rounded-full bg-brand-soft blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 size-[480px] rounded-full bg-coral-soft blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold">
            <Sparkles className="size-3.5" /> Gratis untuk mahasiswa & fresh graduate
          </p>
          <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Skor CV-mu hari ini,{" "}
            <span className="gradient-brand bg-clip-text text-transparent">jalur kariermu</span>{" "}
            besok.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            MULAI+ menggabungkan audit CV berbasis AI, kecocokan jalur karier, data pasar kerja
            Indonesia, dan mentoring — satu tempat untuk memulai karier dengan percaya diri.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-coral px-6 py-3.5 text-sm font-semibold text-coral-foreground card-hover"
            >
              Cek skor CV gratis <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/market"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold card-hover"
            >
              Lihat data pasar kerja
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur"
              >
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="border-y border-border/70 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h2 className="text-center font-display text-3xl font-bold">Mulai dalam 3 langkah</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-3xl border border-border bg-card p-6">
                <div className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <s.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FITUR */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="text-center font-display text-3xl font-bold">
          Satu platform, empat kekuatan
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          Bukan sekadar tool CV — ini mesin akselerasi karier yang menyatukan psikologi karier, data
          pasar, dan manusia.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
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
          ].map((f) => (
            <Link key={f.title} to={f.to}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 card-hover">
                <div className="grid size-11 place-items-center rounded-2xl bg-coral-soft text-coral">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  {f.cta} <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="border-y border-border/70 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-3xl font-bold">Mereka sudah mulai</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-3xl border border-border bg-card p-6">
                <CheckCircle2 className="size-5 text-success" />
                <blockquote className="mt-3 text-sm leading-relaxed">"{t.text}"</blockquote>
                <figcaption className="mt-4 text-xs font-semibold text-muted-foreground">
                  {t.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-bold">Pertanyaan umum</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {f.q}
                <span className="text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="gradient-brand rounded-3xl p-10 text-center text-brand-foreground sm:p-14">
          <h2 className="font-display text-3xl font-bold">Siap tahu arah kariermu?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm opacity-90">
            Gratis, kurang dari 2 menit, dan hasilnya langsung bisa kamu pakai.
          </p>
          <Link
            to="/onboarding"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-ink card-hover"
          >
            Mulai sekarang — gratis <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
        MULAI+ Career Acceleration — prototype dengan data simulasi pasar kerja Indonesia.
      </footer>
    </div>
  );
}
