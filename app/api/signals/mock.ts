import type { Signal, SignalConfig } from "@/types/signals";

export function mockSignals(config: SignalConfig, userId?: string): Signal[] {
  const now = new Date();
  return config.monitored_pairs.map((pair, index) => {
    const direction = index % 3 === 1 ? "sell" : "buy";
    const base = pair.includes("JPY") ? 156.24 : pair === "XAUUSD" ? 2318.4 : pair === "BTCUSD" ? 67210 : 1.0834;
    const risk = base * (pair === "BTCUSD" ? 0.008 : 0.003);
    return {
      id: `mock-${pair}`,
      user_id: userId,
      pair,
      direction,
      timeframe: config.signal_timeframe,
      entry_price: base,
      stop_loss: direction === "buy" ? base - risk : base + risk,
      take_profit: direction === "buy" ? base + risk * 2.4 : base - risk * 2.4,
      confidence_score: 82 - index * 4,
      ema_fast_val: base * 0.999,
      ema_slow_val: base * 0.997,
      rsi_val: 52 + index,
      adx_val: 21 + index,
      trend_direction: direction === "buy" ? "bullish" : "bearish",
      status: "active",
      generated_at: new Date(now.getTime() - index * 7 * 60_000).toISOString(),
    };
  });
}
