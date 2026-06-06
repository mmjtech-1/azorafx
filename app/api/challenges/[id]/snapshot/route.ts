import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { snapshotInputSchema } from "@/types/challenges";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = snapshotInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: challenge } = await supabase.from("challenges").select("*").eq("user_id", user.id).eq("id", params.id).maybeSingle();
  if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const input = parsed.data;
  const snapshotDate = input.snapshot_date ?? new Date().toISOString().slice(0, 10);
  const balance = Number(challenge.current_balance ?? challenge.account_size) + input.daily_pnl;
  const highest = Math.max(Number(challenge.highest_balance ?? challenge.account_size), balance);
  const dailyLossUsed = Math.max(0, -input.daily_pnl);
  const drawdownUsed = Math.max(0, highest - balance);
  const dailyLimit = Number(challenge.daily_loss_limit_amount ?? 0);
  const drawdownLimit = Number(challenge.max_drawdown_amount ?? 0);
  const violated = dailyLossUsed >= dailyLimit || drawdownUsed >= drawdownLimit;
  const passed = balance - Number(challenge.account_size) >= Number(challenge.profit_target_amount ?? 0);
  const status = violated ? "failed" : passed ? "passed" : challenge.phase;

  const { error: snapshotError } = await supabase.from("challenge_snapshots").upsert(
    {
      challenge_id: params.id,
      user_id: user.id,
      snapshot_date: snapshotDate,
      balance,
      daily_pnl: input.daily_pnl,
      daily_loss_used: dailyLossUsed,
      drawdown_used: drawdownUsed,
      trades_count: input.trades_count ?? null,
    },
    { onConflict: "challenge_id,snapshot_date" },
  );
  if (snapshotError) return NextResponse.json({ error: "Unable to save snapshot" }, { status: 500 });

  const { data: updated, error } = await supabase
    .from("challenges")
    .update({
      current_balance: balance,
      current_pnl: balance - Number(challenge.account_size),
      highest_balance: highest,
      days_traded: Number(challenge.days_traded ?? 0) + 1,
      status,
      completed_at: status === "passed" || status === "failed" ? new Date().toISOString() : challenge.completed_at,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "Unable to update challenge" }, { status: 500 });
  return NextResponse.json({ challenge: updated });
}
