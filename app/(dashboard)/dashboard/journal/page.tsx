"use client";

import { TradeHistoryTable } from "@/components/journal/TradeHistoryTable";
import { TradeLogForm } from "@/components/journal/TradeLogForm";
import { useTradesList } from "@/hooks/useTrades";

export default function JournalPage() {
  const month = new Date().toISOString().slice(0, 7);
  const tradesThisMonth = useTradesList({
    dateFrom: `${month}-01`,
    limit: 1,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground-primary">Trade Journal</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Log trade context, review execution quality, and build repeatable feedback loops.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(360px,40%)_minmax(0,60%)]">
        <TradeLogForm tradesThisMonth={tradesThisMonth.data?.total ?? 0} />
        <TradeHistoryTable />
      </div>
    </div>
  );
}
