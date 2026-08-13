import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Search, Star } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@karir-mulai-plus/ui/components/card";
import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { Slider } from "@karir-mulai-plus/ui/components/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@karir-mulai-plus/ui/components/dialog";
import { useDb } from "@/hooks/use-db";
import { useMentors } from "@/hooks/use-server-data";
import { pushBooking } from "@/lib/api";
import { db } from "@/lib/db";
import { formatIdr, type Mentor } from "@/lib/mock-data";

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "Marketplace Mentor — MULAI+" },
      {
        name: "description",
        content:
          "Temukan dan booking mentor karier sesuai role, industri, ketersediaan, dan budget kamu.",
      },
      { property: "og:title", content: "Marketplace Mentor — MULAI+" },
      {
        property: "og:description",
        content: "Mentor berpengalaman untuk transisi karier dan persiapan interview.",
      },
    ],
  }),
  component: MentorsPage,
});

const industries = [
  "Semua industri",
  "E-commerce",
  "Fintech",
  "Healthtech",
  "SaaS B2B",
  "Logistics",
];
const availabilities = ["Kapan saja", "Weekends", "Weekday evenings", "Flexible"];
const specs = [
  "Career transition",
  "PM interview prep",
  "Portfolio review",
  "Data career",
  "Growth marketing",
  "UX research",
];

const slots = ["09:00", "10:30", "13:00", "15:30", "19:00", "20:30"];

