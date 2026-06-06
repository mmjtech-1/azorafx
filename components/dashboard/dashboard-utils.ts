import { differenceInMinutes, format, subDays } from "date-fns";
import type { DashboardTrade, EquityPoint, PairPnlPoint } from "@/components/dashboard/types";

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateWinRate(trades: DashboardTrade[]) {
  const closed = trades.filter((trade) => trade.outcome !== "open");
  const wins = closed.filter((trade) => trade.outcome === "win").length;

  return closed.length ? (wins / closed.length) * 100 : 0;
}

export function calculateAverageRiskReward(trades: DashboardTrade[]) {
  const values = trades.map((trade) => toNumber(trade.risk_reward)).filter((value) => value > 0);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function calculateBalance(trades: DashboardTrade[], startingBalance = 10000) {
  return trades.reduce((balance, trade) => balance + toNumber(trade.pnl), startingBalance);
}

export function buildEquityCurve(trades: DashboardTrade[], startingBalance = 10000): EquityPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime(),
  );

  return Array.from({ length: 14 }, (_, index) => {
    const date = subDays(new Date(), 13 - index);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const balance = sorted
      .filter((trade) => new Date(trade.opened_at) <= endOfDay)
      .reduce((sum, trade) => sum + toNumber(trade.pnl), startingBalance);

    return {
      date: format(date, "MMM d"),
      balance,
    };
  });
}

export function buildPairPnl(trades: DashboardTrade[]): PairPnlPoint[] {
  const totals = trades.reduce<Record<string, number>>((acc, trade) => {
    acc[trade.pair] = (acc[trade.pair] ?? 0) + toNumber(trade.pnl);
    return acc;
  }, {});

  return Object.entries(totals)
    .map(([pair, pnl]) => ({ pair, pnl }))
    .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
    .slice(0, 6);
}

export function calculateStreaks(trades: DashboardTrade[]) {
  const closed = [...trades]
    .filter((trade) => trade.outcome === "win" || trade.outcome === "loss")
    .sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime());

  let best = 0;
  let worst = 0;
  let currentWins = 0;
  let currentLosses = 0;

  for (const trade of closed) {
    if (trade.outcome === "win") {
      currentWins += 1;
      currentLosses = 0;
    } else {
      currentLosses += 1;
      currentWins = 0;
    }

    best = Math.max(best, currentWins);
    worst = Math.max(worst, currentLosses);
  }

  return { best, worst };
}

export function calculateTradesThisMonth(trades: DashboardTrade[]) {
  const now = new Date();
  return trades.filter((trade) => {
    const opened = new Date(trade.opened_at);
    return opened.getMonth() === now.getMonth() && opened.getFullYear() === now.getFullYear();
  }).length;
}

export function calculateAverageHoldTime(trades: DashboardTrade[]) {
  const durations = trades
    .filter((trade) => trade.closed_at)
    .map((trade) => differenceInMinutes(new Date(trade.closed_at as string), new Date(trade.opened_at)))
    .filter((duration) => duration > 0);

  if (!durations.length) {
    return "2h 15m";
  }

  const average = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  const hours = Math.floor(average / 60);
  const minutes = Math.round(average % 60);

  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}
