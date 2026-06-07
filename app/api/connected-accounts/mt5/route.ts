import { NextResponse, type NextRequest } from "next/server";
import { encryptSecret } from "@/lib/encryption";
import { createClient } from "@/lib/supabase/server";
import { mt5ConnectSchema } from "@/types/connected-accounts";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = mt5ConnectSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const { count } = await supabase.from("connected_accounts").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  const { data, error } = await supabase
    .from("connected_accounts")
    .insert({
      user_id: user.id,
      broker: input.broker,
      account_type: "mt5",
      nickname: input.nickname || `${input.broker} MT5`,
      mt_login: input.mt_login,
      mt_password_encrypted: encryptSecret(input.mt_password),
      mt_server: input.mt_server,
      sync_status: "active",
      is_primary: (count ?? 0) === 0,
    })
    .select("id,broker,account_type,nickname,account_balance,account_currency,sync_status,last_synced_at,total_trades_synced,is_primary")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, account: data }, { status: 201 });
}

