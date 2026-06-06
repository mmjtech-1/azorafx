"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { useCreateChallenge } from "@/hooks/useChallenges";
import type { ChallengeInput } from "@/types/challenges";

const firms = [
  ["ftmo", "FTMO"],
  ["fundednext", "FundedNext"],
  ["apex", "Apex Trader"],
  ["the5ers", "The5ers"],
  ["alpha_capital", "Alpha Capital"],
  ["e8funding", "E8 Funding"],
  ["topstep", "TopStep"],
  ["other", "Other"],
] as const;

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-[16px] border border-border bg-[#0E1117] p-6">
        <h2 className="text-xl font-semibold text-white">Free plan includes one active challenge</h2>
        <p className="mt-2 text-sm text-foreground-secondary">Upgrade to Pro to track multiple prop firm challenges at once.</p>
        <div className="mt-6 flex gap-3">
          <button className="h-10 flex-1 rounded-[10px] border border-border text-sm text-foreground-secondary" type="button" onClick={onClose}>Not now</button>
          <Link className="flex h-10 flex-1 items-center justify-center rounded-[10px] bg-[#00D68F] text-sm font-semibold text-black" href="/pricing">Upgrade to Pro</Link>
        </div>
      </div>
    </div>
  );
}

export function AddChallengeForm({
  open,
  onClose,
  existingCount,
  isFree,
}: {
  open: boolean;
  onClose: () => void;
  existingCount: number;
  isFree: boolean;
}) {
  const create = useCreateChallenge();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [form, setForm] = useState<ChallengeInput>({
    firm_name: "ftmo",
    custom_firm_name: "",
    account_size: 10000,
    phase: "phase1",
    profit_target_percent: 8,
    daily_loss_limit_percent: 5,
    max_drawdown_percent: 10,
    min_trading_days: 4,
    max_trading_days: 30,
    no_weekend_holding: true,
    no_news_trading: true,
    max_lot_size: null,
    started_at: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const previews = useMemo(
    () => ({
      target: (Number(form.account_size) * Number(form.profit_target_percent)) / 100,
      daily: (Number(form.account_size) * Number(form.daily_loss_limit_percent)) / 100,
      drawdown: (Number(form.account_size) * Number(form.max_drawdown_percent)) / 100,
    }),
    [form],
  );

  if (!open) return showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null;

  async function submit() {
    if (isFree && existingCount >= 1) {
      setShowUpgrade(true);
      return;
    }
    await create.mutateAsync(form);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
        <div className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-[#0E1117] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Add Prop Firm Challenge</h2>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground-secondary" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
          <div className="space-y-5">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-foreground-tertiary">Prop Firm</label>
            <select className="h-11 w-full rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" value={form.firm_name} onChange={(e) => setForm({ ...form, firm_name: e.target.value as ChallengeInput["firm_name"] })}>
              {firms.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            {form.firm_name === "other" ? <input className="h-11 w-full rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" placeholder="Custom firm name" value={form.custom_firm_name ?? ""} onChange={(e) => setForm({ ...form, custom_firm_name: e.target.value })} /> : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <input className="h-11 rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" type="number" value={form.account_size} onChange={(e) => setForm({ ...form, account_size: Number(e.target.value) })} />
              <select className="h-11 rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value as ChallengeInput["phase"] })}>
                <option value="phase1">Phase 1</option>
                <option value="phase2">Phase 2</option>
                <option value="funded">Funded</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["profit_target_percent", "Profit target %", previews.target],
                ["daily_loss_limit_percent", "Daily loss %", previews.daily],
                ["max_drawdown_percent", "Max drawdown %", previews.drawdown],
              ].map(([key, label, preview]) => (
                <label key={key as string} className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-tertiary">{label as string}</span>
                  <input className="mt-2 h-11 w-full rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" type="number" value={Number(form[key as keyof ChallengeInput])} onChange={(e) => setForm({ ...form, [key as string]: Number(e.target.value) })} />
                  <span className="mt-1 block text-xs text-[#00D68F]">= ${Number(preview).toLocaleString()}</span>
                </label>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <input className="h-11 rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" type="number" placeholder="Min trading days" value={form.min_trading_days} onChange={(e) => setForm({ ...form, min_trading_days: Number(e.target.value) })} />
              <input className="h-11 rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" type="number" placeholder="Max trading days" value={form.max_trading_days ?? ""} onChange={(e) => setForm({ ...form, max_trading_days: Number(e.target.value) })} />
              <input className="h-11 rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" type="date" value={form.started_at} onChange={(e) => setForm({ ...form, started_at: e.target.value })} />
            </div>

            <div className="space-y-2">
              {[
                ["no_weekend_holding", "No weekend holding"],
                ["no_news_trading", "No news trading"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 text-sm text-foreground-secondary">
                  <input type="checkbox" checked={Boolean(form[key as keyof ChallengeInput])} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />
                  {label}
                </label>
              ))}
              <label className="flex items-center gap-3 text-sm text-foreground-secondary"><input type="checkbox" /> EAs allowed</label>
            </div>

            <textarea className="min-h-24 w-full rounded-xl border border-border bg-[#141820] p-3 text-sm text-white outline-none" placeholder="Notes" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00D68F] font-semibold text-black" type="button" onClick={submit} disabled={create.isPending}>
              <Plus className="h-4 w-4" /> Create Challenge
            </button>
          </div>
        </div>
      </div>
      {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
    </>
  );
}
