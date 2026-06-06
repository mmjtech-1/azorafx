"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { challengeProgress, money, type Challenge } from "@/types/challenges";

export function SnapshotChart({ challenge }: { challenge: Challenge }) {
  const progress = challengeProgress(challenge);
  const snapshots = challenge.snapshots?.length
    ? challenge.snapshots
    : [
        { snapshot_date: challenge.started_at, balance: challenge.account_size, daily_pnl: 0 },
        { snapshot_date: new Date().toISOString().slice(0, 10), balance: challenge.current_balance ?? challenge.account_size, daily_pnl: challenge.current_pnl ?? 0 },
      ];
  const data = snapshots.map((snapshot) => ({
    date: snapshot.snapshot_date,
    balance: money(snapshot.balance),
    pnl: money(snapshot.daily_pnl),
  }));
  const targetLevel = progress.account + progress.target;
  const drawdownLevel = progress.account - progress.maxDrawdown;

  return (
    <div className="h-80 rounded-[16px] border border-border bg-background-secondary p-5">
      <h2 className="border-l-2 border-[#00D68F] pl-3 text-lg font-semibold text-white">Balance Snapshot</h2>
      <div className="mt-4 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="challengeBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D68F" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={58} />
            <Tooltip contentStyle={{ background: "#0E1117", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name === "balance" ? "Balance" : "Daily P&L"]} />
            <ReferenceLine y={targetLevel} stroke="#00D68F" strokeDasharray="6 6" />
            <ReferenceLine y={drawdownLevel} stroke="#FF4757" strokeDasharray="6 6" />
            <Area type="monotone" dataKey="balance" stroke="#00D68F" strokeWidth={2} fill="url(#challengeBalance)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
