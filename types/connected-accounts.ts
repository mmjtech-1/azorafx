import { z } from "zod";

export const brokerTypes = ["binance", "bybit", "okx", "kucoin", "gateio", "exness", "xm", "ftmo", "icmarkets", "pepperstone", "fundednext", "mt4_other", "mt5_other"] as const;
export const accountTypes = ["crypto", "mt5", "mt4"] as const;

export type BrokerType = (typeof brokerTypes)[number];
export type ConnectedAccountType = (typeof accountTypes)[number];
export type SyncStatus = "active" | "error" | "disconnected" | "syncing";

export const cryptoConnectSchema = z.object({
  broker: z.enum(["binance", "bybit", "okx", "kucoin", "gateio"]),
  api_key: z.string().min(1),
  api_secret: z.string().min(1),
  nickname: z.string().optional().nullable(),
});

export const mt5ConnectSchema = z.object({
  broker: z.enum(["exness", "xm", "ftmo", "icmarkets", "pepperstone", "fundednext", "mt5_other"]),
  mt_login: z.string().min(1),
  mt_password: z.string().min(1),
  mt_server: z.string().min(1),
  nickname: z.string().optional().nullable(),
});

export type ConnectedAccount = {
  id: string;
  user_id?: string;
  broker: BrokerType;
  account_type: ConnectedAccountType;
  nickname: string | null;
  account_balance: number | string | null;
  account_currency: string | null;
  account_leverage: number | null;
  broker_account_id: string | null;
  sync_status: SyncStatus;
  last_synced_at: string | null;
  last_error: string | null;
  total_trades_synced: number;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
};

export const brokerLabels: Record<BrokerType, string> = {
  binance: "Binance",
  bybit: "Bybit",
  okx: "OKX",
  kucoin: "KuCoin",
  gateio: "Gate.io",
  exness: "Exness",
  xm: "XM",
  ftmo: "FTMO",
  icmarkets: "IC Markets",
  pepperstone: "Pepperstone",
  fundednext: "FundedNext",
  mt4_other: "Any MT4 Broker",
  mt5_other: "Any MT5 Broker",
};

