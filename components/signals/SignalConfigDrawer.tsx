"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSignalConfig, useUpdateSignalConfig } from "@/hooks/useSignals";
import { defaultSignalConfig, type SignalConfig } from "@/types/signals";

const pairs = ["EURUSD", "GBPUSD", "GBPJPY", "USDJPY", "XAUUSD", "BTCUSD"];
const inputClass = "mt-2 h-10 w-full rounded-[10px] border border-border bg-[#141820] px-3 text-sm outline-none focus:border-border-accent";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.6px] text-foreground-tertiary";

export function SignalConfigDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const configQuery = useSignalConfig();
  const updateConfig = useUpdateSignalConfig();
  const [config, setConfig] = useState<SignalConfig>(defaultSignalConfig);

  useEffect(() => {
    if (configQuery.data) setConfig(configQuery.data);
  }, [configQuery.data]);

  if (!open) return null;

  function setNumber(key: keyof SignalConfig, value: string) {
    setConfig((current) => ({ ...current, [key]: Number(value) }));
  }

  function togglePair(pair: string) {
    setConfig((current) => ({
      ...current,
      monitored_pairs: current.monitored_pairs.includes(pair)
        ? current.monitored_pairs.filter((item) => item !== pair)
        : [...current.monitored_pairs, pair],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <aside className="h-full w-full max-w-[480px] overflow-y-auto border-l border-border bg-[#0E1117] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Configure Strategy</h2>
          <button className="rounded-full border border-border p-2" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["ema_fast", "EMA Fast"],
            ["ema_slow", "EMA Slow"],
            ["ema_trend", "EMA Trend"],
            ["rsi_period", "RSI Period"],
            ["adx_min", "ADX Minimum"],
            ["risk_per_trade", "Risk / Trade %"],
            ["leverage", "Leverage"],
          ].map(([key, label]) => (
            <label key={key}>
              <span className={labelClass}>{label}</span>
              <input className={inputClass} type="number" value={config[key as keyof SignalConfig] as number} onChange={(e) => setNumber(key as keyof SignalConfig, e.target.value)} />
            </label>
          ))}
          <label>
            <span className={labelClass}>Trend Timeframe</span>
            <select className={inputClass} value={config.trend_timeframe} onChange={(e) => setConfig((c) => ({ ...c, trend_timeframe: e.target.value }))}>
              {["1H", "4H", "Daily"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span className={labelClass}>Signal Timeframe</span>
            <select className={inputClass} value={config.signal_timeframe} onChange={(e) => setConfig((c) => ({ ...c, signal_timeframe: e.target.value }))}>
              {["5m", "15m", "1H"].map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-6">
          <span className={labelClass}>Monitored Pairs</span>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {pairs.map((pair) => (
              <label key={pair} className="flex items-center gap-2 rounded-[10px] border border-border bg-[#141820] px-3 py-2 text-sm">
                <input checked={config.monitored_pairs.includes(pair)} type="checkbox" onChange={() => togglePair(pair)} />
                {pair}
              </label>
            ))}
          </div>
        </div>
        <button
          className="mt-6 h-11 w-full rounded-[10px] bg-accent text-sm font-semibold text-black"
          type="button"
          onClick={async () => {
            await updateConfig.mutateAsync(config);
            onClose();
          }}
        >
          {updateConfig.isPending ? "Saving..." : "Save Strategy"}
        </button>
      </aside>
    </div>
  );
}
