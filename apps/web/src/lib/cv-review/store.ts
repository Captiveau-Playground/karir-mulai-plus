/* ============================================================
 * Store panel internal MULAI+ OPS.
 *
 * Pola sama dengan src/lib/db.ts: satu objek state di module scope +
 * useSyncExternalStore, dipersist ke localStorage.
 *
 * Seed-nya deterministik (ADMIN_NOW) sehingga render SSR dan render
 * pertama di klien identik — tidak ada hydration mismatch.
 * ============================================================ */

import { useSyncExternalStore } from "react";
import {
  ADMIN_NOW,
  CASES,
  CLIENTS,
  DELIVERABLE_DEFS,
  STAFF,
  VIEWER_ID,
  buildDeliverable,
  buildChecks,
  classifyCv,
  clientOf,
  draftContextFor,
  generateCoverLetter,
  generateCv,
  nextStage,
  stageIndex,
  staffName,
  type ActivityItem,
  type ActivityKind,
  type CaseFile,
  type Client,
  type CvGradeKey,
  type Deliverable,
  type DeliverableKey,
  type DeliverableStatus,
  type NoteSeverity,
  type PriorityKey,
  type ReviewNote,
  type Staff,
  type StageKey,
} from "./data";

export type AdminState = {
  cases: CaseFile[];
  clients: Client[];
  staff: Staff[];
  viewerId: string;
};

export type StaffSlot = "reviewer" | "writer" | "qa";

export type NoteDraft = {
  scope: DeliverableKey | "general";
  severity: NoteSeverity;
  section: string;
  body: string;
  before: string;
  after: string;
};

const KEY = "mulai-plus-admin-v1";

export function seedState(): AdminState {
  // Deep-ish clone: cukup untuk memutus referensi array/objek tingkat atas.
  return {
    cases: CASES.map((c) => ({
      ...c,
      assignee: { ...c.assignee },
      notes: c.notes.map((n) => ({ ...n })),
      deliverables: cloneDeliverables(c.deliverables),
      activity: c.activity.map((a) => ({ ...a })),
      clientFeedback: c.clientFeedback ? { ...c.clientFeedback } : null,
      tags: [...c.tags],
    })),
    clients: CLIENTS.map((c) => ({ ...c })),
    staff: STAFF.map((s) => ({ ...s, specialties: [...s.specialties] })),
    viewerId: VIEWER_ID,
  };
}

function cloneDeliverables(
  d: Record<DeliverableKey, Deliverable>,
): Record<DeliverableKey, Deliverable> {
  const out = {} as Record<DeliverableKey, Deliverable>;
  for (const def of DELIVERABLE_DEFS) {
    const src = d[def.key];
    out[def.key] = {
      ...src,
      checks: src.checks.map((c) => ({ ...c })),
      history: src.history.map((h) => ({ ...h })),
    };
  }
  return out;
}

function load(): AdminState {
  if (typeof localStorage === "undefined") return seedState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Partial<AdminState>;
    if (!parsed.cases?.length) return seedState();
    const base = seedState();
    return {
      cases: parsed.cases,
      clients: parsed.clients?.length ? parsed.clients : base.clients,
      staff: parsed.staff?.length ? parsed.staff : base.staff,
      viewerId: parsed.viewerId ?? base.viewerId,
    };
  } catch {
    return seedState();
  }
}

let state: AdminState = load();
const listeners = new Set<() => void>();
let serverSnapshot: AdminState | null = null;

function getServerSnapshot(): AdminState {
  if (!serverSnapshot) serverSnapshot = seedState();
  return serverSnapshot;
}

function commit(next: AdminState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage tidak tersedia */
  }
  listeners.forEach((l) => l());
}

let seq = 0;
const uid = (prefix: string) => {
  seq += 1;
  return `${prefix}-${ADMIN_NOW.toString(36)}-${seq.toString(36)}`;
};

function patchCase(
  id: string,
  updater: (c: CaseFile) => CaseFile,
): AdminState {
  return {
    ...state,
    cases: state.cases.map((c) => (c.id === id ? updater(c) : c)),
  };
}

function log(
  c: CaseFile,
  kind: ActivityKind,
  actor: string,
  text: string,
  at: number = ADMIN_NOW,
): CaseFile {
  const item: ActivityItem = { id: uid("ACT"), at, kind, actor, text };
  return { ...c, activity: [item, ...c.activity] };
}

