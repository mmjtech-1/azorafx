"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Challenge, ChallengeInput, ChallengeUpdateInput, SnapshotInput } from "@/types/challenges";
import { challengeProgress, daysRemaining } from "@/types/challenges";

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Request failed");
  return payload as T;
}

function maybeWarn(challenge: Challenge) {
  const progress = challengeProgress(challenge);
  const days = daysRemaining(challenge);
  if (progress.dailyPercent >= 70) toast.warning("Daily loss limit is above 70%. Trade carefully.");
  if (progress.drawdownPercent >= 70) toast.warning("Max drawdown is above 70%. Reduce risk immediately.");
  if (days !== null && days <= 3 && days >= 0) toast.warning("Challenge deadline is within 3 days.");
}

export function useChallengesList() {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: async () => readJson<{ challenges: Challenge[] }>(await fetch("/api/challenges")),
  });
}

export function useChallenge(id?: string) {
  return useQuery({
    queryKey: ["challenge", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const payload = await readJson<{ challenge: Challenge }>(await fetch(`/api/challenges/${id}`));
      maybeWarn(payload.challenge);
      return payload.challenge;
    },
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ChallengeInput) =>
      readJson<{ challenge: Challenge }>(
        await fetch("/api/challenges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges"] }),
  });
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ChallengeUpdateInput }) =>
      readJson<{ challenge: Challenge }>(
        await fetch(`/api/challenges/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: ({ challenge }) => {
      queryClient.setQueryData(["challenge", challenge.id], challenge);
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => readJson<{ ok: boolean }>(await fetch(`/api/challenges/${id}`, { method: "DELETE" })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["challenges"] }),
  });
}

export function useAddSnapshot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: SnapshotInput }) =>
      readJson<{ challenge: Challenge }>(
        await fetch(`/api/challenges/${id}/snapshot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: ({ challenge }) => {
      maybeWarn(challenge);
      queryClient.invalidateQueries({ queryKey: ["challenge", challenge.id] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}
