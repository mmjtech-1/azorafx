"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PairPnlPoint } from "@/components/dashboard/types";

type PnLByPairProps = {
  data: PairPnlPoint[];
};

export function PnLByPair({ data }: PnLByPairProps) {
  return (
    <section className="h-[320px] rounded-[16px] border border-border bg-background-secondary p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground-primary">P&amp;L by Pair</h2>
        <p className="text-sm text-foreground-secondary">Current sample of traded markets</p>
      </div>

      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <XAxis dataKey="pair" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
          <YAxis hide domain={["dataMin - 40", "dataMax + 40"]} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{
              background: "#0E1117",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              color: "#F1F5F9",
            }}
            formatter={(value) => [`$${Number(value).toLocaleString("en-US")}`, "P&L"]}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Bar dataKey="pnl" radius={[8, 8, 4, 4]} minPointSize={4} isAnimationActive animationDuration={800}>
            {data.map((entry) => (
              <Cell key={entry.pair} fill={entry.pnl >= 0 ? "#00D68F" : "#FF4757"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
