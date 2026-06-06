"use client";

import { useQuery } from "@tanstack/react-query";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import type { CalendarEvent, CalendarFilters, GroupedCalendarEvents } from "@/types/calendar";

function rangeToDates(range: CalendarFilters["range"]) {
  const now = new Date();
  if (range === "today") {
    const today = format(now, "yyyy-MM-dd");
    return { dateFrom: today, dateTo: today };
  }
  if (range === "tomorrow") {
    const tomorrow = format(addDays(now, 1), "yyyy-MM-dd");
    return { dateFrom: tomorrow, dateTo: tomorrow };
  }
  const weekOffset = range === "nextWeek" ? 7 : 0;
  const weekBase = addDays(now, weekOffset);
  return {
    dateFrom: format(startOfWeek(weekBase, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    dateTo: format(endOfWeek(weekBase, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Unable to load economic calendar");
  return payload as T;
}

export function useCalendar(filters: CalendarFilters) {
  return useQuery({
    queryKey: ["calendar", filters],
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      const dates = rangeToDates(filters.range);
      const params = new URLSearchParams({
        dateFrom: dates.dateFrom,
        dateTo: dates.dateTo,
        impact: filters.impact,
        currency: filters.currency,
      });
      return readJson<{
        events: GroupedCalendarEvents;
        flatEvents: CalendarEvent[];
        lastUpdated: string | null;
        notice: string | null;
        tier: "free" | "pro";
        dateFrom: string;
        dateTo: string;
      }>(await fetch(`/api/calendar?${params.toString()}`));
    },
  });
}

