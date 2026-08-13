import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Search, Share2, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { Progress } from "@karir-mulai-plus/ui/components/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karir-mulai-plus/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { useDb } from "@/hooks/use-db";
import { db } from "@/lib/db";
import { marketShareText, marketUpdatedAt } from "@/lib/engine";
import { shareIntents } from "@/lib/share";
import {
  hiringHeat,
  insightCards,
  roleSignals,
  salaryBenchmarks,
  skillSignals,
} from "@/lib/mock-data";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Sinyal Pasar Kerja — MULAI+" },
      {
        name: "description",
        content:
          "Role dan skill paling dicari, benchmark gaji, dan peta industri yang sedang agresif merekrut.",
      },
      { property: "og:title", content: "Sinyal Pasar Kerja — MULAI+" },
      {
        property: "og:description",
        content: "Data permintaan role, skill, dan gaji di pasar kerja Indonesia.",
      },
    ],
  }),
  component: MarketPage,
});

const categories = ["Semua", "Product", "Engineering", "Data", "Design", "Business", "Marketing"];
const seniorities = ["Semua level", "Junior", "Mid", "Senior"];

function Trend({ value }: { value: string }) {
  const down = value.startsWith("-");
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold ${down ? "text-coral" : "text-success"}`}
    >
      {down ? <TrendingDown className="size-3.5" /> : <TrendingUp className="size-3.5" />}
      {value} YoY
    </span>
  );
}

function MarketPage() {
  const state = useDb();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Semua");
  const [sen, setSen] = useState("Semua level");
  const [industry, setIndustry] = useState("Semua industri");

  const filters = [
    cat !== "Semua" ? cat : null,
    sen !== "Semua level" ? sen : null,
    industry !== "Semua industri" ? industry : null,
    q ? `"${q}"` : null,
  ].filter(Boolean) as string[];

  const roles = useMemo(
    () =>
      roleSignals.filter(
        (r) =>
          (cat === "Semua" || r.category === cat) && r.role.toLowerCase().includes(q.toLowerCase()),
      ),
    [cat, q],
  );

  const skills = useMemo(
    () =>
      skillSignals.filter(
        (s) =>
          (cat === "Semua" || s.category === cat) &&
          s.skill.toLowerCase().includes(q.toLowerCase()),
      ),
    [cat, q],
  );

  const senKey = sen === "Junior" ? "junior" : sen === "Senior" ? "senior" : "mid";

  return (
    <AppShell>
      <PageHeader
        eyebrow="Market Signals"
        title="Apa yang benar-benar dicari pasar kerja sekarang"
        description={`Data permintaan diperbarui mingguan dari agregasi lowongan di Indonesia. Terakhir diperbarui: ${marketUpdatedAt}.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => toast.success("Laporan pasar diekspor sebagai PDF")}
            >
              <Download className="size-4" /> Export laporan
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  shareIntents.whatsapp(marketShareText + " " + window.location.origin),
                  "_blank",
                )
              }
            >
              <Share2 className="size-4" /> Bagikan data
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        {insightCards.map((i) => (
          <Card key={i.title} className="p-5">
            <p className="font-display text-base font-semibold">{i.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6 p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari role atau skill..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sen} onValueChange={setSen}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {seniorities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Semua industri", ...hiringHeat.map((h) => h.industry)].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.map((f) => (
            <Badge key={f} variant="secondary" className="bg-brand-soft">
              {f}
            </Badge>
          ))}
          {filters.length > 0 && (
            <button
              className="text-xs font-medium text-muted-foreground hover:underline"
              onClick={() => {
                setQ("");
                setCat("Semua");
                setSen("Semua level");
                setIndustry("Semua industri");
              }}
            >
              Reset filter
            </button>
          )}
        </div>
      </Card>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Role</TabsTrigger>
          <TabsTrigger value="skills">Skill</TabsTrigger>
          <TabsTrigger value="salary">Gaji</TabsTrigger>
          <TabsTrigger value="heat">Hiring heat</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-5 space-y-3">
          {roles.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada role yang cocok.</p>
          )}
          {roles.map((r, i) => (
            <Card key={r.role} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-muted-foreground">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{r.role}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.openings.toLocaleString("id-ID")} lowongan aktif ·{" "}
                      {r.topCompanies.join(", ")}
                    </p>
                  </div>
                </div>
                <Trend value={r.trend} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={r.demand} className="flex-1" />
                <span className="text-xs text-muted-foreground">demand {r.demand}</span>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="skills" className="mt-5 grid gap-3 md:grid-cols-2">
          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada skill yang cocok.</p>
          )}
          {skills.map((s) => (
            <Card key={s.skill} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{s.skill}</p>
                <Trend value={s.trend} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={s.demand} className="flex-1" />
                <span className="text-xs text-muted-foreground">{s.avgSalary}</span>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="salary" className="mt-5">
          <Card className="p-5">
            <p className="mb-4 text-sm text-muted-foreground">
              Benchmark tahunan (juta Rupiah) — level ditampilkan: <strong>{sen}</strong>
            </p>
            <div className="space-y-4">
              {salaryBenchmarks.map((b) => (
                <div key={b.role}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{b.role}</span>
                    <span className="text-muted-foreground">
                      Rp {b[senKey as "junior" | "mid" | "senior"]}jt / thn
                    </span>
                  </div>
                  <Progress value={(b[senKey as "junior" | "mid" | "senior"] / 320) * 100} />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Junior Rp {b.junior}jt · Mid Rp {b.mid}jt · Senior Rp {b.senior}jt
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="heat" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hiringHeat
            .filter((h) => industry === "Semua industri" || h.industry === industry)
            .map((h) => (
              <Card key={h.industry} className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{h.industry}</p>
                  <span
                    className="rounded-lg px-2 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `color-mix(in oklab, var(--coral) ${h.intensity * 0.6}%, var(--muted))`,
                    }}
                  >
                    {h.intensity}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{h.note}</p>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      <Card className="mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <p className="font-display text-lg font-semibold">Market Digest mingguan</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Skill & role yang sedang naik di bidangmu, dikirim tiap Senin pagi. Gratis.
            </p>
          </div>
          <div className="flex w-full max-w-sm gap-2">
            <Input placeholder="email kamu" disabled={state.digest} />
            <Button
              disabled={state.digest}
              onClick={() => {
                db.setDigest(true);
                toast.success("Berlangganan digest aktif", {
                  description: "Email pertama Senin depan.",
                });
              }}
            >
              {state.digest ? "Aktif ✓" : "Subscribe"}
            </Button>
          </div>
        </div>
      </Card>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">
            Gaji & tren karier teknologi Indonesia 2026
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Data MULAI+ menunjukkan permintaan AI/ML Engineer naik 38% YoY dengan benchmark gaji
            junior mulai Rp 90jt/tahun. Product Manager dan Data Analyst tetap masuk 5 besar role
            paling dicari. Skill AI menjadi pembeda utama — lowongan yang menyebut LLM menawarkan
            rata-rata 22% lebih tinggi. Untuk mahasiswa dan fresh graduate, kombinasi SQL + skill
            domain (produk, bisnis, desain) membuka akses ke role dengan pertumbuhan tercepat.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">
            Skill apa yang paling dicari sekarang?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            AI/Machine Learning (95), Data Engineering (91), dan Product Analytics (88) memimpin
            indeks demand. Excel-only melemah (-3%): pasar kini mencari SQL, Python, dan tools
            dashboard. Di sisi desain, UX Research (+14%) tumbuh lebih cepat dari UI murni. Gunakan
            filter kategori di atas untuk melihat data per bidang, lalu cocokkan dengan rekomendasi
            jalur kariermu di halaman Career Recommend.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
