"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionShell } from "@/components/analytics/SectionShell";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

export function EquityCurveFullChart({ data }: { data: AnalyticsStats["equityCurve"] }) {
  const [showDrawdown, setShowDrawdown] = useState(false);

  return (
    <SectionShell title="Equity Curve" className="col-span-full">
      <div className="mb-3 flex justify-end">
        <label className="flex items-center gap-2 text-sm text-foreground-secondary">
          <input checked={showDrawdown} type="checkbox" onChange={(event) => setShowDrawdown(event.target.checked)} />
          Drawdown overlay
        </label>
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsEquity" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00D68F" stopOpacity={0.42} />
                <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="drawdownArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FF4757" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#FF4757" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
              formatter={(value, name) => [
                name === "balance" ? `$${Number(value).toLocaleString()}` : `$${Number(value).toLocaleString()}`,
                name === "dailyPnl" ? "Daily P&L" : name === "drawdown" ? "Drawdown" : "Balance",
              ]}
              labelStyle={{ color: "#94A3B8" }}
            />
            {showDrawdown ? (
              <Area type="monotone" dataKey="drawdown" stroke="#FF4757" fill="url(#drawdownArea)" strokeWidth={2} />
            ) : null}
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#00D68F"
              fill="url(#analyticsEquity)"
              fillOpacity={1}
              strokeWidth={3}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionShell>
  );
}
