import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateRiskReward } from "@/types/trades";
import { reviewInputSchema } from "@/types/ai-review";

const SYSTEM_PROMPT =
  "You are TradeSense AI, an expert trading coach specializing in forex and crypto markets. You analyze trades using these criteria: EMA crossover strategies, structure breaks, order blocks, risk management principles, prop firm rules, and trading psychology. Score each trade on Setup Quality, Risk Management, Entry Timing, and Discipline (each 0-10). Be specific, actionable, and honest. Never sugarcoat poor setups. Always respond in valid JSON only — no markdown, no explanation outside the JSON.";

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function fallbackReview() {
  return {
    setup_score: 7.4,
    risk_management_score: 8.1,
    entry_timing_score: 6.8,
    discipline_score: 7.6,
    verdict: "Solid setup with acceptable risk, but entry timing could be cleaner.",
    strengths: ["Defined stop loss and take profit before entry", "Risk reward is favorable", "Reasoning includes market context"],
    improvements: ["Wait for candle close confirmation", "Avoid entering directly into nearby liquidity", "Document invalidation more clearly"],
    detailed_analysis: "This trade has a reasonable structure and enough risk definition to be reviewable. The main improvement is patience around confirmation.",
    market_context: "Market conditions appear constructive, but confirmation quality matters around volatile sessions.",
    alternative_entry: "Wait for a retest of the breakout level and enter after rejection confirms continuation.",
  };
}

async function callClaude(message: string) {
  if (!process.env.ANTHROPIC_API_KEY) return fallbackReview();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: message }],
      }),
    });
    if (!response.ok) throw new Error("AI review temporarily unavailable, please try again");
    const payload = await response.json();
    try {
      return JSON.parse(payload.content?.[0]?.text ?? "{}");
    } catch {
      if (attempt === 1) throw new Error("AI review temporarily unavailable, please try again");
    }
  }
  return fallbackReview();
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: reviews } = await supabase.from("trade_reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const { data: subscription } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
  const { data: usage } = await supabase.from("usage_logs").select("ai_reviews_used").eq("user_id", user.id).eq("month_year", monthKey()).maybeSingle();
  return NextResponse.json({ reviews: reviews ?? [], usage: { used: usage?.ai_reviews_used ?? 0, limit: subscription?.plan === "pro" ? null : 3 } });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = reviewInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;
  const month = monthKey();
  const [{ data: subscription }, { data: usage }] = await Promise.all([
    supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle(),
    supabase.from("usage_logs").select("ai_reviews_used").eq("user_id", user.id).eq("month_year", month).maybeSingle(),
  ]);
  const used = usage?.ai_reviews_used ?? 0;
  if (subscription?.plan !== "pro" && used >= 3) return NextResponse.json({ error: "Free AI review limit reached" }, { status: 402 });
  const rr = calculateRiskReward({ direction: input.direction === "short" ? "short" : "long", entry_price: input.entry_price, stop_loss: input.stop_loss, take_profit: input.take_profit });
  const message = `Review this trade:
Pair: ${input.pair}
Direction: ${input.direction}
Entry: ${input.entry_price}
Stop Loss: ${input.stop_loss}
Take Profit: ${input.take_profit}
Calculated R:R: ${rr}
Setup type: ${input.setup_type}
Trading session: ${input.session}
Pre-trade emotion: ${input.pre_emotion}
Trader's reasoning: ${input.user_reasoning}
Market context: ${input.market_context}`;
  try {
    const ai = await callClaude(message);
    const overall =
      Number(ai.setup_score) * 0.3 +
      Number(ai.risk_management_score) * 0.3 +
      Number(ai.entry_timing_score) * 0.2 +
      Number(ai.discipline_score) * 0.2;
    const { data: review, error } = await supabase.from("trade_reviews").insert({
      user_id: user.id,
      trade_id: input.trade_id,
      pair: input.pair,
      direction: input.direction,
      entry_price: input.entry_price,
      stop_loss: input.stop_loss,
      take_profit: input.take_profit,
      setup_type: input.setup_type,
      user_reasoning: input.user_reasoning,
      setup_score: ai.setup_score,
      risk_management_score: ai.risk_management_score,
      entry_timing_score: ai.entry_timing_score,
      discipline_score: ai.discipline_score,
      overall_score: Number(overall.toFixed(2)),
      strengths: ai.strengths ?? [],
      improvements: ai.improvements ?? [],
      verdict: ai.verdict,
      detailed_analysis: ai.detailed_analysis,
      market_context: ai.market_context,
      alternative_entry: ai.alternative_entry,
      model_used: "claude-sonnet-4-6",
    }).select("*").single();
    if (error) return NextResponse.json({ error: "AI review temporarily unavailable, please try again" }, { status: 500 });
    await supabase.from("usage_logs").upsert({ user_id: user.id, month_year: month, ai_reviews_used: used + 1, updated_at: new Date().toISOString() }, { onConflict: "user_id,month_year" });
    return NextResponse.json({ review });
  } catch {
    return NextResponse.json({ error: "AI review temporarily unavailable, please try again" }, { status: 503 });
  }
}
