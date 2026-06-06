"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionShell } from "@/components/analytics/SectionShell";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

function color(rate: number) {
  if (rate > 60) return "#00D68F";
  if (rate >= 40) return "#FFA502";
  return "#FF4757";
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function WinRateBySetup({ data }: { data: AnalyticsStats["winRateBySetup"] }) {
  const chartData = data.map((item) => ({ ...item, label: label(item.name) }));
  return (
    <SectionShell title="Win Rate by Setup">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 24 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} width={125} />
            <Tooltip contentStyle={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Win Rate"]} />
            <Bar dataKey="winRate" radius={[0, 8, 8, 0]} label={{ position: "right", fill: "#F1F5F9", formatter: (value: number) => `${value.toFixed(0)}%` }}>
              {chartData.map((entry) => <Cell key={entry.name} fill={color(entry.winRate)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionShell>
  );
}
