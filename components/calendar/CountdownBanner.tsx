"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function eventDateTime(event: CalendarEvent) {
  return new Date(`${event.event_date}T${event.event_time ?? "23:59:00"}+05:00`);
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export function CountdownBanner({ events }: { events: CalendarEvent[] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const nextEvent = useMemo(
    () =>
      events
        .filter((event) => event.impact === "high" && event.event_date === todayIso() && eventDateTime(event).getTime() > now)
        .sort((a, b) => eventDateTime(a).getTime() - eventDateTime(b).getTime())[0],
    [events, now],
  );

  if (!nextEvent) return null;

  return (
    <section className="flex flex-col gap-3 rounded-[16px] border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-300" />
        <div>
          <p className="text-sm font-semibold">
            Next high-impact event: {nextEvent.event_name} in {formatRemaining(eventDateTime(nextEvent).getTime() - now)}
          </p>
          <p className="text-xs text-amber-100/70">Avoid trading 30 min before and after red events.</p>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-200">{nextEvent.currency} / PKT</span>
    </section>
  );
}
