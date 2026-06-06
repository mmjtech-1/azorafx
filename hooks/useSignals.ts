"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Signal, SignalConfig } from "@/types/signals";

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload as T;
}

export function useSignals() {
  const queryClient = useQueryClient();
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["signals"],
    refetchInterval: 5 * 60 * 1000,
    queryFn: async () => {
      const response = await fetch("/api/signals");
      const payload = await readJson<{ signals: Signal[]; history: Signal[]; updatedAt: string }>(response);
      setUpdatedAt(payload.updatedAt);
      return payload;
    },
  });

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("signals-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "signals" }, () => {
          queryClient.invalidateQueries({ queryKey: ["signals"] });
          setUpdatedAt(new Date().toISOString());
        })
        .subscribe();
    } catch {
      // Realtime is optional for local previews without env vars.
    }

    return () => {
      if (channel) {
        createClient().removeChannel(channel);
      }
    };
  }, [queryClient]);

  const lastUpdatedLabel = useMemo(() => {
    if (!updatedAt) return "just now";
    const minutes = Math.max(0, Math.round((Date.now() - new Date(updatedAt).getTime()) / 60_000));
    return minutes <= 1 ? "just now" : `${minutes} min ago`;
  }, [updatedAt]);

  return { ...query, lastUpdatedLabel };
}

export function useSignalConfig() {
  return useQuery({
    queryKey: ["signal-config"],
    queryFn: async () => {
      const response = await fetch("/api/signals/config");
      const payload = await readJson<{ config: SignalConfig }>(response);
      return payload.config;
    },
  });
}

export function useUpdateSignalConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: Partial<SignalConfig>) => {
      const response = await fetch("/api/signals/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const payload = await readJson<{ config: SignalConfig }>(response);
      return payload.config;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signal-config"] });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });
}

export function useGenerateSignals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/signals/generate", { method: "POST" });
      return readJson<{ signals: Signal[]; updatedAt: string }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });
}
