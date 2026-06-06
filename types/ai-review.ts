import { z } from "zod";

export const reviewInputSchema = z.object({
  trade_id: z.string().uuid().optional().nullable(),
  pair: z.string().min(1),
  direction: z.string().min(1),
  entry_price: z.coerce.number().optional().nullable(),
  stop_loss: z.coerce.number().optional().nullable(),
  take_profit: z.coerce.number().optional().nullable(),
  setup_type: z.string().optional().nullable(),
  session: z.string().optional().nullable(),
  pre_emotion: z.string().optional().nullable(),
  user_reasoning: z.string().min(1),
  market_context: z.string().optional().nullable(),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;

export type TradeReview = {
  id: string;
  user_id: string;
  trade_id: string | null;
  pair: string;
  direction: string;
  entry_price: number | string | null;
  stop_loss: number | string | null;
  take_profit: number | string | null;
  setup_type: string | null;
  user_reasoning: string | null;
  setup_score: number | string | null;
  risk_management_score: number | string | null;
  entry_timing_score: number | string | null;
  discipline_score: number | string | null;
  overall_score: number | string | null;
  strengths: string[] | null;
  improvements: string[] | null;
  verdict: string | null;
  detailed_analysis: string | null;
  market_context: string | null;
  alternative_entry: string | null;
  model_used: string | null;
  tokens_used: number | null;
  created_at: string;
};
