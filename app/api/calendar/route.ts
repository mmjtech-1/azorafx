import { NextResponse, type NextRequest } from "next/server";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { fetchForexFactoryCalendar } from "@/lib/calendar-fetch";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CalendarEvent, GroupedCalendarEvents } from "@/types/calendar";

function groupByDate(events: CalendarEvent[]): GroupedCalendarEvents {
  return events.reduce<GroupedCalendarEvents>((groups, event) => {
    groups[event.event_date] = groups[event.event_date] ?? [];
    groups[event.event_date].push(event);
    return groups;
  }, {});
}

function todayIso() {
  return format(new Date(), "yyyy-MM-dd");
}

function defaultRange() {
  const now = new Date();
  return {
    from: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    to: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}

async function seedCalendarIfEmpty() {
  const admin = createAdminClient();
  if (!admin) return;
  const { count } = await admin.from("calendar_events").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return;
  const events = await fetchForexFactoryCalendar();
  if (!events.length) return;
  await admin
    .from("calendar_events")
    .upsert(
      events.map((event) => ({ ...event, updated_at: new Date().toISOString() })),
      { onConflict: "event_date,currency,event_name,event_time" },
    );
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await seedCalendarIfEmpty();

  const params = request.nextUrl.searchParams;
  const fallback = defaultRange();
  const dateFrom = params.get("dateFrom") ?? fallback.from;
  const dateTo = params.get("dateTo") ?? fallback.to;
  const currency = params.get("currency");
  const requestedImpact = params.get("impact");

  const { data: subscription } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
  const isPro = subscription?.plan === "pro";

  let query = supabase
    .from("calendar_events")
    .select("*")
    .gte("event_date", dateFrom)
    .lte("event_date", dateTo)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true, nullsFirst: false });

  if (currency && currency !== "all") query = query.eq("currency", currency);
  if (!isPro) query = query.eq("impact", "high");
  else if (requestedImpact && requestedImpact !== "all") query = query.eq("impact", requestedImpact);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Unable to load calendar" }, { status: 500 });

  const events = (data ?? []) as CalendarEvent[];
  const lastUpdated = events.reduce<string | null>((latest, event) => {
    if (!event.updated_at) return latest;
    return !latest || event.updated_at > latest ? event.updated_at : latest;
  }, null);

  return NextResponse.json({
    events: groupByDate(events),
    flatEvents: events,
    lastUpdated,
    notice: events.length ? null : `No cached events found for ${dateFrom === todayIso() ? "today" : "this range"}.`,
    tier: isPro ? "pro" : "free",
    dateFrom,
    dateTo,
    tomorrow: format(addDays(new Date(), 1), "yyyy-MM-dd"),
  });
}
