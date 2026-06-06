"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarFilters } from "@/types/calendar";

const impacts = [
  { value: "all", label: "All" },
  { value: "high", label: "High", dot: "bg-[#FF4757]" },
  { value: "medium", label: "Medium", dot: "bg-amber-400" },
  { value: "low", label: "Low", dot: "bg-[#00D68F]" },
] as const;

const currencies = ["all", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];
const ranges = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "thisWeek", label: "This Week" },
  { value: "nextWeek", label: "Next Week" },
] as const;

export function CalendarFilters({
  filters,
  onChange,
  isFree,
}: {
  filters: CalendarFilters;
  onChange: (filters: CalendarFilters) => void;
  isFree: boolean;
}) {
  return (
    <section className="space-y-4 rounded-[16px] border border-border bg-background-secondary p-4">
      <div className="flex flex-wrap items-center gap-2">
        {impacts.map((impact) => {
          const locked = isFree && (impact.value === "medium" || impact.value === "low" || impact.value === "all");
          return (
            <button
              key={impact.value}
              type="button"
              title={locked ? "Pro only" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm text-foreground-secondary transition",
                filters.impact === impact.value && "border-[#00D68F]/40 bg-[#00D68F]/10 text-[#00D68F]",
                locked && "cursor-not-allowed opacity-50",
              )}
              onClick={() => !locked && onChange({ ...filters, impact: impact.value })}
            >
              {"dot" in impact ? <span className={cn("h-2 w-2 rounded-full", impact.dot)} /> : null}
              {impact.label}
              {locked ? <Lock className="h-3.5 w-3.5" /> : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {currencies.map((currency) => (
          <button
            key={currency}
            type="button"
            className={cn(
              "h-8 rounded-full border border-border px-3 text-xs font-semibold uppercase text-foreground-secondary transition",
              filters.currency === currency && "border-[#00D68F]/40 bg-[#00D68F]/10 text-[#00D68F]",
            )}
            onClick={() => onChange({ ...filters, currency })}
          >
            {currency === "all" ? "All" : currency}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {ranges.map((range) => (
          <button
            key={range.value}
            type="button"
            className={cn(
              "h-9 rounded-xl border border-border px-4 text-sm text-foreground-secondary transition",
              filters.range === range.value && "border-[#00D68F]/40 bg-[#00D68F]/10 text-[#00D68F]",
            )}
            onClick={() => onChange({ ...filters, range: range.value })}
          >
            {range.label}
          </button>
        ))}
      </div>
    </section>
  );
}

