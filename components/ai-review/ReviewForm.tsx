"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Brain } from "lucide-react";
import { ThinkingLoader } from "@/components/ai-review/ThinkingLoader";
import { ReviewResultCard } from "@/components/ai-review/ReviewResultCard";
import { EmotionPicker } from "@/components/journal/EmotionPicker";
import { UpgradeModal } from "@/components/journal/UpgradeModal";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { useSubmitReview } from "@/hooks/useAIReview";
import { useTradesList } from "@/hooks/useTrades";
import { calculateRiskReward } from "@/types/trades";
import { reviewInputSchema, type ReviewInput, type TradeReview } from "@/types/ai-review";

const inputClass = "mt-2 h-10 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm outline-none focus:border-border-accent";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.6px] text-foreground-tertiary";

export function ReviewForm({
  usage,
  onReview,
}: {
  usage: { used: number; limit: number | null };
  onReview: (review: TradeReview) => void;
}) {
  const { subscription } = useDashboard();
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TradeReview | null>(null);
  const trades = useTradesList({ limit: 20 });
  const submitReview = useSubmitReview();
  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewInputSchema),
    defaultValues: {
      pair: "EURUSD",
      direction: "long",
      setup_type: "other",
      session: "london",
      pre_emotion: "focused",
      user_reasoning: "",
      market_context: "",
    },
  });
  const watched = form.watch();
  const rr = useMemo(
    () =>
      calculateRiskReward({
        direction: watched.direction === "short" ? "short" : "long",
        entry_price: watched.entry_price ?? null,
        stop_loss: watched.stop_loss ?? null,
        take_profit: watched.take_profit ?? null,
      }),
    [watched.direction, watched.entry_price, watched.stop_loss, watched.take_profit],
  );

  function selectTrade(id: string) {
    const trade = trades.data?.trades.find((item) => item.id === id);
    if (!trade) return;
    form.setValue("trade_id", trade.id);
    form.setValue("pair", trade.pair);
    form.setValue("direction", trade.direction);
    form.setValue("entry_price", Number(trade.entry_price));
    form.setValue("stop_loss", trade.stop_loss ? Number(trade.stop_loss) : null);
    form.setValue("take_profit", trade.take_profit ? Number(trade.take_profit) : null);
    form.setValue("setup_type", trade.setup_type);
    form.setValue("session", trade.session);
    form.setValue("pre_emotion", trade.pre_emotion);
  }

  async function onSubmit(input: ReviewInput) {
    setError("");
    if (subscription.plan !== "pro" && usage.limit !== null && usage.used >= usage.limit) {
      setShowUpgrade(true);
      return;
    }
    try {
      const payload = await submitReview.mutateAsync(input);
      setResult(payload.review);
      onReview(payload.review);
    } catch {
      setError("AI review temporarily unavailable, please try again");
    }
  }

  if (submitReview.isPending) return <ThinkingLoader />;
  if (result) return <ReviewResultCard review={result} onNew={() => setResult(null)} />;

  return (
    <section className="rounded-[16px] border border-border bg-background-secondary p-5">
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <h2 className="text-lg font-semibold">Submit New Review</h2>
      <p className="mt-1 text-sm text-foreground-secondary">
        Usage: {usage.limit === null ? "Unlimited" : `${usage.used} of ${usage.limit} reviews used this month`}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {(["select", "manual"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={mode === item ? "h-10 rounded-[10px] bg-accent text-sm font-semibold text-black" : "h-10 rounded-[10px] border border-border text-sm text-foreground-secondary"}
          >
            {item === "select" ? "Select Trade" : "Manual Entry"}
          </button>
        ))}
      </div>
      <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {mode === "select" ? (
          <label>
            <span className={labelClass}>Recent Trades</span>
            <select className={inputClass} onChange={(event) => selectTrade(event.target.value)} defaultValue="">
              <option value="" disabled>Select a trade</option>
              {trades.data?.trades.map((trade) => (
                <option key={trade.id} value={trade.id}>{trade.pair} · {trade.direction} · {new Date(trade.opened_at).toLocaleDateString()}</option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className={labelClass}>Pair</span><input className={inputClass} {...form.register("pair")} /></label>
          <label><span className={labelClass}>Direction</span><input className={inputClass} {...form.register("direction")} /></label>
          <label><span className={labelClass}>Setup Type</span><input className={inputClass} {...form.register("setup_type")} /></label>
          <label><span className={labelClass}>Session</span><input className={inputClass} {...form.register("session")} /></label>
          <label><span className={labelClass}>Entry</span><input className={inputClass} type="number" step="any" {...form.register("entry_price")} /></label>
          <label><span className={labelClass}>Stop Loss</span><input className={inputClass} type="number" step="any" {...form.register("stop_loss")} /></label>
          <label><span className={labelClass}>Take Profit</span><input className={inputClass} type="number" step="any" {...form.register("take_profit")} /></label>
        </div>
        <div>
          <span className={labelClass}>Pre-trade Emotion</span>
          <div className="mt-2">
            <Controller control={form.control} name="pre_emotion" render={({ field }) => <EmotionPicker value={field.value as never} onChange={field.onChange} />} />
          </div>
        </div>
        <div className="rounded-[10px] border border-border bg-background-tertiary p-3 text-sm">
          R:R: <span className="font-semibold text-accent">{rr ? `1:${rr.toFixed(2)}` : "-"}</span>
        </div>
        <label><span className={labelClass}>Your reasoning</span><textarea className={`${inputClass} min-h-24 py-3`} placeholder="Why did you take this trade?" {...form.register("user_reasoning")} /></label>
        <label><span className={labelClass}>Market context</span><textarea className={`${inputClass} min-h-24 py-3`} placeholder="What was happening in the market?" {...form.register("market_context")} /></label>
        {error ? <p className="text-sm text-loss">{error}</p> : null}
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-accent text-sm font-semibold text-black" type="submit">
          <Brain className="h-4 w-4" /> Get AI Review
        </button>
      </form>
    </section>
  );
}
