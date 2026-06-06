"use client";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { EquityCurve } from "@/components/dashboard/EquityCurve";
import { PnLByPair } from "@/components/dashboard/PnLByPair";
import { RecentTradesTable } from "@/components/dashboard/RecentTradesTable";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { demoTrades } from "@/components/dashboard/demo-data";
import {
  buildEquityCurve,
  buildPairPnl,
  calculateAverageHoldTime,
  calculateAverageRiskReward,
  calculateBalance,
  calculateStreaks,
  calculateTradesThisMonth,
  calculateWinRate,
} from "@/components/dashboard/dashboard-utils";

export function PreviewDashboard() {
  const streaks = calculateStreaks(demoTrades);
  const balance = calculateBalance(demoTrades);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-foreground-primary">Dashboard</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Good morning, Muhammad Mouazam. Here&apos;s your current trading pulse.
        </p>
        <p className="mt-2 text-xs text-foreground-tertiary">
          Showing realistic sample trading data until your first journal entries are logged.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Account Balance" value={balance} change="+4.8% this week" changeType="up" prefix="$" />
        <MetricCard
          label="Win Rate"
          value={calculateWinRate(demoTrades)}
          change="+6.2% vs last week"
          changeType="up"
          suffix="%"
          decimals={1}
        />
        <MetricCard
          label="Avg R:R"
          value={calculateAverageRiskReward(demoTrades)}
          change="+0.3 improvement"
          changeType="up"
          prefix="1:"
          decimals={1}
        />
        <MetricCard
          label="Open Drawdown"
          value={0}
          change="Below 5% limit"
          changeType="down"
          suffix="%"
          decimals={1}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <EquityCurve data={buildEquityCurve(demoTrades)} />
        <PnLByPair data={buildPairPnl(demoTrades)} />
      </div>

      <RecentTradesTable trades={demoTrades} isLoading={false} />

      <StatStrip
        bestStreak={streaks.best}
        worstStreak={streaks.worst}
        tradesThisMonth={calculateTradesThisMonth(demoTrades)}
        avgHoldTime={calculateAverageHoldTime(demoTrades)}
      />
    </div>
  );
}
