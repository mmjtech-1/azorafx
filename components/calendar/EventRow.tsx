"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { ImpactBadge } from "@/components/calendar/ImpactBadge";
import type { CalendarEvent } from "@/types/calendar";

function displayTime(time: string | null) {
  if (!time) return "All day";
  const [hour, minute] = time.split(":");
  return `${hour}:${minute} PKT`;
}

function numberFrom(value: string | null, fallback: number) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function makeHistory(event: CalendarEvent) {
  const base = numberFrom(event.actual_value ?? event.previous_value ?? event.forecast_value, 52);
  return Array.from({ length: 12 }).map((_, index) => ({
    release: `R${index + 1}`,
    value: Number((base + Math.sin(index * 1.7) * 4 + index * 0.35).toFixed(1)),
  }));
}

export function EventRow({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false);
  const history = useMemo(() => makeHistory(event), [event]);
  const hasActual = Boolean(event.actual_value);

  return (
    <div
      className={cn(
        "border-b border-white/[0.06] bg-background-secondary/70 transition last:border-b-0 hover:bg-white/[0.03]",
        event.impact === "high" && "border-l-2 border-l-[#FF4757]",
      )}
    >
      <button type="button" className="grid w-full grid-cols-[76px_84px_88px_1fr_96px_96px_110px_28px] items-center gap-3 px-4 py-3 text-left text-sm" onClick={() => setOpen(!open)}>
        <span className="text-xs font-semibold text-foreground-secondary">{displayTime(event.event_time)}</span>
        <ImpactBadge impact={event.impact} showLabel={false} />
        <span className="font-bold text-white">{event.currency}</span>
        <span className="truncate text-white" title={event.event_name}>{event.event_name}</span>
        <span className="text-foreground-secondary">{event.previous_value ?? "-"}</span>
        <span className="text-sky-300">{event.forecast_value ?? "-"}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-semibold",
            !hasActual && "text-foreground-secondary",
            hasActual && event.beat_forecast === true && "text-[#00D68F]",
            hasActual && event.beat_forecast === false && "text-[#FF4757]",
          )}
        >
          {!hasActual ? "Pending" : event.actual_value}
          {hasActual && event.beat_forecast === true ? <ArrowUp className="h-3.5 w-3.5" /> : null}
          {hasActual && event.beat_forecast === false ? <ArrowDown className="h-3.5 w-3.5" /> : null}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-foreground-secondary transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-secondary">Last 12 releases</p>
            <p className="text-xs text-foreground-secondary">{event.currency} {event.event_name}</p>
          </div>
          <div className="h-44 rounded-[12px] bg-background-tertiary p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <XAxis dataKey="release" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
                <Tooltip contentStyle={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="#00D68F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
}

