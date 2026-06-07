"use client";

import { motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useState } from "react";
import { useConnectMT5Account } from "@/hooks/useConnectedAccounts";
import { brokerLabels, type BrokerType } from "@/types/connected-accounts";

const serverDefaults: Partial<Record<BrokerType, string>> = {
  exness: "Exness-MT5Real",
  xm: "XMGlobal-MT5 8",
  ftmo: "FTMO-MT5",
  icmarkets: "ICMarketsSC-MT5",
  pepperstone: "Pepperstone-MT5",
  fundednext: "FundedNext-MT5",
};

export function ConnectMT5Modal({ broker, onClose }: { broker: BrokerType | null; onClose: () => void }) {
  const connect = useConnectMT5Account();
  const [form, setForm] = useState({ mt_login: "", mt_password: "", mt_server: "", nickname: "" });
  if (!broker) return null;
  const selectedBroker = broker;
  const server = form.mt_server || serverDefaults[selectedBroker] || "";

  async function submit() {
    await connect.mutateAsync({ broker: selectedBroker, ...form, mt_server: server });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Connect {brokerLabels[selectedBroker]}</h2>
            <p className="mt-1 text-sm text-slate-400">Enter your MT5 login credentials. We use MetaAPI to securely connect to your account.</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] text-slate-400" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5 grid gap-3">
          <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="MT5 Login" type="number" value={form.mt_login} onChange={(e) => setForm({ ...form, mt_login: e.target.value })} />
          <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="MT5 Password" type="password" value={form.mt_password} onChange={(e) => setForm({ ...form, mt_password: e.target.value })} />
          <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="Server name" value={server} onChange={(e) => setForm({ ...form, mt_server: e.target.value })} />
          <input className="h-11 rounded-xl border border-white/[0.06] bg-[#141820] px-3 text-sm text-white outline-none focus:border-[#00D68F]" placeholder="Account nickname" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
        </div>
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#00D68F]/20 bg-[#00D68F]/5 p-3 text-sm text-[#B8FFE7]"><Lock className="h-4 w-4" /> Your credentials are encrypted and never stored in plain text.</p>
        <button className="mt-5 h-11 w-full rounded-xl bg-[#00D68F] font-semibold text-black" type="button" onClick={submit} disabled={connect.isPending}>
          {connect.isPending ? "Connecting..." : "Connect Account"}
        </button>
      </motion.div>
    </div>
  );
}
