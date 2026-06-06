import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultSignalConfig } from "@/types/signals";
import { mockSignals } from "@/app/api/signals/mock";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: config } = await supabase.from("signal_configs").select("*").eq("user_id", user.id).maybeSingle();
  const { data } = await supabase
    .from("signals")
    .select("*")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(50);

  const latestByPair = new Map<string, unknown>();
  for (const signal of data ?? []) {
    if (!latestByPair.has(signal.pair)) latestByPair.set(signal.pair, signal);
  }

  const signals = latestByPair.size ? Array.from(latestByPair.values()) : mockSignals(config ?? defaultSignalConfig, user.id);
  return NextResponse.json({ signals, history: data?.length ? data : signals, updatedAt: new Date().toISOString() });
}
