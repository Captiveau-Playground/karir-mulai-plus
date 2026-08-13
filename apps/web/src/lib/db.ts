import { currentUser } from "./mock-data";

export type Profile = {
  id: string;
  name: string;
  email: string;
  currentRole: string;
  yearsExp: number;
  interest: string;
  skills: string[];
  riasec: string;
  gradYear?: number;
  onboardedAt: number;
};

export type AuditRecord = {
  id: string;
  at: number;
  inputType: "file" | "text";
  fileName?: string;
  textSample: string;
  roleTarget: string;
  score: number;
  breakdown: { structure: number; keywords: number; impact: number; customization: number };
  text?: string;
};

export type BookingRecord = {
  id: string;
  mentorId: string;
  mentorName: string;
  date: string;
  slot: string;
  priceIdr: number;
  status: "booked" | "done";
  rating?: number;
  review?: string;
  at: number;
};

export type ApplicationStage = "draft" | "applied" | "interview" | "offer" | "rejected";

export type Application = {
  id: string;
  role: string;
  company: string;
  stage: ApplicationStage;
  date: string;
  notes?: string;
  at: number;
};

export type CoachMessage = { role: "user" | "assistant"; text: string; at: number };

export type VerifiedSkill = { skill: string; score: number; at: number };

export type RoadmapItem = { label: string; done: boolean };

export type CvDraft = {
  roleTarget: string;
  summary: string;
  experiences: { title: string; company: string; period: string; bullets: string[] }[];
  skills: string[];
  education: { degree: string; school: string; period: string };
  template: "minimal" | "modern" | "bold";
  accent: "brand" | "coral" | "ink";
  updatedAt: number;
};

export type AppState = {
  profile: Profile | null;
  audits: AuditRecord[];
  bookings: BookingRecord[];
  roadmap: string[];
  premium: boolean;
  digest: boolean;
  referralCode: string;
  referralBonus: boolean;
  /* — Career OS (Tier 1) — */
  xp: number;
  streak: number;
  lastActiveDay: string;
  coach: CoachMessage[];
  applications: Application[];
  verifiedSkills: VerifiedSkill[];
  roadmapProgress: Record<string, RoadmapItem[]>;
  pathsCompleted: string[];
  quizzesTaken: number;
  interviewsDone: number;
  cvDraft: CvDraft | null;
  theme: "light" | "dark";
  questLog: { date: string; done: string[] };
  activity: { at: number; label: string }[];
};

const KEY = "mulai-plus-state-v1";

const uid = () => Math.random().toString(36).slice(2, 10);
const genCode = () => uid().toUpperCase().slice(0, 6);
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

const defaults = (): AppState => ({
  profile: null,
  audits: [],
  bookings: [],
  roadmap: [],
  premium: false,
  digest: false,
  referralCode: genCode(),
  referralBonus: false,
  xp: 0,
  streak: 0,
  lastActiveDay: "",
  coach: [],
  applications: [],
  verifiedSkills: [],
  roadmapProgress: {},
  pathsCompleted: [],
  quizzesTaken: 0,
  interviewsDone: 0,
  cvDraft: null,
  theme: "light",
  questLog: { date: "", done: [] },
  activity: [],
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    return defaults();
  }
}

let state: AppState = load();
const listeners = new Set<() => void>();
/** Snapshot konstan untuk SSR (localStorage tidak ada di server). */
const SERVER_SNAPSHOT: AppState = defaults();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

/** Tambah XP + perbarui streak (lanjut jika kemarin aktif, reset jika bolong). */
function reward(n: number) {
  const t = today();
  let streak = state.streak;
  if (state.lastActiveDay === t) {
    // sudah aktif hari ini — streak tetap
  } else if (state.lastActiveDay === yesterday()) {
    streak = state.streak + 1;
  } else {
    streak = 1;
  }
  state = { ...state, xp: state.xp + n, streak, lastActiveDay: t };
  persist();
}

/** Catat aktivitas terakhir (data moat + umpan balik). */
function log(label: string) {
  state = {
    ...state,
    activity: [{ at: Date.now(), label }, ...state.activity].slice(0, 15),
  };
  persist();
}

