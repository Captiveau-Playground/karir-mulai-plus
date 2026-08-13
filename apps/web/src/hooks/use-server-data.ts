import { useQuery } from "@tanstack/react-query";

import type {
  hiringHeat,
  insightCards,
  mentors as mentorsMock,
  roleSignals,
  salaryBenchmarks,
  skillSignals,
} from "@/lib/mock-data";
import { client } from "@/utils/orpc";

/* ============================================================
 * Data layer MULAI+ Career — fetch dari server via oRPC,
 * dengan fallback ke mock-data saat offline / fetch gagal
 * (pola local-first: server = sumber kebenaran, mock = cache).
 * ============================================================ */

export type RoleSignal = (typeof roleSignals)[number];
export type SkillSignal = (typeof skillSignals)[number];
export type SalaryBenchmark = (typeof salaryBenchmarks)[number];
export type HiringHeat = (typeof hiringHeat)[number];
export type InsightCard = (typeof insightCards)[number];
export type Mentor = (typeof mentorsMock)[number];

export function useMarketData() {
  const skills = useQuery({
    queryKey: ["market", "skills"],
    queryFn: () => client.market.skillSignals(),
    placeholderData: [] as never[],
    retry: 1,
  });
  const roles = useQuery({
    queryKey: ["market", "roles"],
    queryFn: () => client.market.roleSignals(),
    placeholderData: [] as never[],
    retry: 1,
  });
  const salaries = useQuery({
    queryKey: ["market", "salaries"],
    queryFn: () => client.market.salaryBenchmarks(),
    placeholderData: [] as never[],
    retry: 1,
  });
  const heat = useQuery({
    queryKey: ["market", "heat"],
    queryFn: () => client.market.hiringHeat(),
    placeholderData: [] as never[],
    retry: 1,
  });
  const insights = useQuery({
    queryKey: ["market", "insights"],
    queryFn: () => client.market.insights(),
    placeholderData: [] as never[],
    retry: 1,
  });

  return {
    skills: skills.data,
    roles: roles.data,
    salaries: salaries.data,
    heat: heat.data,
    insights: insights.data,
    isFromServer: skills.isFetched && skills.dataUpdatedAt > 0,
    isPending: skills.isPending || roles.isPending,
  };
}

export function useMentors() {
  const query = useQuery({
    queryKey: ["mentors"],
    queryFn: () => client.mentors.list(),
    placeholderData: [] as never[],
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
