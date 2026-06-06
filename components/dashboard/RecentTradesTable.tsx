"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toNumber } from "@/components/dashboard/dashboard-utils";
import type { DashboardTrade } from "@/components/dashboard/types";

type RecentTradesTableProps = {
  trades: DashboardTrade[];
  isLoading: boolean;
};

function formatPrice(value: number | string | null) {
  const price = toNumber(value);
  return price >= 100 ? price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : price.toFixed(4);
}

export function RecentTradesTable({ trades, isLoading }: RecentTradesTableProps) {
  const rows = trades.slice(0, 10);

  return (
    <section className="rounded-[16px] border border-border bg-background-secondary">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground-primary">Recent Trades</h2>
          <p className="text-sm text-foreground-secondary">Last 10 trades from your journal</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-background-tertiary" />
          ))}
        </div>
      ) : rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-foreground-tertiary">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Pair</th>
                <th className="px-5 py-3 font-semibold">Direction</th>
                <th className="px-5 py-3 font-semibold">Entry</th>
                <th className="px-5 py-3 font-semibold">Exit</th>
                <th className="px-5 py-3 font-semibold">R:R</th>
                <th className="px-5 py-3 font-semibold">Result</th>
                <th className="px-5 py-3 font-semibold">P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((trade) => {
                const pnl = toNumber(trade.pnl);
                const isWin = trade.outcome === "win";
                const isLoss = trade.outcome === "loss";

                return (
                  <tr
                    key={trade.id}
                    className="cursor-pointer border-b border-border last:border-b-0 transition hover:bg-background-hover"
                  >
                    <td className="px-5 py-4 text-foreground-secondary">
                      {format(new Date(trade.opened_at), "MMM d")}
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground-primary">{trade.pair}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold uppercase",
                          trade.direction === "long" ? "bg-accent-subtle text-accent" : "bg-loss/10 text-loss",
                        )}
                      >
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-foreground-secondary">{formatPrice(trade.entry_price)}</td>
                    <td className="px-5 py-4 text-foreground-secondary">
                      {trade.exit_price ? formatPrice(trade.exit_price) : "-"}
                    </td>
                    <td className="px-5 py-4 text-foreground-secondary">
                      {toNumber(trade.risk_reward) ? `1:${toNumber(trade.risk_reward).toFixed(1)}` : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold uppercase",
                          isWin && "bg-accent-subtle text-accent",
                          isLoss && "bg-loss/10 text-loss",
                          !isWin && !isLoss && "bg-background-tertiary text-foreground-secondary",
                        )}
                      >
                        {trade.outcome === "breakeven" ? "BE" : trade.outcome}
                      </span>
                    </td>
                    <td className={cn("px-5 py-4 font-semibold", pnl >= 0 ? "text-accent" : "text-loss")}>
                      {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toLocaleString("en-US")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-12 text-center">
          <p className="text-base font-semibold text-foreground-primary">No trades logged yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-secondary">
            Your first EURUSD, XAUUSD, or BTCUSD trade will appear here with direction, R:R,
            result, and P&amp;L.
          </p>
        </div>
      )}
    </section>
  );
}