function viewerName(): string {
  return staffName(state.viewerId);
}

/** Isi otomatis deliverable sesuai tahap baru. */
function applyStageDefaults(c: CaseFile, stage: StageKey): CaseFile {
  const ctx = draftContextFor(c);
  const enabled =
    c.pkg === "express" ? (["cv_id", "cover_id"] as DeliverableKey[]) : DELIVERABLE_DEFS.map((d) => d.key);
  const deliverables = { ...c.deliverables };

  const ensure = (key: DeliverableKey, status: DeliverableStatus) => {
    if (!enabled.includes(key)) return;
    const current = deliverables[key];
    if (status === "drafting" && current.status === "todo") {
      deliverables[key] = buildDeliverable(key, ctx, "drafting", c.assignee.writer);
      return;
    }
    if (status === "review" && (current.status === "todo" || current.status === "drafting")) {
      const body = current.body
        ? current.body
        : DELIVERABLE_DEFS.find((d) => d.key === key)!.kind === "cv"
          ? generateCv(ctx, DELIVERABLE_DEFS.find((d) => d.key === key)!.lang)
          : generateCoverLetter(ctx, DELIVERABLE_DEFS.find((d) => d.key === key)!.lang);
      deliverables[key] = {
        ...current,
        status: "review",
        ownerId: current.ownerId ?? c.assignee.writer,
        body,
        version: current.version || 1,
        updatedAt: ADMIN_NOW,
        wordCount: current.wordCount || body.trim().split(/\s+/).length,
        checks: buildChecks(DELIVERABLE_DEFS.find((d) => d.key === key)!.kind, body),
      };
      return;
    }
    if (status === "published") {
      deliverables[key] = {
        ...current,
        status: "published",
        updatedAt: ADMIN_NOW,
        version: Math.max(1, current.version),
        history: current.history.some((h) => h.version === current.version)
          ? current.history
          : [
              ...current.history,
              {
                version: current.version,
                at: ADMIN_NOW,
                by: viewerName(),
                note: "Disetujui & diterbitkan.",
              },
            ],
      };
    }
  };

  if (stage === "production") {
    ensure("cv_id", "drafting");
    ensure("cover_id", "drafting");
  }
  if (stage === "qa" || stage === "revision" || stage === "published") {
    for (const key of enabled) ensure(key, stage === "published" ? "published" : "review");
  }

  return { ...c, stage, deliverables };
}

