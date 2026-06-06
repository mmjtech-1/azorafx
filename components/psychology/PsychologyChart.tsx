"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { PsychologyLog } from "@/types/psychology";

export function PsychologyChart({ logs }: { logs: PsychologyLog[] }) {
  const data = [...logs].reverse().slice(-14).map((log) => ({
    date: log.log_date.slice(5),
    Discipline: log.discipline_score ?? 0,
    Patience: log.patience_score ?? 0,
    "FOMO Control": log.fomo_control_score ?? 0,
    Confidence: log.confidence_score ?? 0,
    Focus: log.focus_score ?? 0,
  }));
  return (
    <section className="rounded-[16px] border border-border bg-background-secondary p-5">
      <h2 className="border-l-2 border-accent pl-3 text-lg font-semibold">Score History</h2>
      <div className="mt-5 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
            <Legend />
            {["Discipline", "Patience", "FOMO Control", "Confidence", "Focus"].map((key, index) => (
              <Line key={key} type="monotone" dataKey={key} stroke={["#00D68F", "#3D8EF8", "#FFA502", "#A78BFA", "#F1F5F9"][index]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
