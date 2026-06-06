"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SectionShell } from "@/components/analytics/SectionShell";
import type { AnalyticsStats } from "@/hooks/useAnalytics";

type Row = AnalyticsStats["pairPerformance"][number];

function money(value: number) {
  return `${value >= 0 ? "+" : "-"}$${Math.abs(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function winClass(rate: number) {
  if (rate > 60) return "text-accent";
  if (rate >= 40) return "text-warning";
  return "text-loss";
}

export function PairPerformanceTable({ data }: { data: AnalyticsStats["pairPerformance"] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "pair", header: "Pair" },
      { accessorKey: "trades", header: "Trades" },
      {
        accessorKey: "winRate",
        header: "Win Rate",
        cell: ({ row }) => <span className={winClass(row.original.winRate)}>{row.original.winRate.toFixed(1)}%</span>,
      },
      { accessorKey: "avgRiskReward", header: "Avg R:R", cell: ({ row }) => `1:${row.original.avgRiskReward.toFixed(1)}` },
      {
        accessorKey: "totalPnl",
        header: "Total P&L",
        cell: ({ row }) => <span className={row.original.totalPnl >= 0 ? "text-accent" : "text-loss"}>{money(row.original.totalPnl)}</span>,
      },
      { accessorKey: "bestTrade", header: "Best Trade", cell: ({ row }) => money(row.original.bestTrade) },
      { accessorKey: "worstTrade", header: "Worst Trade", cell: ({ row }) => money(row.original.worstTrade) },
      { accessorKey: "profitFactor", header: "Profit Factor", cell: ({ row }) => row.original.profitFactor.toFixed(2) },
    ],
    [],
  );
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <SectionShell title="Performance by Pair" className="col-span-full">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase text-foreground-tertiary">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-border">
                {group.headers.map((header) => (
                  <th key={header.id} className="cursor-pointer px-4 py-3" onClick={header.column.getToggleSortingHandler()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-foreground-secondary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
