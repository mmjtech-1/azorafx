"use client";

import { useMemo, useState } from "react";
import { Bot, RefreshCw, Settings } from "lucide-react";
import { SignalCard } from "@/components/signals/SignalCard";
import { SignalConfigDrawer } from "@/components/signals/SignalConfigDrawer";
import { SignalHistory } from "@/components/signals/SignalHistory";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { useGenerateSignals, useSignals } from "@/hooks/useSignals";
import type { Signal } from "@/types/signals";

export default function SignalsPage() {
  const { subscription } = useDashboard();
  const signalsQuery = useSignals();
  const generateSignals = useGenerateSignals();
  const [configOpen, setConfigOpen] = useState(false);
  const [ignored, setIgnored] = useState<string[]>([]);
  const isPro = subscription.plan === "pro";
  const signals = useMemo(
    () => (signalsQuery.data?.signals ?? []).filter((signal) => !ignored.includes(signal.pair)),
    [signalsQuery.data?.signals, ignored],
  );
  const history = (signalsQuery.data?.history ?? signals) as Signal[];

  return (
    <div className="space-y-6">
      <SignalConfigDrawer open={configOpen} onClose={() => setConfigOpen(false)} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground-primary">Live Signals</h2>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-secondary">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background-secondary px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              Bot Active
            </span>
            <span>Last updated {signalsQuery.lastUpdatedLabel}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border px-3 text-sm text-foreground-secondary hover:border-border-accent hover:text-accent"
            type="button"
            onClick={() => setConfigOpen(true)}
          >
            <Settings className="h-4 w-4" />
            Configure Strategy
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-accent px-3 text-sm font-semibold text-black"
            type="button"
            onClick={() => generateSignals.mutate()}
          >
            {generateSignals.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            Generate New Signals
          </button>
        </div>
      </div>

      {signalsQuery.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-[16px] bg-background-secondary" />
          ))}
        </div>
      ) : signalsQuery.error ? (
        <div className="rounded-[12px] border border-loss/30 bg-loss/10 p-4 text-sm text-loss">
          {signalsQuery.error.message}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {signals.map((signal, index) => (
            <SignalCard
              key={`${signal.pair}-${signal.generated_at}`}
              signal={signal}
              locked={!isPro && index > 1}
              onIgnore={() => setIgnored((current) => [...current, signal.pair])}
            />
          ))}
        </div>
      )}

      <SignalHistory signals={history} />
    </div>
  );
}
