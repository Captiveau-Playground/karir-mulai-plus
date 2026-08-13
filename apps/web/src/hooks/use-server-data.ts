import { useQuery } from "@tanstack/react-query";

import {
  hiringHeat,
  insightCards,
  mentors as mentorsMock,
  roleSignals,
  salaryBenchmarks,
  skillSignals,
} from "@/lib/mock-data";
import { client } from "@/utils/orpc";

/* ============================================================
 * Data layer MULAI+ Career.
 * Preferensi data (paling tinggi dulu):
 *   1. Konfig backoffice (app_config — dikelola manager/superadmin)
 *   2. Router server default (market/mentors RPC)
 *   3. Mock-data (cache offline saat semua gagal)
 * ============================================================ */

export type RoleSignal = (typeof roleSignals)[number];
export type SkillSignal = (typeof skillSignals)[number];
export type SalaryBenchmark = (typeof salaryBenchmarks)[number];
export type HiringHeat = (typeof hiringHeat)[number];
export type InsightCard = (typeof insightCards)[number];
export type Mentor = (typeof mentorsMock)[number];

interface MarketBundle {
  skills: unknown[];
  roles: unknown[];
  salaries: unknown[];
  heat: unknown[];
  insights: unknown[];
}

async function loadMarketBundle(): Promise<MarketBundle> {
  // 1. Konfig backoffice (bundle category "market")
  try {
    const items = await client.config.getCategory({ category: "market" });
    const map = new Map(items.map((it) => [it.key, it.value as unknown]));
    return {
      skills: (map.get("market.skills") as unknown[]) ?? (await client.market.skillSignals()),
      roles: (map.get("market.roles") as unknown[]) ?? (await client.market.roleSignals()),
      salaries: (map.get("market.salaries") as unknown[]) ?? (await client.market.salaryBenchmarks()),
      heat: (map.get("market.heat") as unknown[]) ?? (await client.market.hiringHeat()),
      insights: (map.get("market.insights") as unknown[]) ?? (await client.market.insights()),
    };
  } catch {
    // 2. Router server default
    const [skills, roles, salaries, heat, insights] = await Promise.all([
      client.market.skillSignals(),
      client.market.roleSignals(),
      client.market.salaryBenchmarks(),
      client.market.hiringHeat(),
      client.market.insights(),
    ]);
    return { skills, roles, salaries, heat, insights };
  }
}

async function loadMentorsBundle(): Promise<unknown[]> {
  try {
    const items = await client.config.getCategory({ category: "mentors" });
    const map = new Map(items.map((it) => [it.key, it.value as unknown]));
    const configured = map.get("mentors.list");
    if (configured) return configured as unknown[];
  } catch {
    // fallthrough
  }
  return client.mentors.list();
}

export function useMarketData() {
  const query = useQuery({
    queryKey: ["data", "market"],
    queryFn: loadMarketBundle,
    placeholderData: {
      skills: skillSignals as never[],
      roles: roleSignals as never[],
      salaries: salaryBenchmarks as never[],
      heat: hiringHeat as never[],
      insights: insightCards as never[],
    },
    retry: 1,
  });

  return {
    skills: query.data?.skills,
    roles: query.data?.roles,
    salaries: query.data?.salaries,
    heat: query.data?.heat,
    insights: query.data?.insights,
    isFromServer: query.isFetched && query.dataUpdatedAt > 0,
    isPending: query.isPending,
  };
}

export function useMentors() {
  const query = useQuery({
    queryKey: ["data", "mentors"],
    queryFn: loadMentorsBundle,
    placeholderData: mentorsMock as never[],
    retry: 1,
  });

  return {
    mentors: query.data,
    isFromServer: query.isFetched && query.dataUpdatedAt > 0,
    isPending: query.isPending,
  };
}

export type MarketData = ReturnType<typeof useMarketData>;
export type MentorsData = ReturnType<typeof useMentors>;

/* ============================================================
 * Hook generik: baca satu konfig backoffice (key) dengan
 * fallback ke nilai default (mock / hardcoded).
 * ============================================================ */

export function useConfigValue<T>(key: string, fallback: T): T {
  const query = useQuery({
    queryKey: ["config", "value", key],
    queryFn: async () => {
      const res = await client.config.get({ key });
      return (res ? res.value : fallback) as T;
    },
    retry: 1,
  });
  return (query.data as T) ?? fallback;
}