export const adminStore = {
  get: (): AdminState => state,
  getServerSnapshot,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },

  /** Geser kasus ke tahap lain (kanban drag atau tombol lanjut). */
  moveStage(id: string, stage: StageKey) {
    commit(
      patchCase(id, (c) => {
        if (c.stage === stage) return c;
        const moved = applyStageDefaults({ ...c, stage }, stage);
        return log(
          moved,
          "stage",
          viewerName(),
          `Memindahkan kasus dari ${c.stage} ke ${stage}.`,
        );
      }),
    );
  },

  advance(id: string) {
    const c = state.cases.find((x) => x.id === id);
    if (!c) return;
    const next = nextStage(c.stage);
    if (next) adminStore.moveStage(id, next);
  },

  setPriority(id: string, priority: PriorityKey) {
    commit(
      patchCase(id, (c) =>
        log({ ...c, priority }, "stage", viewerName(), `Mengubah prioritas menjadi ${priority}.`),
      ),
    );
  },

  assign(id: string, slot: StaffSlot, staffId: string | null) {
    commit(
      patchCase(id, (c) =>
        log(
          { ...c, assignee: { ...c.assignee, [slot]: staffId } },
          "assign",
          viewerName(),
          `${slot === "reviewer" ? "Reviewer" : slot === "writer" ? "Writer" : "QA"} ditetapkan: ${staffName(staffId)}.`,
        ),
      ),
    );
  },

  addTag(id: string, tag: string) {
    const clean = tag.trim();
    if (!clean) return;
    commit(
      patchCase(id, (c) =>
        c.tags.includes(clean) ? c : { ...c, tags: [...c.tags, clean] },
      ),
    );
  },

  removeTag(id: string, tag: string) {
    commit(patchCase(id, (c) => ({ ...c, tags: c.tags.filter((t) => t !== tag) })));
  },

  /* — Review & catatan — */

  addNote(id: string, draft: NoteDraft) {
    if (!draft.body.trim()) return;
    commit(
      patchCase(id, (c) => {
        const note: ReviewNote = {
          id: uid("NOTE"),
          at: ADMIN_NOW,
          authorId: state.viewerId,
          authorName: viewerName(),
          scope: draft.scope,
          severity: draft.severity,
          section: draft.section.trim() || "Umum",
          body: draft.body.trim(),
          before: draft.before.trim() ? draft.before.trim() : null,
          after: draft.after.trim() ? draft.after.trim() : null,
          resolved: false,
          resolvedBy: null,
        };
        return log(
          { ...c, notes: [note, ...c.notes] },
          "note",
          viewerName(),
          `Menambahkan catatan ${draft.severity} pada bagian ${note.section}.`,
        );
      }),
    );
  },

  toggleNote(caseId: string, noteId: string) {
    commit(
      patchCase(caseId, (c) => ({
        ...c,
        notes: c.notes.map((n) =>
          n.id === noteId
            ? {
                ...n,
                resolved: !n.resolved,
                resolvedBy: !n.resolved ? viewerName() : null,
              }
            : n,
        ),
      })),
    );
  },

  removeNote(caseId: string, noteId: string) {
    commit(
      patchCase(caseId, (c) => ({ ...c, notes: c.notes.filter((n) => n.id !== noteId) })),
    );
  },

  /* — Klasifikasi AI — */

  rerunClassification(id: string) {
    commit(
      patchCase(id, (c) => {
        const next = classifyCv(c.cvText, c.roleTarget, {
          at: ADMIN_NOW,
          humanConfirmed: false,
        });
        return log(
          { ...c, classification: next },
          "ai",
          "AI Classifier",
          `Klasifikasi ulang dijalankan — tipe CV: ${next.grade} (skor ${next.score}).`,
        );
      }),
    );
  },

  /** Reviewer menimpa hasil AI (human-in-the-loop). */
  overrideGrade(id: string, grade: CvGradeKey, note: string) {
    commit(
      patchCase(id, (c) => {
        if (!c.classification) return c;
        const next = {
          ...c.classification,
          grade,
          humanConfirmed: true,
          overrideNote: note.trim() || "Disesuaikan reviewer tanpa catatan tambahan.",
          at: ADMIN_NOW,
        };
        return log(
          { ...c, classification: next },
          "ai",
          viewerName(),
          `Menimpa klasifikasi AI menjadi "${grade}".`,
        );
      }),
    );
  },

  confirmClassification(id: string) {
    commit(
      patchCase(id, (c) => {
        if (!c.classification) return c;
        return log(
          {
            ...c,
            classification: { ...c.classification, humanConfirmed: true },
          },
          "ai",
          viewerName(),
          `Mengonfirmasi klasifikasi AI: ${c.classification.grade}.`,
        );
      }),
    );
  },

  /* — Deliverable — */

  generateDraft(id: string, key: DeliverableKey, mode: "replace" | "append") {
    commit(
      patchCase(id, (c) => {
        const def = DELIVERABLE_DEFS.find((d) => d.key === key)!;
        const ctx = draftContextFor(c);
        const body = def.kind === "cv" ? generateCv(ctx, def.lang) : generateCoverLetter(ctx, def.lang);
        const current = c.deliverables[key];
        const nextBody =
          mode === "append" && current.body ? `${current.body}\n\n${body}` : body;
        const next: Deliverable = {
          ...current,
          status: current.status === "todo" ? "drafting" : current.status,
          body: nextBody,
          ownerId: current.ownerId ?? c.assignee.writer,
          version: Math.max(1, current.version),
          updatedAt: ADMIN_NOW,
          wordCount: nextBody.trim() ? nextBody.trim().split(/\s+/).length : 0,
          checks: buildChecks(def.kind, nextBody),
        };
        return log(
          { ...c, deliverables: { ...c.deliverables, [key]: next } },
          "deliverable",
          viewerName(),
          `Menghasilkan draft ${def.short} dari template.`,
        );
      }),
    );
  },

  saveDeliverable(id: string, key: DeliverableKey, body: string) {
    commit(
      patchCase(id, (c) => {
        const def = DELIVERABLE_DEFS.find((d) => d.key === key)!;
        const current = c.deliverables[key];
        const version = current.version || 1;
        const next: Deliverable = {
          ...current,
          status: current.status === "todo" ? "drafting" : current.status,
          body,
          version,
          updatedAt: ADMIN_NOW,
          wordCount: body.trim() ? body.trim().split(/\s+/).length : 0,
          checks: buildChecks(def.kind, body),
          history: [
            {
              version,
              at: ADMIN_NOW,
              by: viewerName(),
              note: "Menyimpan perubahan draft.",
            },
            ...current.history,
          ].slice(0, 6),
        };
        return log(
          { ...c, deliverables: { ...c.deliverables, [key]: next } },
          "deliverable",
          viewerName(),
          `Menyimpan ${def.short} (v${version}).`,
        );
      }),
    );
  },

  toggleCheck(id: string, key: DeliverableKey, checkLabel: string) {
    commit(
      patchCase(id, (c) => {
        const current = c.deliverables[key];
        return {
          ...c,
          deliverables: {
            ...c.deliverables,
            [key]: {
              ...current,
              checks: current.checks.map((ch) =>
                ch.label === checkLabel
                  ? { ...ch, done: !ch.done, auto: ch.auto && !ch.done ? false : ch.auto }
                  : ch,
              ),
            },
          },
        };
      }),
    );
  },

  setDeliverableStatus(id: string, key: DeliverableKey, status: DeliverableStatus) {
    commit(
      patchCase(id, (c) => {
        const def = DELIVERABLE_DEFS.find((d) => d.key === key)!;
        const current = c.deliverables[key];
        const bumpVersion = status === "review" && current.status === "drafting";
        const next: Deliverable = {
          ...current,
          status,
          updatedAt: ADMIN_NOW,
          version: bumpVersion ? current.version + 1 : current.version,
          history: bumpVersion
            ? [
                {
                  version: current.version + 1,
                  at: ADMIN_NOW,
                  by: viewerName(),
                  note: "Dikirim ke QA untuk review.",
                },
                ...current.history,
              ].slice(0, 6)
            : current.history,
        };
        return log(
          { ...c, deliverables: { ...c.deliverables, [key]: next } },
          "deliverable",
          viewerName(),
          `Status ${def.short} → ${status}.`,
        );
      }),
    );
  },

  /** Terbitkan rilis: semua deliverable aktif ditandai published. */
  publish(id: string) {
    commit(
      patchCase(id, (c) => {
        const enabled =
          c.pkg === "express"
            ? (["cv_id", "cover_id"] as DeliverableKey[])
            : DELIVERABLE_DEFS.map((d) => d.key);
        const deliverables = { ...c.deliverables };
        for (const key of enabled) {
          const cur = deliverables[key];
          deliverables[key] = {
            ...cur,
            status: "published",
            ownerId: cur.ownerId ?? c.assignee.writer,
            version: Math.max(1, cur.version),
            updatedAt: ADMIN_NOW,
            history: [
              {
                version: Math.max(1, cur.version),
                at: ADMIN_NOW,
                by: viewerName(),
                note: "Disetujui QA & diterbitkan ke klien.",
              },
              ...cur.history,
            ].slice(0, 6),
          };
        }
        const published: CaseFile = { ...c, deliverables, stage: "published" };
        return log(
          published,
          "publish",
          viewerName(),
          "Menerbitkan rilis baru: CV ID/EN + surat lamaran dikirim ke klien.",
        );
      }),
    );
  },

  reset() {
    commit(seedState());
  },
};

/** Buat ulang seed saat pengguna ingin data contoh kembali. */
export function resetAdmin() {
  adminStore.reset();
}

export function useAdmin(): AdminState {
  return useSyncExternalStore(adminStore.subscribe, adminStore.get, adminStore.getServerSnapshot);
}

export function useAdminCase(id: string): CaseFile | undefined {
  const state = useAdmin();
  return state.cases.find((c) => c.id === id);
}

export function useAdminClient(clientId: string): Client | undefined {
  const state = useAdmin();
  return state.clients.find((c) => c.id === clientId);
}

/** true kalau kasus sudah melewati tahap tertentu. */
export function hasReached(c: CaseFile, stage: StageKey): boolean {
  return stageIndex(c.stage) >= stageIndex(stage);
}

export { clientOf };
