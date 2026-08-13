import { useEffect, useState } from "react";
import { History } from "lucide-react";

import { Button } from "@karir-mulai-plus/ui/components/button";
import { Badge } from "@karir-mulai-plus/ui/components/badge";
import { client } from "@/utils/orpc";

type AuditRow = {
  id: string;
  actorName?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: string | null;
  after?: string | null;
  at: Date;
};

const ACTION_TONE: Record<string, string> = {
  create: "bg-success/15 text-success",
  update: "bg-brand-soft text-brand",
  delete: "bg-destructive/15 text-destructive",
};

export function AuditTab() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await client.config.auditLog({ page: 0, limit: 30 });
      setRows(res as unknown as AuditRow[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function fmtTime(d: Date) {
    return d.toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History className="size-5 text-brand" />
        <h2 className="font-bricolage text-xl font-bold text-foreground">Audit Log</h2>
      </div>

      <div className="space-y-2">
        {loading && <p className="font-manrope text-sm text-muted-foreground">Memuat...</p>}
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge className={`font-manrope ${ACTION_TONE[r.action] ?? "bg-muted"}`}>
                  {r.action}
                </Badge>
                <span className="font-manrope text-sm font-semibold text-foreground">
                  {r.entity}
                </span>
                {r.entityId && (
                  <span className="truncate font-manrope text-xs text-muted-foreground">
                    #{r.entityId}
                  </span>
                )}
              </div>
              <p className="mt-1 font-manrope text-xs text-muted-foreground">
                oleh <span className="font-semibold">{r.actorName ?? "sistem"}</span> ·{" "}
                {fmtTime(r.at)}
              </p>
            </div>
          </div>
        ))}
        {!loading && rows.length === 0 && (
          <p className="font-manrope text-sm text-muted-foreground">Belum ada aktivitas.</p>
        )}
      </div>

      {rows.length === 30 && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => load()}>
            Muat lebih banyak
          </Button>
        </div>
      )}
    </div>
  );
}
