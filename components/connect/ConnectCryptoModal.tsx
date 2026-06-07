"use client";

import { motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useConnectCryptoAccount } from "@/hooks/useConnectedAccounts";
import { brokerLabels, type BrokerType } from "@/types/connected-accounts";

const instructions: Partial<Record<BrokerType, string>> = {
  binance: "Go to Binance → Profile → API Management → Create API → Enable Read Only permissions → Copy API Key and Secret",
  bybit: "Go to Bybit → Account & Security → API → Create New Key → Select Read-Only → Copy API Key and Secret",
  okx: "Go to OKX → Profile → API → Create V5 API Key → Enable Read permissions only → Copy API Key and Secret",
  kucoin: "Go to KuCoin → API Management → Create API → Enable General read-only permissions → Copy API Key and Secret",
  gateio: "Go to Gate.io → API Management → Create API Key → Enable read-only spot/futures history → Copy API Key and Secret",
};

export function ConnectCryptoModal({ broker, onClose }: { broker: BrokerType | null; onClose: () => void }) {
  const connect = useConnectCryptoAccount();
  const [form, setForm] = useState({ api_key: "", api_secret: "", nickname: "" });
  if (!broker) return null;
  const selectedBroker = broker;

  async function submit() {
    await connect.mutateAsync({ broker: selectedBroker, ...form });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Connect {brokerLabels[selectedBroker]}</h2>
            <p className="mt-1 text-sm text-slate-400">Step 1: Create read-only API keys.</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-slate-400" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 rounded-xl border border-[#00D68F]/20 bg-[#00D68F]/5 p-4 text-sm leading-6 text-slate-200">{instructions[selectedBroker]}</div>
        <div className="mt-5 grid gap-3">
          <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="API Key" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} />
          <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="API Secret" type="password" value={form.api_secret} onChange={(e) => setForm({ ...form, api_secret: e.target.value })} />
          <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="Account nickname" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
        </div>
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#00D68F]/20 bg-[#00D68F]/5 p-3 text-sm text-[#B8FFE7]"><ShieldCheck className="h-4 w-4" /> Read-only access only — we can never place trades or withdraw funds.</p>
        <button className="mt-5 h-11 w-full rounded-xl bg-[#00D68F] font-semibold text-black" type="button" onClick={submit} disabled={connect.isPending}>
          {connect.isPending ? "Testing connection..." : "Connect Account"}
        </button>
      </motion.div>
    </div>
  );
}
