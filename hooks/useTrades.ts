"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { Trade, TradeInput, TradeUpdateInput, TradesListResponse } from "@/types/trades";

export type TradeFilters = {
  pair?: string[];
  outcome?: string;
  session?: string;
  setup?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

function buildSearch(filters: TradeFilters = {}) {
  const params = new URLSearchParams();

  if (filters.pair?.length) params.set("pair", filters.pair.join(","));
  if (filters.outcome) params.set("outcome", filters.outcome);
  if (filters.session) params.set("session", filters.session);
  if (filters.setup) params.set("setup", filters.setup);
  if (filters.source) params.set("source", filters.source);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return params.toString();
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "Request failed");
  }

  return payload as T;
}

export function useTradesList(filters: TradeFilters = {}) {
  return useQuery({
    queryKey: ["trades", filters],
    queryFn: async () => {
      const search = buildSearch(filters);
      const response = await fetch(`/api/trades${search ? `?${search}` : ""}`);
      return readJson<TradesListResponse>(response);
    },
  });
}

export function useTrade(id?: string) {
  return useQuery({
    queryKey: ["trade", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const response = await fetch(`/api/trades/${id}`);
      const payload = await readJson<{ trade: Trade }>(response);
      return payload.trade;
    },
  });
}

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TradeInput) => {
      const response = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await readJson<{ trade: Trade }>(response);
      return payload.trade;
    },
    onSuccess: () => {
      toast.success("✅ Trade logged successfully");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TradeUpdateInput }) => {
      const response = await fetch(`/api/trades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = await readJson<{ trade: Trade }>(response);
      return payload.trade;
    },
    onSuccess: (trade) => {
      queryClient.setQueryData(["trade", trade.id], trade);
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}

export function useDeleteTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/trades/${id}`, { method: "DELETE" });
      await readJson<{ ok: boolean }>(response);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["trades"] });
      const snapshots = queryClient
        .getQueriesData<TradesListResponse>({ queryKey: ["trades"] })
        .map(([key, data]) => [key, data] as [QueryKey, TradesListResponse | undefined]);

      for (const [key, data] of snapshots) {
        if (!data) continue;
        queryClient.setQueryData<TradesListResponse>(key, {
          ...data,
          trades: data.trades.filter((trade) => trade.id !== id),
          total: Math.max(data.total - 1, 0),
        });
      }

      return { snapshots };
    },
    onError: (_error, _id, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => {
      toast.success("🗑️ Trade deleted");
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
