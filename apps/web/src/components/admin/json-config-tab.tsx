import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import { client } from "@/utils/orpc";

/* ============================================================
 * Editor JSON mentah (textarea) untuk struktur kompleks:
 * quiz, interview, roadmap, gamifikasi, dll.
 * Aman: parse + validasi sebelum simpan.
 * ============================================================ */

export function JsonConfigTab({
  title,
  description,
  key: configKey,
  category,
  template,
}: {
  title: string;
  description?: string;
  key: string;
  category: string;
  template: unknown;
}) {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await client.config.get({ key: configKey });
        setRaw(JSON.stringify(res ? res.value : template, null, 2));
      } catch {
        setRaw(JSON.stringify(template, null, 2));
      } finally {
        setLoading(false);
      }
    })();
  }, [configKey]);

  async function save() {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setError("JSON tidak valid — cek sintaksnya.");
      return;
    }
    setSaving(true);
    try {
      await client.config.set({ key: configKey, category, value: parsed });
      toast.success("Tersimpan — halaman publik otomatis ter-update");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-manrope text-sm text-muted-foreground">Memuat...</p>;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-bricolage text-xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 font-manrope text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Textarea
        rows={18}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="font-mono text-xs"
        spellCheck={false}
      />
      {error && <p className="font-manrope text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button className="bg-brand font-manrope" disabled={saving} onClick={save}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setRaw(JSON.stringify(template, null, 2))}
        >
          Reset ke default
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
 * Editor list string sederhana (role options, coach starters, dll)
 * ============================================================ */

export function StringListTab({
  title,
  description,
  key: configKey,
  category,
  template,
}: {
  title: string;
  description?: string;
  key: string;
  category: string;
  template: string[];
}) {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await client.config.get({ key: configKey });
        setItems(res ? (res.value as string[]) : template);
      } catch {
        setItems(template);
      } finally {
        setLoading(false);
      }
    })();
  }, [configKey]);

  async function save() {
    setSaving(true);
    try {
      await client.config.set({ key: configKey, category, value: items.filter((s) => s.trim()) });
      toast.success("Tersimpan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="font-manrope text-sm text-muted-foreground">Memuat...</p>;

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-bricolage text-xl font-bold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 font-manrope text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Textarea
              rows={1}
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                setItems(next);
              }}
              className="font-manrope text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setItems(items.filter((_, j) => j !== i))}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => setItems([...items, ""])}>
        + Tambah item
      </Button>
      <div className="flex gap-2">
        <Button className="bg-brand font-manrope" disabled={saving} onClick={save}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button variant="outline" onClick={() => setItems(template)}>
          Reset ke default
        </Button>
      </div>
    </div>
  );
}
