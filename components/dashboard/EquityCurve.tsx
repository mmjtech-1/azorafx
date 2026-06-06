"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EquityPoint } from "@/components/dashboard/types";

type EquityCurveProps = {
  data: EquityPoint[];
};

export function EquityCurve({ data }: EquityCurveProps) {
  return (
    <section className="h-[320px] rounded-[16px] border border-border bg-background-secondary p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground-primary">Equity Curve</h2>
        <p className="text-sm text-foreground-secondary">14-day balance progression</p>
      </div>

      <ResponsiveContainer width="100%" height="78%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00D68F" stopOpacity={0.42} />
              <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
          <Tooltip
            contentStyle={{
              background: "#0E1117",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#F1F5F9",
            }}
            formatter={(value) => [`$${Number(value).toLocaleString("en-US")}`, "Balance"]}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#00D68F"
            strokeWidth={3}
            fill="url(#equityGradient)"
            fillOpacity={1}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
