"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PsychologyInput, PsychologyInsight, PsychologyLog } from "@/types/psychology";

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload as T;
}

export function usePsychologyLogs() {
  return useQuery({
    queryKey: ["psychology-logs"],
    queryFn: async () => readJson<{ logs: PsychologyLog[] }>(await fetch("/api/psychology")),
  });
}

export function useSaveMorningCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PsychologyInput) =>
      readJson<{ log: PsychologyLog }>(
        await fetch("/api/psychology", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: () => {
      toast.success("✅ Check-in saved");
      queryClient.invalidateQueries({ queryKey: ["psychology-logs"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveEveningLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, input }: { date: string; input: PsychologyInput }) =>
      readJson<{ log: PsychologyLog }>(
        await fetch(`/api/psychology/${date}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: () => {
      toast.success("✅ Check-in saved");
      queryClient.invalidateQueries({ queryKey: ["psychology-logs"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function usePsychologyInsights() {
  return useQuery({
    queryKey: ["psychology-insights"],
    queryFn: async () => readJson<{ insights: PsychologyInsight[] }>(await fetch("/api/psychology/insights")),
  });
}

export function useGeneratePsychologyInsights() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      readJson<{ insights: PsychologyInsight[] }>(
        await fetch("/api/psychology/insights/generate", { method: "POST" }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["psychology-insights"] }),
  });
}
