"use client";

import { useState } from "react";
import { AdvancedStatsGrid } from "@/components/analytics/AdvancedStatsGrid";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { ChartSkeleton } from "@/components/analytics/SectionShell";
import { DayOfWeekChart } from "@/components/analytics/DayOfWeekChart";
import { EmotionPerformanceTable } from "@/components/analytics/EmotionPerformanceTable";
import { EquityCurveFullChart } from "@/components/analytics/EquityCurveFullChart";
import { HourlyHeatmap } from "@/components/analytics/HourlyHeatmap";
import { PairPerformanceTable } from "@/components/analytics/PairPerformanceTable";
import { WinRateBySession } from "@/components/analytics/WinRateBySession";
import { WinRateBySetup } from "@/components/analytics/WinRateBySetup";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { useAnalyticsStats, type AnalyticsRange } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

const ranges: AnalyticsRange[] = ["7D", "1M", "3M", "6M", "1Y", "ALL"];

export default function AnalyticsPage() {
  const { subscription } = useDashboard();
  const isPro = subscription.plan === "pro";
  const [range, setRange] = useState<AnalyticsRange>("7D");
  const stats = useAnalyticsStats(isPro ? range : "7D");
  const data = stats.data;
  const hasEnoughTrades = (data?.summary.totalTrades ?? 0) >= 5;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground-primary">Analytics</h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Performance patterns, edge quality, and trading behavior.
          </p>
        </div>
        <div className="flex rounded-[10px] border border-border bg-background-secondary p-1">
          {ranges.map((option) => {
            const locked = !isPro && option !== "7D";
            return (
              <button
                key={option}
                className={cn(
                  "h-9 rounded-[8px] px-3 text-sm font-medium text-foreground-secondary transition",
                  range === option && "bg-accent-subtle text-accent",
                  locked && "cursor-not-allowed opacity-40",
                )}
                type="button"
                disabled={locked}
                onClick={() => setRange(option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {!isPro ? (
        <div className="rounded-[12px] border border-border-accent bg-accent-subtle px-4 py-3 text-sm text-accent">
          Free users can view the last 7 days only. Upgrade to Pro for 1M, 3M, 6M, 1Y, and all-time analytics.
        </div>
      ) : null}

      {stats.isLoading ? (
        <div className="grid gap-5">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : stats.error ? (
        <div className="rounded-[12px] border border-loss/30 bg-loss/10 p-4 text-sm text-loss">
          {stats.error.message}
        </div>
      ) : data && !hasEnoughTrades ? (
        <div className="rounded-[16px] border border-border bg-background-secondary p-12 text-center">
          <p className="text-xl font-semibold text-foreground-primary">Log at least 5 trades to see analytics</p>
          <p className="mt-2 text-sm text-foreground-secondary">
            Your charts and performance breakdowns will unlock once there is enough journal data.
          </p>
        </div>
      ) : data ? (
        <>
          <AnalyticsSummary summary={data.summary} />
          <div className="grid gap-5 xl:grid-cols-2">
            <EquityCurveFullChart data={data.equityCurve} />
            <WinRateBySession data={data.winRateBySession} />
            <WinRateBySetup data={data.winRateBySetup} />
            <PairPerformanceTable data={data.pairPerformance} />
            <HourlyHeatmap data={data.hourlyHeatmap} />
            <DayOfWeekChart data={data.dayOfWeek} />
            <AdvancedStatsGrid stats={data.advancedStats} />
            <EmotionPerformanceTable data={data.emotionPerformance} />
          </div>
        </>
      ) : null}
    </div>
  );
}
