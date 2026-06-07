"use client";

import { CheckCircle2, Plug, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { brokerLabels, type BrokerType, type ConnectedAccount } from "@/types/connected-accounts";

export function BrokerCard({
  broker,
  color,
  account,
  onConnect,
  onSync,
  onDisconnect,
}: {
  broker: BrokerType;
  color: string;
  account?: ConnectedAccount;
  onConnect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
}) {
  const connected = Boolean(account);
  return (
    <article
      className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-4 transition hover:border-[#00D68F]/35 hover:shadow-[0_0_24px_rgba(0,214,143,0.12)]"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-[#141820] text-sm font-black" style={{ color }}>
            {brokerLabels[broker].slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white">{brokerLabels[broker]}</h3>
            <p className="text-xs text-slate-500">{account?.nickname ?? "Read-only sync"}</p>
          </div>
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#00D68F]/10 px-2 py-1 text-xs font-semibold text-[#00D68F]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Connected
          </span>
        ) : null}
      </div>
      <div className={cn("mt-4 flex gap-2", connected && "grid grid-cols-2")}>
        {connected ? (
          <>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#00D68F] px-3 text-xs font-semibold text-black" type="button" onClick={onSync}>
              <RefreshCw className="h-3.5 w-3.5" /> Sync Now
            </button>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#FF4757]/30 px-3 text-xs font-semibold text-[#FF8895]" type="button" onClick={onDisconnect}>
              <Trash2 className="h-3.5 w-3.5" /> Disconnect
            </button>
          </>
        ) : (
          <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#00D68F] px-3 text-xs font-semibold text-black" type="button" onClick={onConnect}>
            <Plug className="h-3.5 w-3.5" /> Connect
          </button>
        )}
      </div>
    </article>
  );
}

