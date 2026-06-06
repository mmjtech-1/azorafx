export type DashboardTrade = {
  id: string;
  pair: string;
  direction: "long" | "short";
  entry_price: number | string;
  exit_price: number | string | null;
  pnl: number | string | null;
  risk_reward: number | string | null;
  outcome: "win" | "loss" | "breakeven" | "open";
  opened_at: string;
  closed_at: string | null;
};

export type EquityPoint = {
  date: string;
  balance: number;
};

export type PairPnlPoint = {
  pair: string;
  pnl: number;
};
