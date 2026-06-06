"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/challenge/ProgressBar";
import { challengeProgress, daysRemaining, firmLabel, money, phaseLabel, type Challenge } from "@/types/challenges";

const statusStyles = {
  active: "bg-[#00D68F]/10 text-[#00D68F]",
  at_risk: "bg-amber-400/10 text-amber-200",
  passed: "bg-sky-400/10 text-sky-200",
  failed: "bg-[#FF4757]/10 text-[#FF8895]",
};

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = challengeProgress(challenge);
  const days = daysRemaining(challenge);
  const glow = progress.risk >= 90 ? "border-[#FF4757]/50 shadow-[0_0_24px_rgba(255,71,87,0.18)]" : progress.risk >= 70 ? "border-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.14)]" : "border-border";

  return (
    <article className={cn("rounded-[16px] border bg-background-secondary p-5 transition hover:border-border-strong", glow)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{firmLabel(challenge)}</h2>
          <p className="mt-1 text-sm text-foreground-secondary">${money(challenge.account_size).toLocaleString()} account</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-background-tertiary px-2 py-1 text-xs font-semibold text-foreground-secondary">{phaseLabel(challenge.phase)}</span>
          <span className={cn("rounded-full px-2 py-1 text-xs font-bold uppercase", statusStyles[progress.status])}>{progress.status.replace("_", " ")}</span>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <ProgressBar value={progress.currentPnl} max={progress.target} label="Profit Target" sublabel={`$${progress.currentPnl.toFixed(0)} of $${progress.target.toFixed(0)}`} colorMode="profit" />
        <ProgressBar value={progress.dailyUsed} max={progress.dailyLimit} label="Daily Loss" sublabel={`$${progress.dailyUsed.toFixed(0)} used`} colorMode="loss" />
        <ProgressBar value={progress.drawdownUsed} max={progress.maxDrawdown} label="Max Drawdown" sublabel={`$${progress.drawdownUsed.toFixed(0)} used`} colorMode="drawdown" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className={cn("text-sm font-semibold", days === null || days > 7 ? "text-[#00D68F]" : days >= 3 ? "text-amber-200" : "text-[#FF8895]")}>
          {days === null ? "No deadline" : `${Math.max(days, 0)} days remaining`}
        </span>
        <Link className="inline-flex items-center gap-1 text-sm font-semibold text-[#00D68F]" href={`/dashboard/challenge/${challenge.id}`}>
          View Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

