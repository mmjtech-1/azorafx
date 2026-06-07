import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncCryptoAccount } from "@/lib/sync-engine";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: account } = await supabase.from("connected_accounts").select("id,user_id").eq("id", params.id).eq("user_id", user.id).maybeSingle();
  if (!account) return NextResponse.json({ error: "Connected account not found" }, { status: 404 });
  try {
    const result = await syncCryptoAccount(supabase as any, params.id);
    return NextResponse.json({ success: true, synced: result.synced, balance: result.balance });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 });
  }
}

