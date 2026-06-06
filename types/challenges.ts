import { z } from "zod";

export type ChallengePhase = "phase1" | "phase2" | "funded" | "passed" | "failed";
export type ChallengeRiskStatus = "active" | "at_risk" | "passed" | "failed";

export const challengeInputSchema = z.object({
  firm_name: z.enum(["ftmo", "fundednext", "apex", "the5ers", "alpha_capital", "myforexfunds", "e8funding", "topstep", "other"]),
  custom_firm_name: z.string().optional().nullable(),
  account_size: z.coerce.number().positive(),
  phase: z.enum(["phase1", "phase2", "funded"]).default("phase1"),
  profit_target_percent: z.coerce.number().min(0),
  daily_loss_limit_percent: z.coerce.number().positive(),
  max_drawdown_percent: z.coerce.number().positive(),
  min_trading_days: z.coerce.number().int().min(0).default(0),
  max_trading_days: z.coerce.number().int().positive().optional().nullable(),
  no_weekend_holding: z.coerce.boolean().default(false),
  no_news_trading: z.coerce.boolean().default(false),
  max_lot_size: z.coerce.number().positive().optional().nullable(),
  started_at: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export const challengeUpdateSchema = challengeInputSchema.partial().extend({
  current_balance: z.coerce.number().optional(),
  current_pnl: z.coerce.number().optional(),
  status: z.enum(["phase1", "phase2", "funded", "passed", "failed"]).optional(),
  completed_at: z.string().optional().nullable(),
});

export const snapshotInputSchema = z.object({
  snapshot_date: z.string().optional(),
  daily_pnl: z.coerce.number(),
  trades_count: z.coerce.number().int().min(0).optional().nullable(),
});

export type ChallengeInput = z.infer<typeof challengeInputSchema>;
export type ChallengeUpdateInput = z.infer<typeof challengeUpdateSchema>;
export type SnapshotInput = z.infer<typeof snapshotInputSchema>;

export type ChallengeSnapshot = {
  id: string;
  challenge_id: string;
  user_id: string;
  snapshot_date: string;
  balance: number | string | null;
  daily_pnl: number | string | null;
  daily_loss_used: number | string | null;
  drawdown_used: number | string | null;
  trades_count: number | null;
  created_at: string;
};

export type Challenge = {
  id: string;
  user_id: string;
  firm_name: string;
  custom_firm_name: string | null;
  account_size: number | string;
  phase: ChallengePhase;
  profit_target_percent: number | string;
  daily_loss_limit_percent: number | string;
  max_drawdown_percent: number | string;
  min_trading_days: number;
  max_trading_days: number | null;
  no_weekend_holding: boolean;
  no_news_trading: boolean;
  max_lot_size: number | string | null;
  profit_target_amount: number | string | null;
  daily_loss_limit_amount: number | string | null;
  max_drawdown_amount: number | string | null;
  current_balance: number | string | null;
  current_pnl: number | string | null;
  highest_balance: number | string | null;
  days_traded: number;
  status: ChallengePhase;
  started_at: string;
  deadline_date: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  latest_snapshot?: ChallengeSnapshot | null;
  snapshots?: ChallengeSnapshot[];
};

export function money(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export function firmLabel(challenge: Pick<Challenge, "firm_name" | "custom_firm_name">) {
  if (challenge.firm_name === "other") return challenge.custom_firm_name || "Other Firm";
  const labels: Record<string, string> = {
    ftmo: "FTMO",
    fundednext: "FundedNext",
    apex: "Apex Trader",
    the5ers: "The5ers",
    alpha_capital: "Alpha Capital",
    myforexfunds: "MyForexFunds",
    e8funding: "E8 Funding",
    topstep: "TopStep",
  };
  return labels[challenge.firm_name] ?? challenge.firm_name;
}

export function phaseLabel(phase: ChallengePhase) {
  if (phase === "phase1") return "Phase 1";
  if (phase === "phase2") return "Phase 2";
  return phase === "funded" ? "Funded" : phase.charAt(0).toUpperCase() + phase.slice(1);
}

export function daysRemaining(challenge: Pick<Challenge, "deadline_date" | "started_at" | "max_trading_days">) {
  const deadline =
    challenge.deadline_date ??
    (challenge.max_trading_days
      ? new Date(new Date(`${challenge.started_at}T00:00:00`).getTime() + challenge.max_trading_days * 86400000).toISOString().slice(0, 10)
      : null);
  if (!deadline) return null;
  return Math.ceil((new Date(`${deadline}T23:59:59`).getTime() - Date.now()) / 86400000);
}

export function challengeProgress(challenge: Challenge) {
  const account = money(challenge.account_size);
  const balance = money(challenge.current_balance ?? challenge.account_size);
  const currentPnl = balance - account;
  const target = money(challenge.profit_target_amount) || (account * Number(challenge.profit_target_percent)) / 100;
  const dailyLimit = money(challenge.daily_loss_limit_amount) || (account * Number(challenge.daily_loss_limit_percent)) / 100;
  const maxDrawdown = money(challenge.max_drawdown_amount) || (account * Number(challenge.max_drawdown_percent)) / 100;
  const dailyUsed = Math.max(0, -money(challenge.latest_snapshot?.daily_pnl ?? challenge.current_pnl));
  const high = Math.max(money(challenge.highest_balance ?? account), balance, account);
  const drawdownUsed = Math.max(0, high - balance);
  const profitPercent = target > 0 ? Math.min(Math.max((currentPnl / target) * 100, 0), 100) : 0;
  const dailyPercent = dailyLimit > 0 ? Math.min((dailyUsed / dailyLimit) * 100, 100) : 0;
  const drawdownPercent = maxDrawdown > 0 ? Math.min((drawdownUsed / maxDrawdown) * 100, 100) : 0;
  const risk = Math.max(dailyPercent, drawdownPercent);
  const status: ChallengeRiskStatus =
    challenge.status === "passed" ? "passed" : challenge.status === "failed" ? "failed" : risk >= 70 ? "at_risk" : "active";
  return { account, balance, currentPnl, target, dailyLimit, maxDrawdown, dailyUsed, drawdownUsed, profitPercent, dailyPercent, drawdownPercent, risk, status };
}
