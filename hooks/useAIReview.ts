"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReviewInput, TradeReview } from "@/types/ai-review";

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "AI review temporarily unavailable, please try again");
  return payload as T;
}

export function useReviewsList() {
  return useQuery({
    queryKey: ["ai-reviews"],
    queryFn: async () =>
      readJson<{ reviews: TradeReview[]; usage: { used: number; limit: number | null; plan: "FREE" | "PRO" } }>(
        await fetch("/api/ai-review"),
      ),
  });
}

export function useReview(id?: string) {
  return useQuery({
    queryKey: ["ai-review", id],
    enabled: Boolean(id),
    queryFn: async () => readJson<{ review: TradeReview }>(await fetch(`/api/ai-review/${id}`)),
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ReviewInput) =>
      readJson<{ review: TradeReview }>(
        await fetch("/api/ai-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: () => {
      toast.success("🤖 AI review ready");
      queryClient.invalidateQueries({ queryKey: ["ai-reviews"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
