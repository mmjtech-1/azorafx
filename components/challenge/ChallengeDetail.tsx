"use client";

import { useState } from "react";
import { Check, Edit3, X } from "lucide-react";
import { AlertBanner } from "@/components/challenge/AlertBanner";
import { ProgressBar } from "@/components/challenge/ProgressBar";
import { RulesChecklist } from "@/components/challenge/RulesChecklist";
import { SnapshotChart } from "@/components/challenge/SnapshotChart";
import { useAddSnapshot, useUpdateChallenge } from "@/hooks/useChallenges";
import { cn } from "@/lib/utils";
import { challengeProgress, daysRemaining, firmLabel, money, phaseLabel, type Challenge } from "@/types/challenges";

const statusClass = {
  active: "bg-[#00D68F]/10 text-[#00D68F]",
  at_risk: "bg-amber-400/10 text-amber-200",
  passed: "bg-sky-400/10 text-sky-200",
  failed: "bg-[#FF4757]/10 text-[#FF8895]",
};

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-[16px] border border-border bg-background-secondary p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-tertiary">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold text-white", accent)}>{value}</p>
    </div>
  );
}

function resetCountdown() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const total = Math.max(0, end.getTime() - now.getTime());
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function ChallengeDetail({ challenge }: { challenge: Challenge }) {
  const update = useUpdateChallenge();
  const addSnapshot = useAddSnapshot();
  const [dailyPnl, setDailyPnl] = useState("");
  const [tradesCount, setTradesCount] = useState("");
  const p = challengeProgress(challenge);
  const days = daysRemaining(challenge);

  async function mark(status: "passed" | "failed") {
    await update.mutateAsync({ id: challenge.id, input: { status, completed_at: new Date().toISOString() } });
  }

  async function saveSnapshot() {
    await addSnapshot.mutateAsync({ id: challenge.id, input: { daily_pnl: Number(dailyPnl), trades_count: tradesCount ? Number(tradesCount) : null } });
    setDailyPnl("");
    setTradesCount("");
  }

  return (
    <div className="space-y-6">
      <AlertBanner challenge={challenge} />
      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold text-white">{firmLabel(challenge)}</h1>
              <span className="rounded-full bg-background-tertiary px-2 py-1 text-xs font-semibold text-foreground-secondary">{phaseLabel(challenge.phase)}</span>
              <span className={cn("rounded-full px-2 py-1 text-xs font-bold uppercase", statusClass[p.status])}>{p.status.replace("_", " ")}</span>
            </div>
            <p className="mt-2 text-sm text-foreground-secondary">${money(challenge.account_size).toLocaleString()} account started {challenge.started_at}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm text-foreground-secondary" type="button"><Edit3 className="h-4 w-4" />Edit</button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky-400/30 px-3 text-sm text-sky-200" type="button" onClick={() => mark("passed")}><Check className="h-4 w-4" />Mark as Passed</button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#FF4757]/30 px-3 text-sm text-[#FF8895]" type="button" onClick={() => mark("failed")}><X className="h-4 w-4" />Mark as Failed</button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Current Balance" value={`$${p.balance.toLocaleString()}`} />
        <Metric label="Today P&L" value={`$${money(challenge.latest_snapshot?.daily_pnl ?? 0).toLocaleString()}`} accent={money(challenge.latest_snapshot?.daily_pnl) >= 0 ? "text-[#00D68F]" : "text-[#FF8895]"} />
        <Metric label="Days Remaining" value={days === null ? "No deadline" : String(Math.max(days, 0))} />
        <Metric label="Overall Status" value={p.status.replace("_", " ").toUpperCase()} accent={p.status === "at_risk" ? "text-amber-200" : p.status === "failed" ? "text-[#FF8895]" : "text-[#00D68F]"} />
      </div>

      <section className="space-y-6 rounded-[16px] border border-border bg-background-secondary p-5">
        <h2 className="border-l-2 border-[#00D68F] pl-3 text-lg font-semibold text-white">Progress</h2>
        <ProgressBar value={p.currentPnl} max={p.target} label={`Profit Target (${challenge.profit_target_percent}% = $${p.target.toLocaleString()})`} sublabel={`$${Math.max(p.currentPnl, 0).toFixed(0)} earned / $${Math.max(p.target - p.currentPnl, 0).toFixed(0)} remaining to pass`} colorMode="profit" />
        <ProgressBar value={p.dailyUsed} max={p.dailyLimit} label="Daily Loss Limit" sublabel={`Resets in: ${resetCountdown()} / $${p.dailyUsed.toFixed(0)} used of $${p.dailyLimit.toFixed(0)} limit today`} colorMode="loss" />
        <ProgressBar value={p.drawdownUsed} max={p.maxDrawdown} label="Max Drawdown" sublabel={`Never resets - $${p.drawdownUsed.toFixed(0)} used of $${p.maxDrawdown.toFixed(0)} maximum`} colorMode="drawdown" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <SnapshotChart challenge={challenge} />
        <section className="rounded-[16px] border border-border bg-background-secondary p-5">
          <h2 className="border-l-2 border-[#00D68F] pl-3 text-lg font-semibold text-white">Add Daily Snapshot</h2>
          <div className="mt-4 space-y-3">
            <input className="h-11 w-full rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" type="number" placeholder="Daily P&L" value={dailyPnl} onChange={(event) => setDailyPnl(event.target.value)} />
            <input className="h-11 w-full rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" type="number" placeholder="Trades count" value={tradesCount} onChange={(event) => setTradesCount(event.target.value)} />
            <button className="h-11 w-full rounded-xl bg-[#00D68F] text-sm font-semibold text-black" type="button" onClick={saveSnapshot} disabled={!dailyPnl || addSnapshot.isPending}>Save Snapshot</button>
          </div>
        </section>
      </div>

      {p.risk >= 70 ? <div className="rounded-[16px] border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">One or more challenge rules are at risk. Reduce position size and avoid revenge trading.</div> : null}
      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <h2 className="mb-4 border-l-2 border-[#00D68F] pl-3 text-lg font-semibold text-white">Rules Compliance</h2>
        <RulesChecklist challenge={challenge} />
      </section>
    </div>
  );
}
