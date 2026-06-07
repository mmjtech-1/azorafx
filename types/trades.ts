import { z } from "zod";

export const tradeDirections = ["long", "short"] as const;
export const tradeOutcomes = ["win", "loss", "breakeven", "open"] as const;
export const tradeSessions = ["asian", "london", "new_york", "overlap", "pre_market"] as const;
export const tradeSetups = [
  "ema_crossover",
  "structure_break",
  "ob_retest",
  "news_trade",
  "supply_demand",
  "fib_retracement",
  "trendline_break",
  "other",
] as const;
export const emotions = ["anxious", "neutral", "focused", "overconfident", "fomo", "frustrated"] as const;

const nullableNumber = z.coerce.number().finite().optional().nullable();
const textArray = z.array(z.string()).optional().nullable();

export const tradeCreateSchema = z.object({
  pair: z.string().min(1),
  direction: z.enum(tradeDirections),
  session: z.enum(tradeSessions).optional().nullable(),
  setup_type: z.enum(tradeSetups).default("other"),
  entry_price: z.coerce.number().positive(),
  stop_loss: nullableNumber,
  take_profit: nullableNumber,
  exit_price: nullableNumber,
  lot_size: nullableNumber,
  risk_percent: nullableNumber,
  risk_amount: nullableNumber,
  pnl: nullableNumber,
  pnl_percent: nullableNumber,
  risk_reward: nullableNumber,
  outcome: z.enum(tradeOutcomes).default("open"),
  pre_emotion: z.enum(emotions).optional().nullable(),
  post_emotion: z.enum(emotions).optional().nullable(),
  notes: z.string().optional().nullable(),
  mistakes: z.string().optional().nullable(),
  lessons: z.string().optional().nullable(),
  screenshot_urls: textArray,
  tags: textArray,
  opened_at: z.string().datetime(),
  closed_at: z.string().datetime().optional().nullable(),
  source: z.string().optional().default("manual"),
  broker_trade_id: z.string().optional().nullable(),
  connected_account_id: z.string().uuid().optional().nullable(),
});

export const tradeUpdateSchema = tradeCreateSchema.partial();

export type TradeInput = z.infer<typeof tradeCreateSchema>;
export type TradeUpdateInput = z.infer<typeof tradeUpdateSchema>;

export type Trade = TradeInput & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type TradesListResponse = {
  trades: Trade[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function calculateRiskReward(input: {
  direction?: "long" | "short";
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
}) {
  const entry = Number(input.entry_price);
  const stop = Number(input.stop_loss);
  const target = Number(input.take_profit);

  if (!entry || !stop || !target || entry === stop) {
    return null;
  }

  const risk =
    input.direction === "short" ? Math.abs(stop - entry) : Math.abs(entry - stop);
  const reward =
    input.direction === "short" ? Math.abs(entry - target) : Math.abs(target - entry);

  if (!risk || !reward) {
    return null;
  }

  return Number((reward / risk).toFixed(4));
}
