"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Lock } from "lucide-react";
import { IndicatorBadge } from "@/components/signals/IndicatorBadge";
import { cn } from "@/lib/utils";
import type { Signal } from "@/types/signals";

function rr(signal: Signal) {
  if (!signal.entry_price || !signal.stop_loss || !signal.take_profit) return "-";
  const risk = Math.abs(signal.entry_price - signal.stop_loss);
  const reward = Math.abs(signal.take_profit - signal.entry_price);
  return risk ? `1:${(reward / risk).toFixed(2)}` : "-";
}

function price(value: number | null) {
  if (!value) return "-";
  return value > 100 ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : value.toFixed(5);
}

export function SignalCard({
  signal,
  locked,
  onIgnore,
}: {
  signal: Signal;
  locked?: boolean;
  onIgnore: () => void;
}) {
  const directionClass =
    signal.direction === "buy" ? "bg-accent-subtle text-accent" : "bg-loss/10 text-loss";
  const trendClass =
    signal.trend_direction === "bullish"
      ? "bg-accent-subtle text-accent"
      : signal.trend_direction === "bearish"
        ? "bg-loss/10 text-loss"
        : "bg-background-tertiary text-foreground-secondary";
  const confidence = Math.round(signal.confidence_score ?? 0);

  return (
    <article className="relative overflow-hidden rounded-[16px] border border-border bg-background-secondary p-5">
      <div className={cn(locked && "pointer-events-none blur-sm")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-semibold text-foreground-primary">{signal.pair}</h3>
            <p className="mt-1 text-xs text-foreground-secondary">
              Generated {formatDistanceToNow(new Date(signal.generated_at), { addSuffix: true })}
            </p>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold", directionClass)}>
            {signal.reason_no_signal ? "NO SETUP" : signal.direction.toUpperCase()}
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-secondary">Confidence</span>
            <span className="font-semibold text-foreground-primary">{confidence}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-background-tertiary">
            <div className="h-full rounded-full bg-accent" style={{ width: `${confidence}%` }} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-3 text-sm">
          <div><p className="text-foreground-tertiary">Entry</p><p className="font-semibold">{price(signal.entry_price)}</p></div>
          <div><p className="text-foreground-tertiary">SL</p><p className="font-semibold">{price(signal.stop_loss)}</p></div>
          <div><p className="text-foreground-tertiary">TP</p><p className="font-semibold">{price(signal.take_profit)}</p></div>
          <div><p className="text-foreground-tertiary">R:R</p><p className="font-semibold">{rr(signal)}</p></div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <IndicatorBadge name="EMA20" value={signal.ema_fast_val} pass={(signal.ema_fast_val ?? 0) > 0} />
          <IndicatorBadge name="EMA50" value={signal.ema_slow_val} pass={(signal.ema_slow_val ?? 0) > 0} />
          <IndicatorBadge name="RSI" value={signal.rsi_val} pass={(signal.rsi_val ?? 0) > 30 && (signal.rsi_val ?? 0) < 70} />
          <IndicatorBadge name="ADX" value={signal.adx_val} pass={(signal.adx_val ?? 0) >= 10} />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold", trendClass)}>
            {signal.trend_direction.toUpperCase()}
          </span>
          <div className="flex gap-2">
            <Link
              className="inline-flex h-9 items-center gap-1 rounded-[10px] bg-accent px-3 text-sm font-semibold text-black"
              href={`/dashboard/journal?pair=${signal.pair}&direction=${signal.direction === "buy" ? "long" : "short"}&entry=${signal.entry_price ?? ""}&sl=${signal.stop_loss ?? ""}&tp=${signal.take_profit ?? ""}`}
            >
              Take Trade <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="h-9 rounded-[10px] border border-border px-3 text-sm text-foreground-secondary" type="button" onClick={onIgnore}>
              Ignore
            </button>
          </div>
        </div>
      </div>

      {locked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080B11]/60 text-center">
          <Lock className="h-6 w-6 text-accent" />
          <p className="mt-2 text-sm font-semibold text-foreground-primary">Upgrade to Pro</p>
          <p className="text-xs text-foreground-secondary">Unlock all monitored pairs.</p>
        </div>
      ) : null}
    </article>
  );
}
