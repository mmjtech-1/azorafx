import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import type { PsychologyInsight } from "@/types/psychology";

const SYSTEM_PROMPT =
  "You are a trading psychology coach. Analyze this trader's last 30 days of data and identify 3-5 specific behavioral patterns. For each pattern provide: title (short), description (2 sentences), severity (info/warning/critical). Focus on: emotion-to-outcome correlations, FOMO patterns, revenge trading signs, best/worst performing conditions. Return as JSON array.";

const fallbackInsights: PsychologyInsight[] = [
  {
    title: "Wait for calm confirmation",
    description: "The cleanest decisions usually happen when emotion is neutral or focused. Make the pre-trade checklist mandatory when stress is elevated.",
    severity: "info",
  },
  {
    title: "Protect against revenge risk",
    description: "High revenge urge should reduce trade frequency immediately. Use a hard rule: no second trade within 30 minutes of a loss.",
    severity: "warning",
  },
  {
    title: "FOMO is a low-quality entry signal",
    description: "FOMO often appears after price has already moved. Convert that impulse into a journal note and wait for a pullback setup.",
    severity: "warning",
  },
];

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = subDays(new Date(), 30).toISOString();
  const [{ data: trades }, { data: logs }] = await Promise.all([
    supabase.from("trades").select("*").eq("user_id", user.id).gte("opened_at", since),
    supabase.from("psychology_logs").select("*").eq("user_id", user.id).gte("log_date", since.slice(0, 10)),
  ]);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ insights: fallbackInsights });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: JSON.stringify({ trades: trades ?? [], psychology_logs: logs ?? [] }),
          },
        ],
      }),
    });

    if (!response.ok) throw new Error("Claude request failed");
    const payload = await response.json();
    const text = payload.content?.[0]?.text ?? "[]";
    const insights = JSON.parse(text) as PsychologyInsight[];
    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ insights: fallbackInsights });
  }
}
