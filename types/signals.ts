export type SignalDirection = "buy" | "sell";
export type SignalStatus = "active" | "hit_tp" | "hit_sl" | "expired" | "cancelled";

export type SignalConfig = {
  id?: string;
  user_id?: string;
  ema_fast: number;
  ema_slow: number;
  ema_trend: number;
  trend_timeframe: string;
  signal_timeframe: string;
  rsi_period: number;
  rsi_overbought: number;
  rsi_oversold: number;
  adx_min: number;
  monitored_pairs: string[];
  leverage: number;
  risk_per_trade: number;
  is_active: boolean;
};

export type Signal = {
  id: string;
  user_id?: string;
  pair: string;
  direction: SignalDirection;
  timeframe: string;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  confidence_score: number | null;
  ema_fast_val: number | null;
  ema_slow_val: number | null;
  rsi_val: number | null;
  adx_val: number | null;
  trend_direction: "bullish" | "bearish" | "ranging";
  status: SignalStatus;
  reason_no_signal?: string | null;
  generated_at: string;
  expires_at?: string | null;
  closed_at?: string | null;
};

export type PriceData = {
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
};

export const defaultSignalConfig: SignalConfig = {
  ema_fast: 20,
  ema_slow: 50,
  ema_trend: 200,
  trend_timeframe: "4H",
  signal_timeframe: "15m",
  rsi_period: 14,
  rsi_overbought: 70,
  rsi_oversold: 30,
  adx_min: 10,
  monitored_pairs: ["EURUSD", "GBPUSD", "GBPJPY", "USDJPY", "XAUUSD", "BTCUSD"],
  leverage: 15,
  risk_per_trade: 1,
  is_active: true,
};
