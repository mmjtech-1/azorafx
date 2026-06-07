import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptSecret } from "@/lib/encryption";

type AccountRow = {
  id: string;
  user_id: string;
  broker: string;
  account_type: string;
  api_key_encrypted: string | null;
  api_secret_encrypted: string | null;
  account_balance: number | string | null;
  account_currency: string | null;
};

type TradeRow = {
  outcome: string;
  pnl: number | string | null;
  risk_reward: number | string | null;
  opened_at: string;
};

function sign(query: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(query).digest("hex");
}

async function binanceRequest(path: string, apiKey: string, secret: string, params: Record<string, string | number> = {}) {
  const search = new URLSearchParams({ ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])), timestamp: String(Date.now()) });
  search.set("signature", sign(search.toString(), secret));
  const response = await fetch(`https://api.binance.com${path}?${search.toString()}`, {
    headers: { "X-MBX-APIKEY": apiKey },
  });
  if (!response.ok) throw new Error("Binance connection failed. Check read-only API permissions.");
  return response.json();
}

async function bybitRequest(path: string, apiKey: string, secret: string, params: Record<string, string | number> = {}) {
  const timestamp = String(Date.now());
  const recvWindow = "5000";
  const query = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString();
  const signature = crypto.createHmac("sha256", secret).update(`${timestamp}${apiKey}${recvWindow}${query}`).digest("hex");
  const response = await fetch(`https://api.bybit.com${path}${query ? `?${query}` : ""}`, {
    headers: {
      "X-BAPI-API-KEY": apiKey,
      "X-BAPI-SIGN": signature,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": recvWindow,
    },
  });
  if (!response.ok) throw new Error("Bybit connection failed. Check read-only API permissions.");
  return response.json();
}

export async function getAccountBalance(account: AccountRow) {
  const apiKey = decryptSecret(account.api_key_encrypted);
  const secret = decryptSecret(account.api_secret_encrypted);
  if (account.broker === "binance") {
    const data = await binanceRequest("/api/v3/account", apiKey, secret);
    const usdt = data.balances?.find((asset: { asset: string }) => asset.asset === "USDT");
    return { balance: Number(usdt?.free ?? 0), currency: "USDT", brokerAccountId: String(data.uid ?? "") };
  }
  if (account.broker === "bybit") {
    const data = await bybitRequest("/v5/account/wallet-balance", apiKey, secret, { accountType: "UNIFIED" });
    const total = data.result?.list?.[0]?.totalEquity ?? 0;
    return { balance: Number(total), currency: "USD", brokerAccountId: "" };
  }
  return { balance: Number(account.account_balance ?? 0), currency: account.account_currency ?? "USD", brokerAccountId: "" };
}

function mapBinanceTrade(raw: { id: number; orderId: number; symbol: string; price: string; qty: string; quoteQty: string; time: number; isBuyer: boolean; commission?: string }, account: AccountRow) {
  const pnl = 0;
  return {
    user_id: account.user_id,
    connected_account_id: account.id,
    broker_trade_id: String(raw.id),
    source: "binance",
    pair: raw.symbol,
    direction: raw.isBuyer ? "long" : "short",
    setup_type: "other",
    entry_price: Number(raw.price),
    exit_price: Number(raw.price),
    lot_size: Number(raw.qty),
    pnl,
    outcome: "open",
    opened_at: new Date(raw.time).toISOString(),
    closed_at: new Date(raw.time).toISOString(),
    notes: `Auto-synced Binance order ${raw.orderId}`,
  };
}

async function fetchCryptoTrades(account: AccountRow) {
  const apiKey = decryptSecret(account.api_key_encrypted);
  const secret = decryptSecret(account.api_secret_encrypted);
  if (account.broker === "binance") {
    const symbols = ["BTCUSDT", "ETHUSDT", "EURUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];
    const batches = await Promise.allSettled(symbols.map((symbol) => binanceRequest("/api/v3/myTrades", apiKey, secret, { symbol, limit: 100 })));
    return batches.flatMap((batch) => (batch.status === "fulfilled" ? batch.value.map((trade: any) => mapBinanceTrade(trade, account)) : []));
  }
  return [];
}

export async function syncCryptoAccount(supabase: SupabaseClient, accountId: string) {
  const { data: account, error } = await supabase.from("connected_accounts").select("*").eq("id", accountId).maybeSingle();
  if (error || !account) throw new Error("Connected account not found");
  const row = account as AccountRow;
  await supabase.from("connected_accounts").update({ sync_status: "syncing", updated_at: new Date().toISOString() }).eq("id", accountId);
  try {
    const trades = await fetchCryptoTrades(row);
    let synced = 0;
    if (trades.length) {
      const { data } = await supabase.from("trades").upsert(trades, { onConflict: "connected_account_id,broker_trade_id", ignoreDuplicates: true }).select("id");
      synced = data?.length ?? 0;
    }
    const balance = await getAccountBalance(row);
    await supabase.from("connected_accounts").update({
      account_balance: balance.balance,
      account_currency: balance.currency,
      broker_account_id: balance.brokerAccountId,
      sync_status: "active",
      last_synced_at: new Date().toISOString(),
      total_trades_synced: Number((account as any).total_trades_synced ?? 0) + synced,
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", accountId);
    return { synced, balance };
  } catch (error) {
    await supabase.from("connected_accounts").update({ sync_status: "error", last_error: error instanceof Error ? error.message : "Sync failed" }).eq("id", accountId);
    throw error;
  }
}

export async function syncAllAccounts(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("connected_accounts").select("id").eq("user_id", userId).eq("account_type", "crypto").neq("sync_status", "disconnected");
  const results = await Promise.allSettled((data ?? []).map((account) => syncCryptoAccount(supabase, account.id)));
  return { synced: results.reduce((sum, result) => sum + (result.status === "fulfilled" ? result.value.synced : 0), 0) };
}

export async function calculateAccountStats(supabase: SupabaseClient, userId: string) {
  const [{ data: trades }, { data: accounts }] = await Promise.all([
    supabase.from("trades").select("outcome,pnl,risk_reward,opened_at").eq("user_id", userId),
    supabase.from("connected_accounts").select("account_balance,is_primary,created_at").eq("user_id", userId).neq("sync_status", "disconnected"),
  ]);
  const rows = (trades ?? []) as TradeRow[];
  const closed = rows.filter((trade) => trade.outcome !== "open");
  const totalPnl = rows.reduce((sum, trade) => sum + Number(trade.pnl ?? 0), 0);
  const winRate = closed.length ? (closed.filter((trade) => trade.outcome === "win").length / closed.length) * 100 : 0;
  const account = accounts?.find((row: any) => row.is_primary) ?? accounts?.[0];
  return {
    accountBalance: Number(account?.account_balance ?? 10000),
    winRate,
    totalPnl,
    tradesCount: rows.length,
    hasConnectedAccount: Boolean(account),
  };
}
