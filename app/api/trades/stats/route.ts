import { NextResponse, type NextRequest } from "next/server";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";

type Trade = {
  pair: string;
  session: string | null;
  setup_type: string | null;
  outcome: "win" | "loss" | "breakeven" | "open";
  pnl: number | string | null;
  risk_reward: number | string | null;
  opened_at: string;
  pre_emotion: string | null;
};

const sessions = ["asian", "london", "new_york", "overlap", "pre_market"];
const setups = [
  "ema_crossover",
  "structure_break",
  "ob_retest",
  "news_trade",
  "supply_demand",
  "fib_retracement",
  "trendline_break",
  "other",
];
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function num(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function winRate(trades: Trade[]) {
  const closed = trades.filter((trade) => trade.outcome !== "open");
  if (!closed.length) return 0;
  return (closed.filter((trade) => trade.outcome === "win").length / closed.length) * 100;
}

function profitFactor(trades: Trade[]) {
  const grossProfit = trades.filter((trade) => num(trade.pnl) > 0).reduce((sum, trade) => sum + num(trade.pnl), 0);
  const grossLoss = Math.abs(trades.filter((trade) => num(trade.pnl) < 0).reduce((sum, trade) => sum + num(trade.pnl), 0));
  return grossLoss ? grossProfit / grossLoss : grossProfit ? grossProfit : 0;
}

function avgRiskReward(trades: Trade[]) {
  const values = trades.map((trade) => num(trade.risk_reward)).filter((value) => value > 0);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function streaks(trades: Trade[]) {
  const sorted = [...trades]
    .filter((trade) => trade.outcome === "win" || trade.outcome === "loss")
    .sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime());
  let bestWinningStreak = 0;
  let worstLosingStreak = 0;
  let wins = 0;
  let losses = 0;

  for (const trade of sorted) {
    if (trade.outcome === "win") {
      wins += 1;
      losses = 0;
    } else {
      losses += 1;
      wins = 0;
    }
    bestWinningStreak = Math.max(bestWinningStreak, wins);
    worstLosingStreak = Math.max(worstLosingStreak, losses);
  }

  return { bestWinningStreak, worstLosingStreak };
}

function grouped<T extends string>(keys: T[], trades: Trade[], getKey: (trade: Trade) => string | null) {
  return keys.map((key) => {
    const bucket = trades.filter((trade) => (getKey(trade) ?? "other") === key);
    return { name: key, winRate: winRate(bucket), trades: bucket.length };
  });
}

function recommendation(win: number, avgPnl: number) {
  if (win >= 60 && avgPnl > 0) return "Strong state. Prioritize this mindset.";
  if (win >= 40) return "Mixed results. Reduce size and keep journaling context.";
  return "Risk state. Pause after losses and wait for A+ setups.";
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let query = supabase
    .from("trades")
    .select("pair,session,setup_type,outcome,pnl,risk_reward,opened_at,pre_emotion")
    .eq("user_id", user.id)
    .order("opened_at", { ascending: true });

  const dateFrom = request.nextUrl.searchParams.get("dateFrom");
  const dateTo = request.nextUrl.searchParams.get("dateTo");
  if (dateFrom) query = query.gte("opened_at", dateFrom);
  if (dateTo) query = query.lte("opened_at", dateTo);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const trades = (data ?? []) as Trade[];
  const totalPnl = trades.reduce((sum, trade) => sum + num(trade.pnl), 0);
  let balance = 10000;
  let peak = balance;
  let maxDrawdown = 0;
  const byDate = new Map<string, number>();

  for (const trade of trades) {
    const key = format(new Date(trade.opened_at), "yyyy-MM-dd");
    byDate.set(key, (byDate.get(key) ?? 0) + num(trade.pnl));
  }

  const equityCurve = Array.from(byDate.entries()).map(([date, dailyPnl]) => {
    balance += dailyPnl;
    peak = Math.max(peak, balance);
    const drawdown = balance - peak;
    maxDrawdown = Math.min(maxDrawdown, drawdown);
    return { date, balance, dailyPnl, drawdown };
  });

  if (!equityCurve.length) {
    equityCurve.push({ date: format(new Date(), "yyyy-MM-dd"), balance, dailyPnl: 0, drawdown: 0 });
  }

  const pairs = [...new Set(trades.map((trade) => trade.pair))];
  const pairPerformance = pairs.map((pair) => {
    const bucket = trades.filter((trade) => trade.pair === pair);
    const pnls = bucket.map((trade) => num(trade.pnl));
    return {
      pair,
      trades: bucket.length,
      winRate: winRate(bucket),
      avgRiskReward: avgRiskReward(bucket),
      totalPnl: pnls.reduce((sum, value) => sum + value, 0),
      bestTrade: Math.max(...pnls, 0),
      worstTrade: Math.min(...pnls, 0),
      profitFactor: profitFactor(bucket),
    };
  });

  const hourlyHeatmap = days.flatMap((day, dayIndex) =>
    Array.from({ length: 24 }, (_, hour) => {
      const bucket = trades.filter((trade) => {
        const opened = new Date(trade.opened_at);
        return opened.getDay() === dayIndex && opened.getHours() === hour;
      });
      return { day, hour, winRate: winRate(bucket), trades: bucket.length };
    }),
  );

  const dayOfWeek = days.map((day, index) => {
    const bucket = trades.filter((trade) => new Date(trade.opened_at).getDay() === index);
    return { day, winRate: winRate(bucket), trades: bucket.length };
  });

  const winning = trades.filter((trade) => num(trade.pnl) > 0).map((trade) => num(trade.pnl));
  const losing = trades.filter((trade) => num(trade.pnl) < 0).map((trade) => num(trade.pnl));
  const streakData = streaks(trades);
  const expectancy = trades.length ? totalPnl / trades.length : 0;

  const emotions = [...new Set(trades.map((trade) => trade.pre_emotion).filter(Boolean))] as string[];
  const emotionPerformance = emotions.map((emotion) => {
    const bucket = trades.filter((trade) => trade.pre_emotion === emotion);
    const avgPnl = bucket.length ? bucket.reduce((sum, trade) => sum + num(trade.pnl), 0) / bucket.length : 0;
    const rate = winRate(bucket);
    return { emotion, trades: bucket.length, winRate: rate, avgPnl, recommendation: recommendation(rate, avgPnl) };
  });

  return NextResponse.json({
    summary: {
      totalTrades: trades.length,
      winRate: winRate(trades),
      profitFactor: profitFactor(trades),
      avgRiskReward: avgRiskReward(trades),
      totalPnl,
      maxDrawdown: Math.abs(maxDrawdown),
    },
    equityCurve,
    winRateBySession: grouped(sessions, trades, (trade) => trade.session),
    winRateBySetup: grouped(setups, trades, (trade) => trade.setup_type),
    pairPerformance,
    hourlyHeatmap,
    dayOfWeek,
    advancedStats: {
      ...streakData,
      avgWinningTrade: winning.length ? winning.reduce((sum, value) => sum + value, 0) / winning.length : 0,
      avgLosingTrade: losing.length ? losing.reduce((sum, value) => sum + value, 0) / losing.length : 0,
      expectancy,
      largestSingleWin: Math.max(...winning, 0),
      largestSingleLoss: Math.min(...losing, 0),
      recoveryFactor: maxDrawdown ? totalPnl / Math.abs(maxDrawdown) : totalPnl > 0 ? totalPnl : 0,
    },
    emotionPerformance,
  });
}
