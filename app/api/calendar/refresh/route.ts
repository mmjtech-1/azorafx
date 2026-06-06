import { NextResponse, type NextRequest } from "next/server";
import { fetchForexFactoryCalendar } from "@/lib/calendar-fetch";
import { createAdminClient } from "@/lib/supabase/admin";

function hasCronSecret(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("x-cron-secret") === secret || request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
  if (!hasCronSecret(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Missing service role configuration" }, { status: 500 });

  const events = await fetchForexFactoryCalendar();
  if (!events.length) return NextResponse.json({ count: 0, updatedAt: new Date().toISOString() });

  const { error } = await supabase
    .from("calendar_events")
    .upsert(
      events.map((event) => ({ ...event, updated_at: new Date().toISOString() })),
      { onConflict: "event_date,currency,event_name,event_time" },
    );

  if (error) return NextResponse.json({ error: "Calendar refresh failed" }, { status: 500 });
  return NextResponse.json({ count: events.length, updatedAt: new Date().toISOString() });
}

