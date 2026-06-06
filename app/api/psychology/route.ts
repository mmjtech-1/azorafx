import { NextResponse, type NextRequest } from "next/server";
import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { psychologyLogSchema } from "@/types/psychology";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("psychology_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("log_date", subDays(new Date(), 30).toISOString().slice(0, 10))
    .order("log_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = psychologyLogSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const payload = {
    ...parsed.data,
    user_id: user.id,
    log_date: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("psychology_logs")
    .upsert(payload, { onConflict: "user_id,log_date" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data });
}
