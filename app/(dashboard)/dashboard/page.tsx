"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlugZap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboard } from "@/components/layout/DashboardProvider";
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
  toNumber,
} from "@/components/dashboard/dashboard-utils";
import type { DashboardTrade } from "@/components/dashboard/types";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function DashboardPage() {
  const { user, connectedAccounts } = useDashboard();
  const [trades, setTrades] = useState<DashboardTrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTrades() {
      setIsLoading(true);
      setError("");

      let result:
        | {
            data: DashboardTrade[] | null;
            error: { message: string } | null;
          }
        | undefined;

      try {
        const supabase = createClient();
        const { data, error: tradesError } = await supabase
          .from("trades")
          .select("id,pair,direction,entry_price,exit_price,pnl,risk_reward,outcome,opened_at,closed_at")
          .order("opened_at", { ascending: false })
          .limit(100);

        result = {
          data: (data ?? []) as DashboardTrade[],
          error: tradesError,
        };
      } catch (loadError) {
        result = {
          data: [],
          error: {
            message: loadError instanceof Error ? loadError.message : "Unable to initialize Supabase.",
          },
        };
      }

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setError(result.error.message);
        setTrades([]);
      } else {
        setTrades(result.data ?? []);
      }

      setIsLoading(false);
    }

    loadTrades();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasConnectedAccount = connectedAccounts.length > 0;
  const hasRealTrades = trades.length > 0;
  const displayTrades = useMemo(() => (hasRealTrades ? trades : hasConnectedAccount ? [] : demoTrades), [hasConnectedAccount, hasRealTrades, trades]);

  const dashboardData = useMemo(() => {
    const connectedBalance = connectedAccounts.find((account) => account.is_primary)?.account_balance ?? connectedAccounts[0]?.account_balance;
    const balance = hasConnectedAccount ? Number(connectedBalance ?? calculateBalance(displayTrades)) : calculateBalance(displayTrades);
    const winRate = calculateWinRate(displayTrades);
    const avgRiskReward = calculateAverageRiskReward(displayTrades);
    const openDrawdown = displayTrades
      .filter((trade) => trade.outcome === "open")
      .reduce((sum, trade) => sum + Math.min(toNumber(trade.pnl), 0), 0);
    const openDrawdownPercent = balance ? Math.abs(openDrawdown / balance) * 100 : 0;
    const streaks = calculateStreaks(displayTrades);

    return {
      balance,
      winRate,
      avgRiskReward,
      openDrawdownPercent,
      equity: buildEquityCurve(displayTrades),
      pairPnl: buildPairPnl(displayTrades),
      bestStreak: streaks.best,
      worstStreak: streaks.worst,
      tradesThisMonth: calculateTradesThisMonth(displayTrades),
      avgHoldTime: calculateAverageHoldTime(displayTrades),
    };
  }, [connectedAccounts, displayTrades, hasConnectedAccount]);

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={container}>
      <motion.div variants={item}>
        <h2 className="text-2xl font-semibold text-foreground-primary">Dashboard</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          {getGreeting()}, {user.name}. Here&apos;s your current trading pulse.
        </p>
        {!hasConnectedAccount && !isLoading ? (
          <div className="mt-4 flex flex-col gap-3 rounded-[16px] border border-[#00D68F]/20 bg-[#00D68F]/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#00D68F]">Sample Data</p>
              <p className="mt-1 text-sm text-foreground-secondary">Connect your trading account to auto-import trades and replace sample analytics with real data.</p>
            </div>
            <Link className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00D68F] px-4 text-sm font-semibold text-black" href="/dashboard/connect">
              <PlugZap className="h-4 w-4" /> Connect Account
            </Link>
          </div>
        ) : null}
        {hasConnectedAccount && !hasRealTrades && !isLoading ? (
          <p className="mt-3 rounded-[10px] border border-border bg-background-secondary px-3 py-2 text-sm text-foreground-secondary">
            No trades synced yet — click Sync Now from Connected Accounts or wait for the automatic background sync.
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-[10px] border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            Unable to load trades: {error}
          </p>
        ) : null}
      </motion.div>

      <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" variants={container}>
        <MetricCard
          label="Account Balance"
          value={dashboardData.balance}
          change="+4.8% this week"
          changeType="up"
          prefix="$"
        />
        <MetricCard
          label="Win Rate"
          value={dashboardData.winRate}
          change="+6.2% vs last week"
          changeType="up"
          suffix="%"
          decimals={1}
        />
        <MetricCard
          label="Avg R:R"
          value={dashboardData.avgRiskReward}
          change="+0.3 improvement"
          changeType="up"
          prefix="1:"
          decimals={1}
        />
        <MetricCard
          label="Open Drawdown"
          value={dashboardData.openDrawdownPercent}
          change="Below 5% limit"
          changeType="down"
          suffix="%"
          decimals={1}
        />
      </motion.div>

      <motion.div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]" variants={container}>
        <motion.div variants={item}>
          <EquityCurve data={dashboardData.equity} />
        </motion.div>
        <motion.div variants={item}>
          <PnLByPair data={dashboardData.pairPnl} />
        </motion.div>
      </motion.div>

      <motion.div variants={item}>
        <RecentTradesTable trades={displayTrades} isLoading={isLoading} />
      </motion.div>

      <motion.div variants={item}>
        <StatStrip
          bestStreak={dashboardData.bestStreak}
          worstStreak={dashboardData.worstStreak}
          tradesThisMonth={dashboardData.tradesThisMonth}
          avgHoldTime={dashboardData.avgHoldTime}
        />
      </motion.div>
    </motion.div>
  );
}
