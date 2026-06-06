"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Signal } from "@/types/signals";

function price(value: number | null) {
  if (!value) return "-";
  return value > 100 ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : value.toFixed(5);
}

function statusClass(status: string) {
  if (status === "active") return "bg-accent-subtle text-accent";
  if (status === "hit_tp") return "bg-info/10 text-info";
  if (status === "hit_sl") return "bg-loss/10 text-loss";
  return "bg-background-tertiary text-foreground-secondary";
}

export function SignalHistory({ signals }: { signals: Signal[] }) {
  return (
    <section className="rounded-[16px] border border-border bg-background-secondary">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold">Signal History</h2>
        <p className="text-sm text-foreground-secondary">Last 50 generated setups</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="text-xs uppercase text-foreground-tertiary">
            <tr className="border-b border-border">
              {["Date", "Pair", "Direction", "Entry", "SL", "TP", "Confidence", "Status", "Result"].map((label) => (
                <th key={label} className="px-5 py-3">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {signals.slice(0, 50).map((signal) => (
              <tr key={`${signal.id}-${signal.generated_at}`} className="border-b border-border last:border-b-0">
                <td className="px-5 py-4 text-foreground-secondary">{format(new Date(signal.generated_at), "MMM d, HH:mm")}</td>
                <td className="px-5 py-4 font-semibold">{signal.pair}</td>
                <td className={cn("px-5 py-4 font-semibold uppercase", signal.direction === "buy" ? "text-accent" : "text-loss")}>{signal.direction}</td>
                <td className="px-5 py-4 text-foreground-secondary">{price(signal.entry_price)}</td>
                <td className="px-5 py-4 text-foreground-secondary">{price(signal.stop_loss)}</td>
                <td className="px-5 py-4 text-foreground-secondary">{price(signal.take_profit)}</td>
                <td className="px-5 py-4">{Math.round(signal.confidence_score ?? 0)}%</td>
                <td className="px-5 py-4">
                  <span className={cn("rounded-full px-2 py-1 text-xs font-semibold uppercase", statusClass(signal.status))}>
                    {signal.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4 text-foreground-secondary">
                  {signal.status === "hit_tp" ? "Profit" : signal.status === "hit_sl" ? "Loss" : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
