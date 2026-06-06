import type { PriceData, Signal, SignalConfig } from "@/types/signals";

export function calculateEMA(prices: number[], period: number): number[] {
  if (!prices.length) return [];
  const multiplier = 2 / (period + 1);
  const ema: number[] = [prices[0]];

  for (let index = 1; index < prices.length; index += 1) {
    ema.push((prices[index] - ema[index - 1]) * multiplier + ema[index - 1]);
  }

  return ema;
}

export function calculateRSI(prices: number[], period: number): number {
  if (prices.length <= period) return 50;
  let gains = 0;
  let losses = 0;

  for (let index = prices.length - period; index < prices.length; index += 1) {
    const change = prices[index] - prices[index - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  if (!losses) return 100;
  const rs = gains / period / (losses / period);
  return 100 - 100 / (1 + rs);
}

export function calculateADX(highs: number[], lows: number[], closes: number[], period: number): number {
  if (highs.length <= period + 1 || lows.length <= period + 1 || closes.length <= period + 1) return 0;
  const dxValues: number[] = [];

  for (let index = highs.length - period; index < highs.length; index += 1) {
    const upMove = highs[index] - highs[index - 1];
    const downMove = lows[index - 1] - lows[index];
    const plusDM = upMove > downMove && upMove > 0 ? upMove : 0;
    const minusDM = downMove > upMove && downMove > 0 ? downMove : 0;
    const trueRange = Math.max(
      highs[index] - lows[index],
      Math.abs(highs[index] - closes[index - 1]),
      Math.abs(lows[index] - closes[index - 1]),
    );
    const plusDI = trueRange ? (plusDM / trueRange) * 100 : 0;
    const minusDI = trueRange ? (minusDM / trueRange) * 100 : 0;
    const dx = plusDI + minusDI ? (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100 : 0;
    dxValues.push(dx);
  }

  return dxValues.reduce((sum, value) => sum + value, 0) / dxValues.length;
}

export function generateSignal(config: SignalConfig, priceData: PriceData, pair = "BTCUSD"): Signal | null {
  const closes = priceData.closes;
  if (closes.length < Math.max(config.ema_trend, config.ema_slow) + 2) return null;

  const fast = calculateEMA(closes, config.ema_fast);
  const slow = calculateEMA(closes, config.ema_slow);
  const trend = calculateEMA(closes, config.ema_trend);
  const rsi = calculateRSI(closes, config.rsi_period);
  const adx = calculateADX(priceData.highs, priceData.lows, closes, config.rsi_period);
  const last = closes.length - 1;
  const previous = closes.length - 2;
  const entry = closes[last];
  const crossedUp = fast[previous] <= slow[previous] && fast[last] > slow[last];
  const crossedDown = fast[previous] >= slow[previous] && fast[last] < slow[last];
  const bullishTrend = entry > trend[last];
  const bearishTrend = entry < trend[last];
  const rsiOk = rsi < config.rsi_overbought && rsi > config.rsi_oversold;
  const adxOk = adx >= config.adx_min;
  const direction = crossedUp && bullishTrend ? "buy" : crossedDown && bearishTrend ? "sell" : null;

  if (!direction || !rsiOk || !adxOk) return null;

  const conditionScore = [crossedUp || crossedDown, bullishTrend || bearishTrend, rsiOk, adxOk].filter(Boolean).length;
  const confidence = Math.min(100, 55 + conditionScore * 10 + Math.min(adx, 25));
  const risk = entry * 0.003;
  const reward = risk * 2.2;

  return {
    id: crypto.randomUUID(),
    pair,
    direction,
    timeframe: config.signal_timeframe,
    entry_price: entry,
    stop_loss: direction === "buy" ? entry - risk : entry + risk,
    take_profit: direction === "buy" ? entry + reward : entry - reward,
    confidence_score: Number(confidence.toFixed(2)),
    ema_fast_val: Number(fast[last].toFixed(6)),
    ema_slow_val: Number(slow[last].toFixed(6)),
    rsi_val: Number(rsi.toFixed(2)),
    adx_val: Number(adx.toFixed(2)),
    trend_direction: bullishTrend ? "bullish" : bearishTrend ? "bearish" : "ranging",
    status: "active",
    generated_at: new Date().toISOString(),
  };
}
