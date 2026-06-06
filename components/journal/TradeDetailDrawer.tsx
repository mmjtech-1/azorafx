"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useUpdateTrade } from "@/hooks/useTrades";
import type { Trade } from "@/types/trades";

export function TradeDetailDrawer({
  trade,
  onClose,
}: {
  trade: Trade | null;
  onClose: () => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [outcome, setOutcome] = useState<"win" | "loss" | "breakeven">("win");
  const updateTrade = useUpdateTrade();

  if (!trade) return null;

  async function closeTrade() {
    if (!trade) return;
    await updateTrade.mutateAsync({
      id: trade.id,
      input: {
        exit_price: Number(exitPrice),
        outcome,
        closed_at: new Date().toISOString(),
      },
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <aside className="h-full w-full max-w-[480px] overflow-y-auto border-l border-border bg-[#0E1117] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground-primary">{trade.pair}</h2>
            <p className="text-sm uppercase text-foreground-secondary">{trade.direction}</p>
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground-secondary"
            type="button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {[
            ["Entry", trade.entry_price],
            ["Stop Loss", trade.stop_loss ?? "-"],
            ["Take Profit", trade.take_profit ?? "-"],
            ["Exit", trade.exit_price ?? "-"],
            ["R:R", trade.risk_reward ? `1:${Number(trade.risk_reward).toFixed(1)}` : "-"],
            ["P&L", trade.pnl ?? "-"],
            ["Setup", trade.setup_type],
            ["Outcome", trade.outcome],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[10px] border border-border bg-background-tertiary p-3">
              <p className="text-[11px] uppercase tracking-[0.6px] text-foreground-tertiary">{label}</p>
              <p className="mt-1 font-medium text-foreground-primary">{String(value)}</p>
            </div>
          ))}
        </div>

        {trade.screenshot_urls?.length ? (
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.6px] text-foreground-tertiary">Screenshots</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {trade.screenshot_urls.map((url) => (
                <img key={url} alt="Trade screenshot" className="rounded-[10px] border border-border" src={url} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-[10px] border border-border bg-background-tertiary p-4">
          <p className="font-semibold text-foreground-primary">AI Review</p>
          <p className="mt-2 text-sm text-foreground-secondary">No review result attached yet.</p>
          <Link className="mt-3 inline-flex text-sm font-medium text-accent" href="/dashboard/ai-review">
            Request AI Review
          </Link>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className="h-10 flex-1 rounded-[10px] border border-border text-sm text-foreground-secondary"
            type="button"
            onClick={() => setEditMode((current) => !current)}
          >
            {editMode ? "Cancel Edit" : "Edit Trade"}
          </button>
          {editMode ? (
            <button className="h-10 flex-1 rounded-[10px] bg-accent text-sm font-semibold text-black" type="button">
              Save
            </button>
          ) : null}
        </div>

        {trade.outcome === "open" ? (
          <div className="mt-6 rounded-[10px] border border-border bg-background-tertiary p-4">
            <p className="font-semibold text-foreground-primary">Close Trade</p>
            <input
              className="mt-3 h-10 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm outline-none focus:border-border-accent"
              type="number"
              value={exitPrice}
              onChange={(event) => setExitPrice(event.target.value)}
              placeholder="Exit price"
            />
            <select
              className="mt-3 h-10 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm outline-none focus:border-border-accent"
              value={outcome}
              onChange={(event) => setOutcome(event.target.value as typeof outcome)}
            >
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="breakeven">Breakeven</option>
            </select>
            <button
              className="mt-3 h-10 w-full rounded-[10px] bg-accent text-sm font-semibold text-black"
              type="button"
              onClick={closeTrade}
            >
              Save Close
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
