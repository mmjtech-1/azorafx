"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2, ChevronDown, Copy, Lightbulb, RefreshCw, TriangleAlert } from "lucide-react";
import { ScoreGauge } from "@/components/ai-review/ScoreGauge";
import type { TradeReview } from "@/types/ai-review";

function num(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function Section({
  title,
  items,
  paragraph,
  tone,
}: {
  title: string;
  items?: string[] | null;
  paragraph?: string | null;
  tone: "green" | "amber" | "blue" | "purple";
}) {
  const [open, setOpen] = useState(true);
  const border = {
    green: "border-accent",
    amber: "border-warning",
    blue: "border-info",
    purple: "border-purple-400",
  }[tone];
  return (
    <div className={`rounded-[12px] border-l-2 ${border} bg-background-tertiary p-4`}>
      <button className="flex w-full items-center justify-between text-left font-semibold" type="button" onClick={() => setOpen((v) => !v)}>
        {title}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        items?.length ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground-secondary">
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-6 text-foreground-secondary">{paragraph}</p>
        )
      ) : null}
    </div>
  );
}

export function ReviewResultCard({ review, onNew }: { review: TradeReview; onNew?: () => void }) {
  const overall = num(review.overall_score);
  const color = overall >= 7 ? "#00D68F" : overall >= 4 ? "#FFA502" : "#FF4757";
  const scores = [
    ["Setup Quality", num(review.setup_score)],
    ["Risk Management", num(review.risk_management_score)],
    ["Entry Timing", num(review.entry_timing_score)],
    ["Discipline", num(review.discipline_score)],
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[16px] border border-border bg-background-secondary p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground-primary">{review.pair} {review.direction}</h2>
          <p className="text-sm text-foreground-secondary">Reviewed {format(new Date(review.created_at), "MMM d, yyyy HH:mm")}</p>
          <p className="mt-3 italic text-foreground-secondary">{review.verdict}</p>
        </div>
        <div className="text-center">
          <ScoreGauge score={overall} color={color} />
          <p className="mt-1 text-sm font-semibold" style={{ color }}>{overall.toFixed(1)}/10</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {scores.map(([label, value]) => (
          <div key={label} className="rounded-[10px] border border-border bg-background-tertiary p-3">
            <p className="text-xs text-foreground-secondary">{label}</p>
            <p className="mt-2 text-lg font-semibold">{Number(value).toFixed(1)}</p>
            <div className="mt-2 h-1.5 rounded-full bg-[#141820]">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Number(value) * 10}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <Section title="✅ Strengths" items={review.strengths} tone="green" />
        <Section title="⚠️ Improvements" items={review.improvements} tone="amber" />
        <Section title="💡 Alternative Approach" paragraph={review.alternative_entry} tone="blue" />
        <Section title="📊 Market Context" paragraph={review.market_context} tone="purple" />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border px-3 text-sm text-foreground-secondary" type="button">
          <CheckCircle2 className="h-4 w-4" /> Save to Journal
        </button>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border px-3 text-sm text-foreground-secondary"
          type="button"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
        >
          <Copy className="h-4 w-4" /> Share
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-accent px-3 text-sm font-semibold text-black" type="button" onClick={onNew}>
          <RefreshCw className="h-4 w-4" /> New Review
        </button>
      </div>
    </motion.article>
  );
}
