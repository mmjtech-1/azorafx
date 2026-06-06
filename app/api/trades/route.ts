import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateRiskReward, tradeCreateSchema } from "@/types/trades";

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function monthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const page = Math.max(Number(params.get("page") ?? 1), 1);
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 20), 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("trades")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("opened_at", { ascending: false })
    .range(from, to);

  const filters = ["pair", "outcome", "session", "setup"] as const;
  for (const filter of filters) {
    const value = params.get(filter);
    if (!value) continue;

    const column = filter === "setup" ? "setup_type" : filter;
    query = value.includes(",") ? query.in(column, value.split(",")) : query.eq(column, value);
  }

  const dateFrom = params.get("dateFrom");
  const dateTo = params.get("dateTo");

  if (dateFrom) query = query.gte("opened_at", dateFrom);
  if (dateTo) query = query.lte("opened_at", dateTo);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    trades: data ?? [],
    total,
    page,
    limit,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = tradeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", user.id)
    .maybeSingle();

  const month = currentMonth();
  const { start, end } = monthRange();
  const { count: tradesThisMonth } = await supabase
    .from("trades")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("opened_at", start)
    .lt("opened_at", end);

  if (subscription?.plan !== "pro" && (tradesThisMonth ?? 0) >= 20) {
    return NextResponse.json({ error: "Free trade limit reached" }, { status: 402 });
  }

  const payload = {
    ...parsed.data,
    risk_reward: parsed.data.risk_reward ?? calculateRiskReward(parsed.data),
    user_id: user.id,
  };

  const { data: trade, error } = await supabase.from("trades").insert(payload).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("usage_logs").upsert(
    {
      user_id: user.id,
      month_year: month,
      trades_logged: (tradesThisMonth ?? 0) + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,month_year" },
  );

  return NextResponse.json({ trade }, { status: 201 });
}
