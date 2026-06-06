"use client";

import { Flame, ShieldAlert, Timer, Trophy } from "lucide-react";

type StatStripProps = {
  bestStreak: number;
  worstStreak: number;
  tradesThisMonth: number;
  avgHoldTime: string;
};

const itemClass = "flex min-w-[150px] items-center gap-3";
const iconClass = "h-9 w-9 rounded-full border border-border bg-background-tertiary p-2 text-accent";

export function StatStrip({ bestStreak, worstStreak, tradesThisMonth, avgHoldTime }: StatStripProps) {
  return (
    <section className="grid gap-4 rounded-[16px] border border-border bg-background-secondary p-5 sm:grid-cols-2 xl:grid-cols-4">
      <div className={itemClass}>
        <Trophy className={iconClass} />
        <div>
          <p className="text-xs text-foreground-secondary">Best streak</p>
          <p className="text-lg font-semibold text-foreground-primary">{bestStreak} wins</p>
        </div>
      </div>
      <div className={itemClass}>
        <ShieldAlert className={iconClass} />
        <div>
          <p className="text-xs text-foreground-secondary">Worst streak</p>
          <p className="text-lg font-semibold text-foreground-primary">{worstStreak} losses</p>
        </div>
      </div>
      <div className={itemClass}>
        <Flame className={iconClass} />
        <div>
          <p className="text-xs text-foreground-secondary">Trades this month</p>
          <p className="text-lg font-semibold text-foreground-primary">{tradesThisMonth}</p>
        </div>
      </div>
      <div className={itemClass}>
        <Timer className={iconClass} />
        <div>
          <p className="text-xs text-foreground-secondary">Avg hold time</p>
          <p className="text-lg font-semibold text-foreground-primary">{avgHoldTime}</p>
        </div>
      </div>
    </section>
  );
}
