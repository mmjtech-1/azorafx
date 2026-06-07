"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ConnectedAccount } from "@/types/connected-accounts";

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Request failed");
  return payload as T;
}

export function useConnectedAccounts() {
  return useQuery({
    queryKey: ["connected-accounts"],
    queryFn: async () => readJson<{ accounts: ConnectedAccount[] }>(await fetch("/api/connected-accounts")),
  });
}

export function useConnectCryptoAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { broker: string; api_key: string; api_secret: string; nickname?: string }) =>
      readJson<{ success: boolean; account: ConnectedAccount; balance: { balance: number; currency: string } }>(
        await fetch("/api/connected-accounts/crypto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: (data) => {
      toast.success(`Connected. Balance: ${data.balance.balance.toLocaleString()} ${data.balance.currency}`);
      queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useConnectMT5Account() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { broker: string; mt_login: string; mt_password: string; mt_server: string; nickname?: string }) =>
      readJson<{ success: boolean; account: ConnectedAccount }>(
        await fetch("/api/connected-accounts/mt5", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      ),
    onSuccess: () => {
      toast.success("MT5 account connected");
      queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSyncConnectedAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => readJson<{ success: boolean; synced: number }>(await fetch(`/api/connected-accounts/${id}/sync`, { method: "POST" })),
    onSuccess: (data) => {
      toast.success(`✅ ${data.synced} new trades imported`);
      queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => readJson<{ ok: boolean }>(await fetch(`/api/connected-accounts/${id}`, { method: "DELETE" })),
    onSuccess: () => {
      toast.success("Account disconnected");
      queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
