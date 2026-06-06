import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PsychologyInsight } from "@/types/psychology";

const fallbackInsights: PsychologyInsight[] = [
  {
    title: "Focused entries perform best",
    description: "Your strongest trading state is usually focused or neutral. Keep position size normal only when your pre-trade plan is written down.",
    severity: "info",
  },
  {
    title: "FOMO needs a circuit breaker",
    description: "When FOMO rises, your decision quality can degrade quickly. Add a 10-minute pause before entering after a missed move.",
    severity: "warning",
  },
  {
    title: "Loss streak awareness",
    description: "Two losses in a row should trigger reduced risk. This prevents a normal drawdown from becoming revenge trading.",
    severity: "warning",
  },
];

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ insights: fallbackInsights });
}
