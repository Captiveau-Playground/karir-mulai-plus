import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { JsonItemEditor, useConfigCrud } from "./config-editor";

/* ============================================================
 * Tab CRUD generik untuk list JSON (market, mentor, career, ...)
 * keyPrefix: "market.roles" | "mentors.list" | "career.paths"
 * ============================================================ */

export function CrudListTab({
  title,
  key,
  category,
  emptyTemplate,
}: {
  title: string;
  key: string;
  category: string;
  emptyTemplate: Record<string, unknown>;
}) {
  const { data, loading, saving, save } = useConfigCrud(key, category);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(emptyTemplate);

  const items: Record<string, unknown>[] = (data ?? []) as Record<string, unknown>[];

  async function persist(items: unknown[]) {
    const ok = await save(items);
    if (ok) setEditingIdx(null);
  }

  if (loading) {
    return <p className="font-manrope text-sm text-muted-foreground">Memuat...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bricolage text-xl font-bold text-foreground">{title}</h2>
        <Button
          size="sm"
          className="bg-brand font-manrope"
          onClick={() => {
            setDraft(emptyTemplate);
            setEditingIdx(-1); // mode baru
          }}
        >
          <Plus className="size-4" /> Tambah
        </Button>
      </div>

      {/* Editor (baru / edit) */}
      {editingIdx !== null && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <JsonItemEditor
            value={draft}
            onChange={(v) => setDraft(v as Record<string, unknown>)}
            onSave={() => {
              if (editingIdx === -1) {
                void persist([...items, draft]);
              } else {
                const next = [...items];
                next[editingIdx] = draft;
                void persist(next);
              }
            }}
            onDelete={
              editingIdx !== -1
                ? () => {
                    const next = [...items];
                    next.splice(editingIdx, 1);
                    void persist(next);
                  }
                : undefined
            }
            saving={saving}
          />
        </div>
      )}

      {/* List */}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => {
          const obj = item as Record<string, unknown>;
          const name: string =
            (typeof obj.name === "string" ? obj.name : "") ||
            (typeof obj.role === "string" ? obj.role : "") ||
            (typeof obj.title === "string" ? obj.title : "") ||
            (typeof obj.skill === "string" ? obj.skill : "") ||
            (typeof obj.industry === "string" ? obj.industry : "") ||
            `Item ${i + 1}`;
          return (
            <button
              key={i}
              onClick={() => {
                setDraft(obj);
                setEditingIdx(i);
              }}
              className={`rounded-xl border p-4 text-left transition-colors ${
                editingIdx === i
                  ? "border-brand bg-brand-soft"
                  : "border-border bg-card hover:border-brand/40"
              }`}
            >
              <p className="font-manrope text-sm font-semibold text-foreground">{String(name)}</p>
              {obj.currentRole !== undefined && (
                <p className="font-manrope text-xs text-muted-foreground">
                  {String(obj.currentRole)}
                </p>
              )}
              {obj.demand !== undefined && (
                <p className="font-manrope text-xs text-muted-foreground">
                  demand {String(obj.demand)}
                </p>
              )}
            </button>
          );
        })}
        {items.length === 0 && (
          <p className="font-manrope text-sm text-muted-foreground">Belum ada data.</p>
        )}
      </div>
    </div>
  );
}
