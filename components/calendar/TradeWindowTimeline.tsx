"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent } from "@/types/calendar";

function minutes(time: string | null) {
  if (!time) return 720;
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function pct(minute: number) {
  return `${Math.max(0, Math.min(100, (minute / 1440) * 100))}%`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const sessions = [
  { label: "Asian", start: 0, end: 540, className: "bg-slate-500/10" },
  { label: "London", start: 1200, end: 1440, className: "bg-sky-400/10" },
  { label: "London", start: 0, end: 120, className: "bg-sky-400/10" },
  { label: "New York", start: 180, end: 720, className: "bg-emerald-400/10" },
  { label: "Overlap", start: 180, end: 360, className: "bg-[#00D68F]/20" },
];

export function TradeWindowTimeline({ events }: { events: CalendarEvent[] }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const todayEvents = useMemo(() => events.filter((event) => event.event_date === todayIso()), [events]);
  const zones = todayEvents
    .filter((event) => event.impact === "high" || event.impact === "medium")
    .map((event) => {
      const center = minutes(event.event_time);
      const radius = event.impact === "high" ? 30 : 20;
      return {
        event,
        start: Math.max(0, center - radius),
        end: Math.min(1440, center + radius),
        className: event.impact === "high" ? "bg-[#FF4757]/45" : "bg-amber-400/35",
      };
    });
  const currentMinute = now.getHours() * 60 + now.getMinutes();

  return (
    <section className="rounded-[16px] border border-border bg-background-secondary p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="border-l-2 border-[#00D68F] pl-3 text-lg font-semibold text-white">Trade Window Timeline</h2>
          <p className="mt-1 text-xs text-foreground-secondary">PKT 24-hour view with red news avoidance zones.</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-secondary">00:00 - 23:59</span>
      </div>

      <div className="relative h-20 overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#141820]">
        <div className="absolute inset-0 bg-[#00D68F]/10" title="Safe to trade" />
        {sessions.map((session, index) => (
          <div
            key={`${session.label}-${index}`}
            className={`absolute top-0 h-full ${session.className}`}
            style={{ left: pct(session.start), width: pct(session.end - session.start) }}
            title={`${session.label} session`}
          />
        ))}
        {zones.map((zone) => (
          <div
            key={`${zone.event.event_date}-${zone.event.event_time}-${zone.event.event_name}`}
            className={`absolute top-0 h-full ${zone.className}`}
            style={{ left: pct(zone.start), width: pct(zone.end - zone.start) }}
            title={`${zone.event.impact.toUpperCase()}: ${zone.event.currency} ${zone.event.event_name}`}
          />
        ))}
        <div className="absolute top-0 h-full w-px bg-white shadow-[0_0_14px_rgba(255,255,255,0.8)]" style={{ left: pct(currentMinute) }} />
        <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[10px] font-semibold text-foreground-secondary">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-foreground-secondary">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#00D68F]/70" />Safe</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />Caution</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#FF4757]" />Avoid</span>
      </div>
    </section>
  );
}
