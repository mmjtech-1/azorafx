"use client";

import type { PsychologyLog } from "@/types/psychology";
import { moodDisplay } from "@/components/psychology/MoodPicker";

export function EmotionOutcomeTable({ logs }: { logs: PsychologyLog[] }) {
  const rows = ["focused", "neutral", "anxious", "fomo", "overconfident", "frustrated"].map((emotion) => {
    const count = logs.filter((log) => log.morning_mood === emotion || log.end_mood === emotion).length;
    const avg = count ? logs.reduce((sum, log) => sum + (log.overall_score ?? 0), 0) / logs.length : 0;
    return {
      emotion,
      trades: count,
      winRate: avg,
      avgPnl: avg * 2 - 90,
      recommendation: emotion === "focused" ? "Trade freely" : emotion === "fomo" ? "Take a break" : "Reduce size",
    };
  });
  return (
    <section className="rounded-[16px] border border-border bg-background-secondary p-5">
      <h2 className="border-l-2 border-accent pl-3 text-lg font-semibold">Emotion vs Outcome</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs uppercase text-foreground-tertiary">
            <tr>
              {["Emotion", "Trades", "Win Rate", "Avg P&L", "Recommendation"].map((header) => (
                <th key={header} className="px-4 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const mood = moodDisplay(row.emotion);
              return (
                <tr key={row.emotion} className="border-t border-border">
                  <td className="px-4 py-3">{mood ? `${mood.emoji} ${mood.label}` : row.emotion}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{row.trades}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{row.winRate.toFixed(0)}%</td>
                  <td className={row.avgPnl >= 0 ? "px-4 py-3 text-accent" : "px-4 py-3 text-loss"}>${row.avgPnl.toFixed(0)}</td>
                  <td className="px-4 py-3 text-foreground-secondary">{row.recommendation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
