"use client";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { BarChart3, Download, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { emotionLabel } from "@/components/journal/EmotionPicker";
import { TradeDetailDrawer } from "@/components/journal/TradeDetailDrawer";
import { useDeleteTrade, useTradesList, type TradeFilters } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types/trades";

const labelClass = "text-[11px] font-semibold uppercase tracking-[0.6px] text-foreground-tertiary";
const inputClass =
  "h-10 rounded-[10px] border border-border bg-[#141820] px-3 text-sm text-foreground-primary outline-none focus:border-[#00D68F]";

function money(value?: number | string | null) {
  const amount = Number(value ?? 0);
  return `${amount >= 0 ? "+" : "-"}$${Math.abs(amount).toLocaleString("en-US")}`;
}

export function TradeHistoryTable() {
  const [filters, setFilters] = useState<TradeFilters>({ page: 1, limit: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selected, setSelected] = useState<Trade | null>(null);
  const tradesQuery = useTradesList(filters);
  const deleteTrade = useDeleteTrade();

  const columns = useMemo<ColumnDef<Trade>[]>(
    () => [
      {
        accessorKey: "opened_at",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.opened_at), "MMM d, HH:mm"),
      },
      { accessorKey: "pair", header: "Pair" },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-semibold uppercase",
              row.original.direction === "long" ? "bg-accent-subtle text-accent" : "bg-loss/10 text-loss",
            )}
          >
            {row.original.direction}
          </span>
        ),
      },
      { accessorKey: "setup_type", header: "Setup" },
      {
        accessorKey: "pre_emotion",
        header: "Emotion",
        cell: ({ row }) => {
          const emotion = emotionLabel(row.original.pre_emotion);
          return emotion ? `${emotion.emoji} ${emotion.label}` : "-";
        },
      },
      {
        accessorKey: "risk_reward",
        header: "R:R",
        cell: ({ row }) => (row.original.risk_reward ? `1:${Number(row.original.risk_reward).toFixed(1)}` : "-"),
      },
      {
        accessorKey: "outcome",
        header: "Outcome",
        cell: ({ row }) => (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-semibold uppercase",
              row.original.outcome === "win" && "bg-accent-subtle text-accent",
              row.original.outcome === "loss" && "bg-loss/10 text-loss",
              row.original.outcome !== "win" && row.original.outcome !== "loss" && "bg-background-tertiary text-foreground-secondary",
            )}
          >
            {row.original.outcome === "breakeven" ? "BE" : row.original.outcome}
          </span>
        ),
      },
      {
        accessorKey: "pnl",
        header: "P&L",
        cell: ({ row }) => (
          <span className={Number(row.original.pnl ?? 0) >= 0 ? "font-semibold text-accent" : "font-semibold text-loss"}>
            {money(row.original.pnl)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button className="text-xs text-accent" type="button" onClick={() => setSelected(row.original)}>
              Edit
            </button>
            <Link className="text-foreground-secondary hover:text-accent" href="/dashboard/ai-review" title="AI Review">
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              className="text-loss"
              type="button"
              onClick={() => {
                if (window.confirm("Delete this trade?")) deleteTrade.mutate(row.original.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [deleteTrade],
  );

  const table = useReactTable({
    data: tradesQuery.data?.trades ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  return (
    <MotionWrapper>
      <section className="rounded-[16px] border border-border bg-background-secondary">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground-primary">Trade History</h2>
            <p className="text-sm text-foreground-secondary">Filter, sort, export, and review your journal.</p>
          </div>
          <a
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border px-3 text-sm text-foreground-secondary hover:border-border-accent hover:text-accent"
            href="/api/trades/export"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>

        <div className="grid gap-3 border-b border-border p-5 md:grid-cols-3 xl:grid-cols-6">
          <label>
            <span className={labelClass}>Date From</span>
            <input className={`${inputClass} mt-2 w-full`} type="date" onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined, page: 1 }))} />
          </label>
          <label>
            <span className={labelClass}>Date To</span>
            <input className={`${inputClass} mt-2 w-full`} type="date" onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value || undefined, page: 1 }))} />
          </label>
          <label>
            <span className={labelClass}>Pairs</span>
            <input className={`${inputClass} mt-2 w-full`} placeholder="EURUSD,XAUUSD" onChange={(e) => setFilters((f) => ({ ...f, pair: e.target.value ? e.target.value.split(",").map((v) => v.trim().toUpperCase()) : undefined, page: 1 }))} />
          </label>
          {[
            ["outcome", "Outcome", ["", "open", "win", "loss", "breakeven"]],
            ["session", "Session", ["", "asian", "london", "new_york", "overlap", "pre_market"]],
            ["setup", "Setup", ["", "ema_crossover", "structure_break", "ob_retest", "news_trade", "supply_demand", "fib_retracement", "trendline_break", "other"]],
          ].map(([key, label, options]) => (
            <label key={key as string}>
              <span className={labelClass}>{label as string}</span>
              <select className={`${inputClass} mt-2 w-full`} onChange={(e) => setFilters((f) => ({ ...f, [key as string]: e.target.value || undefined, page: 1 }))}>
                {(options as string[]).map((option) => (
                  <option key={option} value={option}>
                    {option || "All"}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {tradesQuery.isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-background-tertiary" />
            ))}
          </div>
        ) : table.getRowModel().rows.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="text-xs uppercase text-foreground-tertiary">
                  {table.getHeaderGroups().map((group) => (
                    <tr key={group.id} className="border-b border-border">
                      {group.headers.map((header) => (
                        <th
                          key={header.id}
                          className="cursor-pointer px-5 py-3 font-semibold"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-background-hover">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-5 py-4 text-foreground-secondary">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-border p-4 text-sm text-foreground-secondary">
              <button className="rounded-[8px] border border-border px-3 py-2" type="button" onClick={() => setFilters((f) => ({ ...f, page: Math.max((f.page ?? 1) - 1, 1) }))}>
                Previous
              </button>
              <span>
                Page {tradesQuery.data?.page ?? 1} of {tradesQuery.data?.totalPages ?? 1}
              </span>
              <button className="rounded-[8px] border border-border px-3 py-2" type="button" onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}>
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-foreground-tertiary" />
            <p className="mt-3 text-lg font-semibold text-foreground-primary">No trades yet.</p>
            <p className="mt-1 text-sm text-foreground-secondary">Log your first trade to get started.</p>
          </div>
        )}
      </section>
      <TradeDetailDrawer trade={selected} onClose={() => setSelected(null)} />
    </MotionWrapper>
  );
}

function MotionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="contents"
    >
      {children}
    </motion.div>
  );
}