export const db = {
  get: (): AppState => state,
  /** Snapshot untuk SSR — selalu state kosong (localStorage tidak ada di server). */
  getServerSnapshot: (): AppState => SERVER_SNAPSHOT,
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  setProfile(p: Profile) {
    state = { ...state, profile: p };
    persist();
  },
  reset() {
    state = defaults();
    persist();
  },
  addAudit(a: Omit<AuditRecord, "id" | "at">): AuditRecord {
    const rec: AuditRecord = { ...a, id: uid(), at: Date.now() };
    state = { ...state, audits: [rec, ...state.audits].slice(0, 20) };
    persist();
    reward(15);
    log("Audit CV selesai 📄");
    return rec;
  },
  saveCvDraft(draft: CvDraft) {
    state = { ...state, cvDraft: draft };
    persist();
    log("Draft CV diperbarui ✍️");
  },
  addBooking(b: Omit<BookingRecord, "id" | "at">): BookingRecord {
    const rec: BookingRecord = { ...b, id: uid(), at: Date.now() };
    state = { ...state, bookings: [rec, ...state.bookings] };
    persist();
    reward(10);
    log("Booking mentor 🗓️");
    return rec;
  },
  completeBooking(id: string, rating: number, review: string) {
    state = {
      ...state,
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: "done" as const, rating, review } : b,
      ),
    };
    persist();
    reward(5);
  },
  setPremium(v: boolean) {
    state = { ...state, premium: v };
    persist();
  },
  setDigest(v: boolean) {
    state = { ...state, digest: v };
    persist();
  },
  toggleRoadmap(id: string) {
    const has = state.roadmap.includes(id);
    state = {
      ...state,
      roadmap: has ? state.roadmap.filter((x) => x !== id) : [...state.roadmap, id],
    };
    persist();
  },
  setReferralBonus(v: boolean) {
    state = { ...state, referralBonus: v };
    persist();
  },

  setTheme(theme: "light" | "dark") {
    state = { ...state, theme };
    persist();
  },

  /** Quest harian: selesaikan sekali per hari, +10 XP per quest, +30 jika semua selesai. */
  /** Hydrate dari server (pull saat login) — merge by id, server menang utk profil. */
  hydrate(data: {
    profile?: Profile | null;
    audits?: AuditRecord[];
    applications?: Application[];
    bookings?: BookingRecord[];
  }) {
    const mergeById = <T extends { id: string; at?: number }>(local: T[], remote: T[]) => {
      const ids = new Set(local.map((x) => x.id));
      return [...local, ...remote.filter((x) => !ids.has(x.id))].sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
    };
    state = {
      ...state,
      profile: data.profile ?? state.profile,
      audits: data.audits ? mergeById(state.audits, data.audits) : state.audits,
      applications: data.applications ? mergeById(state.applications, data.applications) : state.applications,
      bookings: data.bookings ? mergeById(state.bookings, data.bookings) : state.bookings,
    };
    persist();
  },

  completeQuest(key: string): "done" | "first" | "all" | "repeat" {
    const t = today();
    const logState = state.questLog.date === t ? state.questLog : { date: t, done: [] };
    if (logState.done.includes(key)) return "repeat";
    const done = [...logState.done, key];
    state = { ...state, questLog: { date: t, done } };
    const allKeys = 4;
    const allDone = done.length >= allKeys;
    persist();
    if (allDone) {
      reward(30);
      log("Menyelesaikan semua quest harian 🎯");
      return "all";
    }
    reward(10);
    log(`Quest harian: ${key}`);
    return done.length === 1 ? "first" : "done";
  },

  /* — Career OS — */

  addApplication(a: Omit<Application, "id" | "at">): Application {
    const rec: Application = { ...a, id: uid(), at: Date.now() };
    state = { ...state, applications: [rec, ...state.applications] };
    persist();
    reward(5);
    log("Lamaran dicatat 💼");
    return rec;
  },
  updateApplication(id: string, patch: Partial<Application>) {
    state = {
      ...state,
      applications: state.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    };
    persist();
  },
  removeApplication(id: string) {
    state = { ...state, applications: state.applications.filter((a) => a.id !== id) };
    persist();
  },

  addCoachMessage(role: CoachMessage["role"], text: string) {
    const firstUserMsg = role === "user" && state.coach.length === 0;
    state = { ...state, coach: [...state.coach, { role, text, at: Date.now() }].slice(-60) };
    persist();
    if (firstUserMsg) {
      reward(5);
      log("Chat pertama dengan coach 💬");
    }
  },
  clearCoach() {
    state = { ...state, coach: [] };
    persist();
  },

  addQuiz(skill: string, score: number) {
    state = {
      ...state,
      quizzesTaken: state.quizzesTaken + 1,
      verifiedSkills: [
        ...state.verifiedSkills.filter((v) => v.skill !== skill),
        { skill, score, at: Date.now() },
      ],
    };
    persist();
    reward(20);
    log(`Quiz ${skill} selesai 🧠`);
  },
  isSkillVerified(skill: string) {
    return state.verifiedSkills.some((v) => v.skill === skill && v.score >= 70);
  },

  roadmapItems(pathId: string): RoadmapItem[] | undefined {
    return state.roadmapProgress[pathId];
  },
  toggleRoadmapItem(pathId: string, label: string) {
    const items = state.roadmapProgress[pathId] ?? [];
    const existing = items.find((i) => i.label === label);
    const next: RoadmapItem[] = existing
      ? items.map((i) => (i.label === label ? { ...i, done: !i.done } : i))
      : [...items, { label, done: true }];
    const wasDone = existing?.done ?? false;
    const isNowDone = !wasDone;
    const allDone = next.length > 0 && next.every((i) => i.done);
    const alreadyCompleted = state.pathsCompleted.includes(pathId);
    state = {
      ...state,
      roadmapProgress: { ...state.roadmapProgress, [pathId]: next },
      pathsCompleted:
        allDone && !alreadyCompleted ? [...state.pathsCompleted, pathId] : state.pathsCompleted,
    };
    persist();
    if (isNowDone) reward(5);
    if (allDone && !alreadyCompleted) reward(30);
    if (isNowDone) log("Langkah roadmap selesai 🗺️");
  },

  addInterviewDone() {
    state = { ...state, interviewsDone: state.interviewsDone + 1 };
    persist();
    reward(10);
    log("Mock interview selesai 🎤");
  },
};

/** Level dari total XP (100 XP per level). */
export const levelFromXp = (xp: number) => Math.floor(xp / 100) + 1;

/** Profil awal yang dipakai sebelum onboarding (seeding data mock). */
export const defaultProfile = (): Profile => ({
  id: "user123",
  name: currentUser.name,
  email: currentUser.email,
  currentRole: currentUser.currentRole,
  yearsExp: currentUser.yearsExp,
  interest: "Product",
  skills: [...currentUser.skills],
  riasec: currentUser.assessmentScores.RIASEC,
  onboardedAt: Date.now(),
});
