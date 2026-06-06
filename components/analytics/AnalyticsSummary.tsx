"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const spring = useSpring(0, { stiffness: 80, damping: 18 });
  const display = useTransform(spring, (latest) => {
    const formatted = latest.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export function AnalyticsSummary({ summary }: { summary: AnalyticsStats["summary"] }) {
  const cards = [
    ["Total Trades", summary.totalTrades, "", "", 0],
    ["Win Rate", summary.winRate, "", "%", 1],
    ["Profit Factor", summary.profitFactor, "", "", 2],
    ["Avg R:R", summary.avgRiskReward, "1:", "", 1],
    ["Total P&L", summary.totalPnl, "$", "", 0],
    ["Max Drawdown", summary.maxDrawdown, "$", "", 0],
  ] as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {cards.map(([label, value, prefix, suffix, decimals]) => (
        <article key={label} className="rounded-[16px] border border-border bg-background-secondary p-5">
          <p className="text-xs font-semibold uppercase text-foreground-secondary">{label}</p>
          <p className="mt-4 text-[30px] font-semibold leading-none text-foreground-primary">
            <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
          </p>
        </article>
      ))}
    </div>
  );
}
