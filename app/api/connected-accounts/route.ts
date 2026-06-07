import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const publicColumns = "id,broker,account_type,nickname,account_balance,account_currency,account_leverage,broker_account_id,sync_status,last_synced_at,last_error,total_trades_synced,is_primary,created_at";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase
    .from("connected_accounts")
    .select(publicColumns)
    .eq("user_id", user.id)
    .neq("sync_status", "disconnected")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accounts: data ?? [] });
}

