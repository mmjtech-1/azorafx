import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { challengeInputSchema } from "@/types/challenges";

function addDays(date: string, days?: number | null) {
  if (!days) return null;
  const base = new Date(`${date}T00:00:00`);
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("*, challenge_snapshots(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load challenges" }, { status: 500 });
  const normalized = (challenges ?? []).map((challenge) => {
    const snapshots = [...(challenge.challenge_snapshots ?? [])].sort((a, b) => String(b.snapshot_date).localeCompare(String(a.snapshot_date)));
    const { challenge_snapshots: _snapshots, ...rest } = challenge;
    return { ...rest, latest_snapshot: snapshots[0] ?? null };
  });

  return NextResponse.json({ challenges: normalized });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = challengeInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const [{ count }, { data: subscription }] = await Promise.all([
    supabase.from("challenges").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
  ]);
  if (subscription?.plan !== "pro" && (count ?? 0) >= 1) {
    return NextResponse.json({ error: "Free plan allows one challenge" }, { status: 402 });
  }

  const input = parsed.data;
  const startedAt = input.started_at ?? new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      ...input,
      user_id: user.id,
      started_at: startedAt,
      deadline_date: addDays(startedAt, input.max_trading_days),
      current_balance: input.account_size,
      highest_balance: input.account_size,
      current_pnl: 0,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "Unable to create challenge" }, { status: 500 });
  return NextResponse.json({ challenge: data });
}