function MentorsPage() {
  const { mentors } = useMentors();
  const mentorsData = (mentors ?? []) as Mentor[];
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("Semua industri");
  const [avail, setAvail] = useState("Kapan saja");
  const [minExp, setMinExp] = useState([0]);
  const [maxPrice, setMaxPrice] = useState([700]);
  const [picked, setPicked] = useState<string[]>([]);
  const [profile, setProfile] = useState<Mentor | null>(null);
  const [booking, setBooking] = useState<Mentor | null>(null);

  const list = useMemo(
    () =>
      mentorsData.filter(
        (m) =>
          (industry === "Semua industri" || m.industry === industry) &&
          (avail === "Kapan saja" || m.availability === avail) &&
          m.yearsExp >= minExp[0]! &&
          m.priceIdr / 1000 <= maxPrice[0]! &&
          (picked.length === 0 || picked.some((p) => m.specializations.includes(p))) &&
          (m.name + m.currentRole + m.company).toLowerCase().includes(q.toLowerCase()),
      ),
    [q, industry, avail, minExp, maxPrice, picked, mentorsData],
  );

  const badges = [
    industry !== "Semua industri" ? industry : null,
    avail !== "Kapan saja" ? avail : null,
    minExp[0]! > 0 ? `${minExp[0]}+ thn` : null,
    maxPrice[0]! < 700 ? `≤ Rp ${maxPrice[0]}K` : null,
    ...picked,
  ].filter(Boolean) as string[];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Mentoring"
        title="Belajar dari orang yang sudah melewati jalurnya"
        description="Filter mentor sesuai role tujuan, industri, jadwal, dan budget kamu."
      />

      <Card className="mb-6 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Cari nama atau role..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {industries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={avail} onValueChange={setAvail}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availabilities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <Label className="mb-3 block">Minimal pengalaman: {minExp[0]} tahun</Label>
            <Slider value={minExp} onValueChange={setMinExp} min={0} max={12} step={1} />
          </div>
          <div>
            <Label className="mb-3 block">Budget maksimal: Rp {maxPrice[0]}K</Label>
            <Slider value={maxPrice} onValueChange={setMaxPrice} min={0} max={700} step={50} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {specs.map((s) => (
            <button
              key={s}
              onClick={() =>
                setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))
              }
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                picked.includes(s)
                  ? "border-brand bg-brand-soft font-medium"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {badges.map((b) => (
              <Badge key={b} variant="secondary" className="bg-brand-soft">
                {b}
              </Badge>
            ))}
            <button
              className="text-xs font-medium text-muted-foreground hover:underline"
              onClick={() => {
                setQ("");
                setIndustry("Semua industri");
                setAvail("Kapan saja");
                setMinExp([0]);
                setMaxPrice([700]);
                setPicked([]);
              }}
            >
              Reset filter
            </button>
          </div>
        )}
      </Card>

      <p className="mb-4 text-sm text-muted-foreground">
        {list.length} mentor cocok dengan filter kamu
      </p>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((m) => (
          <Card key={m.mentorId} className="flex h-full flex-col p-6 card-hover">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-secondary font-display font-bold">
                {m.initials}
              </div>
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.currentRole} · {m.company}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="size-3.5 fill-warning text-warning" /> {m.rating}
              </span>
              <span className="text-muted-foreground">{m.sessions} sesi</span>
              <span className="text-muted-foreground">{m.yearsExp} thn</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.specializations.map((s) => (
                <span key={s} className="rounded-lg bg-muted px-2 py-1 text-xs">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-5">
              <div>
                <p className="font-display text-lg font-bold">{formatIdr(m.priceIdr)}</p>
                <p className="text-xs text-muted-foreground">{m.availability}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setProfile(m)}>
                  Profil
                </Button>
                <Button size="sm" onClick={() => setBooking(m)}>
                  Book
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {list.length === 0 && (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Belum ada mentor yang cocok. Coba longgarkan filter budget atau pengalaman.
        </Card>
      )}

      <Dialog open={!!profile} onOpenChange={(o) => !o && setProfile(null)}>
        <DialogContent>
          {profile && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">{profile.name}</DialogTitle>
                <DialogDescription>
                  {profile.currentRole} di {profile.company} · {profile.yearsExp} tahun pengalaman
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Format sesi</p>
                  <p className="font-medium">{profile.formats.join(", ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ketersediaan</p>
                  <p className="font-medium">{profile.availability}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Harga</p>
                  <p className="font-medium">{formatIdr(profile.priceIdr)} / sesi</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <p className="font-medium">
                    {profile.rating} dari {profile.sessions} sesi
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.specializations.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={() => {
                  setBooking(profile);
                  setProfile(null);
                }}
              >
                Booking sesi
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BookingDialog mentor={booking} onClose={() => setBooking(null)} />

      <MySessions />
    </AppShell>
  );
}

function MySessions() {
  const state = useDb();
  const [rateId, setRateId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const booked = state.bookings.filter((b) => b.status === "booked");
  const done = state.bookings.filter((b) => b.status === "done");

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-display text-2xl font-bold">Sesi saya</h2>
      {state.bookings.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Belum ada booking. Pilih mentor di atas dan klik <strong>Book</strong>.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {booked.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{b.mentorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.date} · {b.slot} WIB · {formatIdr(b.priceIdr)}
                  </p>
                </div>
                <Badge className="bg-brand-soft">Terjadwal</Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setRateId(b.id);
                  setRating(5);
                  setReview("");
                }}
              >
                Selesai — beri rating
              </Button>
            </Card>
          ))}
          {done.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{b.mentorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.date} · {b.slot} WIB
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-warning">
                  <Star className="size-3.5 fill-warning" /> {b.rating}
                </span>
              </div>
              {b.review && <p className="mt-3 text-sm text-muted-foreground">"{b.review}"</p>}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rateId} onOpenChange={(o) => !o && setRateId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Beri rating sesi</DialogTitle>
            <DialogDescription>
              Feedback kamu membantu mentor lain memilih — dan jadi bahan rekomendasi mentor
              berikutnya.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} bintang`}>
                <Star
                  className={`size-8 ${n <= rating ? "fill-warning text-warning" : "text-muted"}`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Ulasan singkat (opsional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <Button
            onClick={() => {
              if (rateId) {
                db.completeBooking(rateId, rating, review);
                toast.success("Terima kasih atas feedbacknya 🙏");
              }
              setRateId(null);
            }}
          >
            Kirim rating
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function BookingDialog({ mentor, onClose }: { mentor: Mentor | null; onClose: () => void }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [done, setDone] = useState(false);

  const close = () => {
    onClose();
    setTimeout(() => {
      setDone(false);
      setSlot(null);
      setDate("");
      setContext("");
    }, 200);
  };

  return (
    <Dialog open={!!mentor} onOpenChange={(o) => !o && close()}>
      <DialogContent>
        {mentor && !done && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">Booking dengan {mentor.name}</DialogTitle>
              <DialogDescription>
                {formatIdr(mentor.priceIdr)} / 45 menit · zona waktu WIB (GMT+7)
              </DialogDescription>
            </DialogHeader>
            <div>
              <Label className="mb-2 block">Tanggal</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">Pilih jam</Label>
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlot(s)}
                    className={`rounded-xl border px-3 py-2 text-sm transition-colors ${
                      slot === s
                        ? "border-brand bg-brand-soft font-semibold"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Konteks untuk mentor</Label>
              <Textarea
                placeholder="Ceritakan singkat tujuan sesi kamu..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <Button
              disabled={!date || !slot}
              onClick={() => {
                const bookingRec = db.addBooking({
                  mentorId: mentor.mentorId,
                  mentorName: mentor.name,
                  date,
                  slot: slot ?? "",
                  priceIdr: mentor.priceIdr,
                  status: "booked",
                });
                pushBooking(bookingRec);
                setDone(true);
                toast.success("Sesi terkonfirmasi", {
                  description: `${mentor.name} · ${date} pukul ${slot} WIB`,
                });
              }}
            >
              Konfirmasi booking
            </Button>
          </>
        )}

        {mentor && done && (
          <div className="py-4 text-center">
            <CalendarDays className="mx-auto size-10 text-brand" />
            <h2 className="mt-4 font-display text-xl font-bold">Sesi kamu sudah terjadwal</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mentor.name} · {date} pukul {slot} WIB. Undangan kalender dikirim ke email kamu.
            </p>
            <div className="mt-6 rounded-2xl bg-muted p-4 text-left text-sm">
              <p className="font-semibold">Setelah sesi</p>
              <p className="mt-1 text-muted-foreground">
                Kamu akan diminta memberi rating dan kami menyarankan mentor lanjutan sesuai progres
                kariermu.
              </p>
            </div>
            <Button className="mt-5 w-full" variant="outline" onClick={close}>
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
