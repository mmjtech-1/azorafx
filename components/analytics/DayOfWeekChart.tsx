"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SectionShell } from "@/components/analytics/SectionShell";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

export function DayOfWeekChart({ data }: { data: AnalyticsStats["dayOfWeek"] }) {
  const ordered = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (day) => data.find((item) => item.day === day) ?? { day, winRate: 0, trades: 0 },
  );
  return (
    <SectionShell title="Best Day of Week">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ordered}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Win Rate"]} />
            <Bar dataKey="winRate" radius={[8, 8, 4, 4]}>
              {ordered.map((entry) => <Cell key={entry.day} fill={entry.winRate >= 50 ? "#00D68F" : "#FF4757"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionShell>
  );
}
