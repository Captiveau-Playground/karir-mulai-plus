import { useEffect, useState } from "react";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karir-mulai-plus/ui/components/select";
import { client } from "@/utils/orpc";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  tag?: string | null;
  imageUrl?: string | null;
  date?: string | null;
  readMinutes?: number | null;
  status: string;
};

const EMPTY: Omit<BlogPost, "id"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Career",
  tag: "Artikel",
  imageUrl: "",
  date: new Date().toISOString().slice(0, 10),
  readMinutes: 3,
  status: "draft",
};

export function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await client.config.blogList({ status: "all" });
      setPosts(res.items as BlogPost[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      await client.config.blogSave({
        ...(editing.id ? { id: editing.id } : {}),
        title: editing.title,
        slug: editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        excerpt: editing.excerpt ?? undefined,
        content: editing.content ?? undefined,
        category: editing.category ?? undefined,
        tag: editing.tag ?? undefined,
        imageUrl: editing.imageUrl ?? undefined,
        date: editing.date ?? undefined,
        readMinutes: editing.readMinutes ?? undefined,
        status: (editing.status as "draft" | "published") ?? "draft",
      });
      toast.success("Postingan disimpan");
      setEditing(null);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal simpan");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus postingan ini?")) return;
    await client.config.blogDelete({ id });
    toast.success("Terhapus");
    void load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bricolage text-xl font-bold text-foreground">Kelola Blog</h2>
        <Button size="sm" className="bg-brand font-manrope" onClick={() => setEditing({ ...EMPTY, id: "" })}>
          <Plus className="size-4" /> Tulis Postingan
        </Button>
      </div>

      {editing && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <Label className="font-manrope text-xs text-muted-foreground">Judul</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-manrope text-xs text-muted-foreground">Slug</Label>
              <Input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-manrope text-xs text-muted-foreground">Status</Label>
              <Select
                value={editing.status}
                onValueChange={(v) => setEditing({ ...editing, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="font-manrope text-xs text-muted-foreground">Kategori</Label>
              <Input
                value={editing.category ?? ""}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-manrope text-xs text-muted-foreground">Tag</Label>
              <Input
                value={editing.tag ?? ""}
                onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-manrope text-xs text-muted-foreground">URL Gambar</Label>
              <Input
                value={editing.imageUrl ?? ""}
                onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-manrope text-xs text-muted-foreground">Tanggal</Label>
              <Input
                type="date"
                value={editing.date ?? ""}
                onChange={(e) => setEditing({ ...editing, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-manrope text-xs text-muted-foreground">Menit baca</Label>
              <Input
                type="number"
                value={editing.readMinutes ?? 3}
                onChange={(e) =>
                  setEditing({ ...editing, readMinutes: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="font-manrope text-xs text-muted-foreground">Ringkasan</Label>
              <Textarea
                rows={2}
                value={editing.excerpt ?? ""}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="font-manrope text-xs text-muted-foreground">Konten</Label>
              <Textarea
                rows={6}
                value={editing.content ?? ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2 border-t border-border pt-3">
            <Button size="sm" className="bg-brand font-manrope" disabled={saving} onClick={save}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
              Batal
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {loading && <p className="font-manrope text-sm text-muted-foreground">Memuat...</p>}
        {posts.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-manrope text-sm font-semibold text-foreground">
                {p.title}
              </p>
              <p className="flex items-center gap-3 font-manrope text-xs text-muted-foreground">
                <span>{p.status === "published" ? "🟢 Published" : "🟡 Draft"}</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3" /> {p.date}
                </span>
                <span className="truncate">{p.category}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing({ ...EMPTY, ...p })}
              >
                <Pencil className="size-3.5" /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {!loading && posts.length === 0 && (
          <p className="font-manrope text-sm text-muted-foreground">Belum ada postingan.</p>
        )}
      </div>
    </div>
  );
}
