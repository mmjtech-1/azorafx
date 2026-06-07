import { NextResponse, type NextRequest } from "next/server";
import { encryptSecret } from "@/lib/encryption";
import { getAccountBalance } from "@/lib/sync-engine";
import { createClient } from "@/lib/supabase/server";
import { cryptoConnectSchema } from "@/types/connected-accounts";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = cryptoConnectSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  const encrypted = {
    api_key_encrypted: encryptSecret(input.api_key),
    api_secret_encrypted: encryptSecret(input.api_secret),
  };

  try {
    const balance = await getAccountBalance({
      id: "test",
      user_id: user.id,
      broker: input.broker,
      account_type: "crypto",
      ...encrypted,
      account_balance: 0,
      account_currency: "USD",
    });
    const { count } = await supabase.from("connected_accounts").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    const { data, error } = await supabase
      .from("connected_accounts")
      .insert({
        user_id: user.id,
        broker: input.broker,
        account_type: "crypto",
        nickname: input.nickname || `${input.broker} account`,
        ...encrypted,
        account_balance: balance.balance,
        account_currency: balance.currency,
        broker_account_id: balance.brokerAccountId,
        sync_status: "active",
        is_primary: (count ?? 0) === 0,
        last_synced_at: new Date().toISOString(),
      })
      .select("id,broker,account_type,nickname,account_balance,account_currency,sync_status,last_synced_at,total_trades_synced,is_primary")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, account: data, balance }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Connection test failed" }, { status: 400 });
  }
}

