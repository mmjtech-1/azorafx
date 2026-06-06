"use client";

import { useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { AddChallengeForm } from "@/components/challenge/AddChallengeForm";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { useChallengesList } from "@/hooks/useChallenges";

export default function ChallengePage() {
  const query = useChallengesList();
  const { subscription } = useDashboard();
  const [open, setOpen] = useState(false);
  const challenges = query.data?.challenges ?? [];

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00D68F]/20 bg-[#00D68F]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D68F]">
            <Trophy className="h-3.5 w-3.5" />
            Prop Firm Rules
          </div>
          <h1 className="text-3xl font-semibold text-white">Challenge Tracker</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground-secondary">Monitor funded account rules, deadlines, drawdown, and daily loss limits in one place.</p>
        </div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#00D68F] px-4 text-sm font-semibold text-black" type="button" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Challenge
        </button>
      </motion.header>

      {query.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-[16px] border border-border bg-background-secondary" />)}
        </div>
      ) : challenges.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {challenges.map((challenge, index) => (
            <motion.div key={challenge.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <ChallengeCard challenge={challenge} />
            </motion.div>
          ))}
        </div>
      ) : (
        <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[16px] border border-dashed border-border bg-background-secondary p-8 text-center">
          <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#00D68F]/25 bg-[#00D68F]/10 text-[#00D68F] shadow-[0_0_32px_rgba(0,214,143,0.16)]">
            <Trophy className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-semibold text-white">Add your first prop firm challenge</h2>
          <p className="mt-2 max-w-md text-sm text-foreground-secondary">Set your firm rules once and Azora FX will keep the risky parts visible while you trade.</p>
          <button className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#00D68F] px-4 text-sm font-semibold text-black" type="button" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add Challenge
          </button>
        </section>
      )}

      <AddChallengeForm open={open} onClose={() => setOpen(false)} existingCount={challenges.length} isFree={subscription.plan === "free"} />
    </div>
  );
}

