import { NextResponse } from "next/server";
import { generateSignal } from "@/lib/indicators";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { defaultSignalConfig, type PriceData, type Signal, type SignalConfig } from "@/types/signals";
import { mockSignals } from "@/app/api/signals/mock";

const intervalMap: Record<string, string> = {
  "5m": "5m",
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  Daily: "1d",
};

const symbolMap: Record<string, string> = {
  BTCUSD: "BTCUSDT",
  ETHUSD: "ETHUSDT",
};

async function fetchKlines(pair: string, timeframe: string): Promise<PriceData | null> {
  const symbol = symbolMap[pair];
  if (!symbol) return null;

  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${intervalMap[timeframe] ?? "15m"}&limit=250`,
    { next: { revalidate: 60 } },
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as Array<Array<number | string>>;
  return {
    opens: rows.map((row) => Number(row[1])),
    highs: rows.map((row) => Number(row[2])),
    lows: rows.map((row) => Number(row[3])),
    closes: rows.map((row) => Number(row[4])),
  };
}

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: configData } = await supabase.from("signal_configs").select("*").eq("user_id", user.id).maybeSingle();
  const config = (configData ?? defaultSignalConfig) as SignalConfig;
  const generated: Signal[] = [];

  for (const pair of config.monitored_pairs) {
    try {
      const priceData = await fetchKlines(pair, config.signal_timeframe);
      const signal = priceData ? generateSignal(config, priceData, pair) : null;
      if (signal) generated.push({ ...signal, user_id: user.id });
    } catch {
      // Fall through to mock fallback.
    }
  }

  const signals = generated.length ? generated : mockSignals(config, user.id);
  const admin = createAdminClient();
  const writer = admin ?? supabase;
  await writer.from("signals").insert(
    signals.map((signal) => ({
      user_id: user.id,
      pair: signal.pair,
      direction: signal.direction,
      timeframe: signal.timeframe,
      entry_price: signal.entry_price,
      stop_loss: signal.stop_loss,
      take_profit: signal.take_profit,
      confidence_score: signal.confidence_score,
      ema_fast_val: signal.ema_fast_val,
      ema_slow_val: signal.ema_slow_val,
      rsi_val: signal.rsi_val,
      adx_val: signal.adx_val,
      trend_direction: signal.trend_direction,
      status: signal.status,
      generated_at: signal.generated_at,
    })),
  );

  return NextResponse.json({ signals, updatedAt: new Date().toISOString() });
}
