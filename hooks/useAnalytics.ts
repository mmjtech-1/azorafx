"use client";

import { useQuery } from "@tanstack/react-query";

export type AnalyticsRange = "7D" | "1M" | "3M" | "6M" | "1Y" | "ALL";

export type AnalyticsStats = {
  summary: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    avgRiskReward: number;
    totalPnl: number;
    maxDrawdown: number;
  };
  equityCurve: Array<{ date: string; balance: number; dailyPnl: number; drawdown: number }>;
  winRateBySession: Array<{ name: string; winRate: number; trades: number }>;
  winRateBySetup: Array<{ name: string; winRate: number; trades: number }>;
  pairPerformance: Array<{
    pair: string;
    trades: number;
    winRate: number;
    avgRiskReward: number;
    totalPnl: number;
    bestTrade: number;
    worstTrade: number;
    profitFactor: number;
  }>;
  hourlyHeatmap: Array<{ day: string; hour: number; winRate: number; trades: number }>;
  dayOfWeek: Array<{ day: string; winRate: number; trades: number }>;
  advancedStats: {
    bestWinningStreak: number;
    worstLosingStreak: number;
    avgWinningTrade: number;
    avgLosingTrade: number;
    expectancy: number;
    largestSingleWin: number;
    largestSingleLoss: number;
    recoveryFactor: number;
  };
  emotionPerformance: Array<{
    emotion: string;
    trades: number;
    winRate: number;
    avgPnl: number;
    recommendation: string;
  }>;
};

const ranges: Record<Exclude<AnalyticsRange, "ALL">, number> = {
  "7D": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

function rangeToSearch(dateRange: AnalyticsRange) {
  if (dateRange === "ALL") return "";

  const date = new Date();
  date.setDate(date.getDate() - ranges[dateRange]);
  return `?dateFrom=${encodeURIComponent(date.toISOString())}`;
}

export function useAnalyticsStats(dateRange: AnalyticsRange) {
  return useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/trades/stats${rangeToSearch(dateRange)}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load analytics.");
      }

      return payload as AnalyticsStats;
    },
  });
}
