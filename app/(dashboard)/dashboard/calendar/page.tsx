"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays, Lock, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { CountdownBanner } from "@/components/calendar/CountdownBanner";
import { EventRow } from "@/components/calendar/EventRow";
import { TradeWindowTimeline } from "@/components/calendar/TradeWindowTimeline";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { useCalendar } from "@/hooks/useCalendar";
import type { CalendarFilters as CalendarFiltersType, CalendarEvent, GroupedCalendarEvents } from "@/types/calendar";

const emptyGroups: GroupedCalendarEvents = {};

function sortDates(dates: string[]) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return dates.sort((a, b) => {
    if (a === today) return -1;
    if (b === today) return 1;
    if (a === tomorrow) return -1;
    if (b === tomorrow) return 1;
    return a.localeCompare(b);
  });
}

function DateHeader({ date, events }: { date: string; events: CalendarEvent[] }) {
  const highCount = events.filter((event) => event.impact === "high").length;
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] bg-background-tertiary px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold text-white">
          {new Date(`${date}T00:00:00+05:00`).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </h2>
        <p className="text-xs text-foreground-secondary">{events.length} events / {highCount} high impact</p>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-secondary">PKT</span>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="grid grid-cols-[76px_84px_88px_1fr_96px_96px_110px_28px] gap-3 border-b border-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-tertiary">
      <span>Time</span>
      <span>Impact</span>
      <span>Currency</span>
      <span>Event</span>
      <span>Previous</span>
      <span>Forecast</span>
      <span>Actual</span>
      <span />
    </div>
  );
}

export default function CalendarPage() {
  const { subscription } = useDashboard();
  const [filters, setFilters] = useState<CalendarFiltersType>({ impact: "high", currency: "all", range: "thisWeek" });
  const query = useCalendar(filters);
  const flatEvents = query.data?.flatEvents ?? [];
  const grouped = query.data?.events ?? emptyGroups;
  const dates = useMemo(() => sortDates(Object.keys(grouped)), [grouped]);
  const isFree = (query.data?.tier ?? subscription.plan) === "free";

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00D68F]/20 bg-[#00D68F]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D68F]">
            <CalendarDays className="h-3.5 w-3.5" />
            ForexFactory Live Feed
          </div>
          <h1 className="text-3xl font-semibold text-white">Economic Calendar</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground-secondary">
            Track high-impact releases in PKT and protect execution windows around volatile news.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground-secondary transition hover:border-border-strong hover:text-white"
          onClick={() => query.refetch()}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </motion.header>

      <CountdownBanner events={flatEvents} />

      {isFree ? (
        <section className="flex items-center gap-3 rounded-[16px] border border-[#00D68F]/20 bg-[#00D68F]/5 p-4 text-sm text-foreground-secondary">
          <Lock className="h-4 w-4 text-[#00D68F]" />
          Free plan shows high-impact events only. Medium and low impact filters unlock on Pro.
        </section>
      ) : null}

      {query.data?.lastUpdated ? (
        <p className="text-xs text-foreground-tertiary">
          Cached calendar last updated {formatDistanceToNow(new Date(query.data.lastUpdated), { addSuffix: true })}.
        </p>
      ) : query.data?.notice ? (
        <p className="text-xs text-amber-200">{query.data.notice}</p>
      ) : null}

      <CalendarFilters filters={filters} onChange={setFilters} isFree={isFree} />
      <TradeWindowTimeline events={flatEvents} />

      <section className="overflow-hidden rounded-[16px] border border-border bg-background-secondary">
        <TableHeader />
        {query.isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-[10px] bg-background-tertiary" />
            ))}
          </div>
        ) : dates.length ? (
          dates.map((date) => (
            <div key={date}>
              <DateHeader date={date} events={grouped[date]} />
              {grouped[date].map((event) => (
                <EventRow key={`${event.event_date}-${event.event_time}-${event.currency}-${event.event_name}`} event={event} />
              ))}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <CalendarDays className="mb-3 h-8 w-8 text-foreground-tertiary" />
            <h2 className="text-base font-semibold text-white">No events cached for this range</h2>
            <p className="mt-1 max-w-md text-sm text-foreground-secondary">
              The page will show cached Supabase data when ForexFactory data has been refreshed.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
