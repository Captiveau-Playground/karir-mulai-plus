import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { Textarea } from "@karir-mulai-plus/ui/components/textarea";
import { client } from "@/utils/orpc";

/* ============================================================
 * Form editor JSON generik untuk backoffice.
 * - data : objek apa saja (contoh: satu item mentor / role)
 * - Render field berdasarkan tipe (string | number | boolean | string[])
 * ============================================================ */

function FieldEditor({
  name,
  value,
  onChange,
}: {
  name: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const label = name.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 rounded border-border accent-[var(--brand)]"
        />
        <span className="font-manrope text-sm text-foreground">{label}</span>
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="space-y-1">
        <Label className="font-manrope text-xs text-muted-foreground">{label}</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-1">
        <Label className="font-manrope text-xs text-muted-foreground">
          {label} (pisahkan dengan koma)
        </Label>
        <Input
          value={(value as unknown[]).join(", ")}
          onChange={(e) =>
            onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
          }
        />
      </div>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <div className="space-y-2 rounded-lg border border-border p-3">
        <p className="font-manrope text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <JsonSubEditor value={value as Record<string, unknown>} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label className="font-manrope text-xs text-muted-foreground">{label}</Label>
      {typeof value === "string" && value.length > 80 ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function JsonSubEditor({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (v: unknown) => void;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(value).map(([k, v]) => (
        <FieldEditor key={k} name={k} value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />
      ))}
    </div>
  );
}

export function JsonItemEditor({
  value,
  onChange,
  onSave,
  onDelete,
  saving,
}: {
  value: unknown;
  onChange: (v: unknown) => void;
  onSave: () => void;
  onDelete?: () => void;
  saving?: boolean;
}) {
  return (
    <div className="space-y-4">
      <JsonSubEditor value={value as Record<string, unknown>} onChange={onChange} />
      <div className="flex gap-2 border-t border-border pt-3">
        <Button size="sm" className="bg-brand font-manrope" disabled={saving} onClick={onSave}>
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            className="font-manrope text-destructive"
            onClick={() => {
              if (confirm("Hapus item ini?")) onDelete();
            }}
          >
            Hapus
          </Button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * CRUD list generik: daftar item JSON, edit via form.
 * keyPrefix: prefix key di app_config (misal "market.roles")
 * ============================================================ */

export function useConfigCrud(key: string, category: string) {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await client.config.get({ key });
      setData(res ? (res.value as unknown[]) : []);
    } catch (e) {
      console.error("gagal load config", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [key]);

  async function save(items: unknown[]) {
    setSaving(true);
    try {
      await client.config.set({ key, category, value: items });
      toast.success("Tersimpan");
      setData(items);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { data, loading, saving, load, save };
}
