import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { challengeUpdateSchema } from "@/types/challenges";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: challenge, error } = await supabase.from("challenges").select("*").eq("user_id", user.id).eq("id", params.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load challenge" }, { status: 500 });
  if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: snapshots } = await supabase
    .from("challenge_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .eq("challenge_id", params.id)
    .order("snapshot_date", { ascending: true });

  return NextResponse.json({ challenge: { ...challenge, snapshots: snapshots ?? [], latest_snapshot: snapshots?.at(-1) ?? null } });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = challengeUpdateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { data: existing } = await supabase.from("challenges").select("*").eq("user_id", user.id).eq("id", params.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentBalance = parsed.data.current_balance ?? existing.current_balance;
  const highestBalance = Math.max(Number(existing.highest_balance ?? existing.account_size), Number(currentBalance ?? existing.account_size));
  const { data, error } = await supabase
    .from("challenges")
    .update({
      ...parsed.data,
      highest_balance: highestBalance,
      current_pnl: Number(currentBalance ?? existing.account_size) - Number(existing.account_size),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: "Unable to update challenge" }, { status: 500 });
  return NextResponse.json({ challenge: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await supabase.from("challenges").delete().eq("user_id", user.id).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Unable to delete challenge" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

