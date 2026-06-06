"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { ReviewForm } from "@/components/ai-review/ReviewForm";
import { ReviewHistory } from "@/components/ai-review/ReviewHistory";
import { useReviewsList } from "@/hooks/useAIReview";
import type { TradeReview } from "@/types/ai-review";
import { useState } from "react";

const defaultUsage = {
  used: 0,
  limit: 3,
  plan: "FREE" as const,
};

export default function AIReviewPage() {
  const reviewsQuery = useReviewsList();
  const [latestReview, setLatestReview] = useState<TradeReview | null>(null);

  const reviews = reviewsQuery.data?.reviews ?? [];
  const usage = reviewsQuery.data?.usage ?? defaultUsage;
  const visibleReviews =
    latestReview && !reviews.some((review) => review.id === latestReview.id)
      ? [latestReview, ...reviews]
      : reviews;

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            <Brain className="h-3.5 w-3.5" />
            Trading Coach
          </div>
          <h1 className="text-3xl font-semibold text-white">AI Trade Review</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Submit a trade, get structured coaching, and track how your decision quality improves over time.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-[#0E1117] px-4 py-3 text-sm text-slate-300">
          <Sparkles className="h-4 w-4 text-[#00D68F]" />
          <span>
            {usage.plan === "PRO"
              ? "Unlimited reviews available"
              : `${usage.used} of ${usage.limit} free reviews used this month`}
          </span>
        </div>
      </motion.header>

      <div className="grid gap-6 xl:grid-cols-[45fr_55fr]">
        <ReviewForm usage={usage} onReview={setLatestReview} />
        <ReviewHistory reviews={visibleReviews} isLoading={reviewsQuery.isLoading} />
      </div>
    </div>
  );
}
