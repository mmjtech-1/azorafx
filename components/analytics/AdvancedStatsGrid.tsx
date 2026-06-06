"use client";

import { SectionShell } from "@/components/analytics/SectionShell";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

function money(value: number) {
  return `${value >= 0 ? "" : "-"}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function AdvancedStatsGrid({ stats }: { stats: AnalyticsStats["advancedStats"] }) {
  const cards = [
    ["Best winning streak", `${stats.bestWinningStreak}`],
    ["Worst losing streak", `${stats.worstLosingStreak}`],
    ["Avg winning trade", money(stats.avgWinningTrade)],
    ["Avg losing trade", money(stats.avgLosingTrade)],
    ["Expectancy per trade", money(stats.expectancy)],
    ["Largest single win", money(stats.largestSingleWin)],
    ["Largest single loss", money(stats.largestSingleLoss)],
    ["Recovery factor", stats.recoveryFactor.toFixed(2)],
  ];

  return (
    <SectionShell title="Advanced Stats" className="col-span-full">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-[12px] border border-border bg-background-tertiary p-4">
            <p className="text-xs text-foreground-secondary">{label}</p>
            <p className="mt-2 text-xl font-semibold text-foreground-primary">{value}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
