"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { ReviewResultCard } from "@/components/ai-review/ReviewResultCard";
import type { TradeReview } from "@/types/ai-review";

function num(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export function ReviewHistory({ reviews, isLoading = false }: { reviews: TradeReview[]; isLoading?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pair, setPair] = useState("");
  const [minScore, setMinScore] = useState("");
  const [date, setDate] = useState("");
  const filtered = reviews.filter((review) => {
    if (pair && !review.pair.toLowerCase().includes(pair.toLowerCase())) return false;
    if (minScore && num(review.overall_score) < Number(minScore)) return false;
    if (date && !review.created_at.startsWith(date)) return false;
    return true;
  });
  const trend = useMemo(
    () => [...reviews].slice(0, 10).reverse().map((review, index) => ({ index, score: num(review.overall_score) })),
    [reviews],
  );

  return (
    <section className="rounded-[16px] border border-border bg-background-secondary p-5">
      <h2 className="text-lg font-semibold">Review History</h2>
      <div className="mt-4 h-24 rounded-[12px] bg-background-tertiary p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend}>
            <Tooltip contentStyle={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
            <Line type="monotone" dataKey="score" stroke="#00D68F" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <input className="h-9 rounded-[10px] border border-border bg-[#141820] px-3 text-sm outline-none" placeholder="Filter pair" value={pair} onChange={(e) => setPair(e.target.value)} />
        <input className="h-9 rounded-[10px] border border-border bg-[#141820] px-3 text-sm outline-none" placeholder="Min score" type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        <input className="h-9 rounded-[10px] border border-border bg-[#141820] px-3 text-sm outline-none" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="mt-4 space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-[12px] border border-border bg-background-tertiary" />
            ))
          : null}
        {filtered.map((review) => (
          <div key={review.id}>
            <button
              className="w-full rounded-[12px] border border-border bg-background-tertiary p-4 text-left transition hover:border-border-strong"
              type="button"
              onClick={() => setExpanded((current) => (current === review.id ? null : review.id))}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{review.pair} {review.direction}</p>
                  <p className="text-xs text-foreground-secondary">{format(new Date(review.created_at), "MMM d, yyyy")}</p>
                </div>
                <span className="rounded-full bg-accent-subtle px-2 py-1 text-xs font-bold text-accent">{num(review.overall_score).toFixed(1)}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-foreground-secondary">{review.verdict}</p>
            </button>
            {expanded === review.id ? <div className="mt-3"><ReviewResultCard review={review} /></div> : null}
          </div>
        ))}
        {!isLoading && filtered.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-white/10 bg-background-tertiary p-8 text-center text-sm text-foreground-secondary">
            No AI reviews yet. Submit your first trade to start building a coaching history.
          </div>
        ) : null}
      </div>
    </section>
  );
}
