"use client";

import { SectionShell } from "@/components/analytics/SectionShell";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function cellColor(rate: number, trades: number) {
  if (!trades) return "rgba(255,255,255,0.035)";
  const alpha = Math.max(rate / 100, 0.18);
  return `rgba(0,214,143,${alpha})`;
}

export function HourlyHeatmap({ data }: { data: AnalyticsStats["hourlyHeatmap"] }) {
  return (
    <SectionShell title="Hourly Heatmap">
      <div className="overflow-x-auto">
        <div className="min-w-[720px] space-y-2">
          <div className="grid grid-cols-[44px_repeat(24,1fr)] gap-1 text-[10px] text-foreground-tertiary">
            <span />
            {Array.from({ length: 24 }, (_, hour) => <span key={hour}>{hour}</span>)}
          </div>
          {dayOrder.map((day) => (
            <div key={day} className="grid grid-cols-[44px_repeat(24,1fr)] gap-1">
              <span className="text-xs text-foreground-secondary">{day}</span>
              {Array.from({ length: 24 }, (_, hour) => {
                const cell = data.find((item) => item.day === day && item.hour === hour);
                return (
                  <div
                    key={hour}
                    title={`${day} ${hour}:00 - ${cell?.winRate.toFixed(1) ?? 0}%`}
                    className="h-5 rounded-[4px]"
                    style={{ background: cellColor(cell?.winRate ?? 0, cell?.trades ?? 0) }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
