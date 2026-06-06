"use client";

import { SectionShell } from "@/components/analytics/SectionShell";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

function rowClass(rate: number) {
  if (rate >= 60) return "border-accent/20 bg-accent-subtle";
  if (rate >= 40) return "border-warning/20 bg-warning/5";
  return "border-loss/20 bg-loss/5";
}

export function EmotionPerformanceTable({ data }: { data: AnalyticsStats["emotionPerformance"] }) {
  return (
    <SectionShell title="Emotion vs Performance" className="col-span-full">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase text-foreground-tertiary">
            <tr>
              <th className="px-4 py-3">Emotion</th>
              <th className="px-4 py-3">Trades</th>
              <th className="px-4 py-3">Win Rate</th>
              <th className="px-4 py-3">Avg P&L</th>
              <th className="px-4 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.emotion} className={`border ${rowClass(row.winRate)}`}>
                <td className="px-4 py-3 font-semibold text-foreground-primary">{row.emotion}</td>
                <td className="px-4 py-3 text-foreground-secondary">{row.trades}</td>
                <td className="px-4 py-3 text-foreground-secondary">{row.winRate.toFixed(1)}%</td>
                <td className={row.avgPnl >= 0 ? "px-4 py-3 text-accent" : "px-4 py-3 text-loss"}>
                  ${row.avgPnl.toFixed(0)}
                </td>
                <td className="px-4 py-3 text-foreground-secondary">{row.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
