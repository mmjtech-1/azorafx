"use client";

import { motion } from "framer-motion";
import { PlugZap } from "lucide-react";
import { useMemo, useState } from "react";
import { BrokerCard } from "@/components/connect/BrokerCard";
import { ConnectCryptoModal } from "@/components/connect/ConnectCryptoModal";
import { ConnectMT5Modal } from "@/components/connect/ConnectMT5Modal";
import { useConnectedAccounts, useDisconnectAccount, useSyncConnectedAccount } from "@/hooks/useConnectedAccounts";
import { brokerLabels, type BrokerType, type ConnectedAccount } from "@/types/connected-accounts";

const cryptoBrokers = [
  ["binance", "#F3BA2F"],
  ["bybit", "#F7931A"],
  ["okx", "#F8FAFC"],
  ["kucoin", "#00D68F"],
  ["gateio", "#2F80ED"],
] as const;
const mt5Brokers = [
  ["exness", "#00D68F"],
  ["xm", "#FF4757"],
  ["ftmo", "#1D4ED8"],
  ["icmarkets", "#2F80ED"],
  ["pepperstone", "#FF4757"],
  ["fundednext", "#A855F7"],
] as const;
const mt4Brokers = [["mt4_other", "#94A3B8"]] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 border-l-2 border-[#00D68F] pl-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

export default function ConnectPage() {
  const accountsQuery = useConnectedAccounts();
  const sync = useSyncConnectedAccount();
  const disconnect = useDisconnectAccount();
  const [cryptoBroker, setCryptoBroker] = useState<BrokerType | null>(null);
  const [mt5Broker, setMt5Broker] = useState<BrokerType | null>(null);
  const accounts = useMemo(() => accountsQuery.data?.accounts ?? [], [accountsQuery.data?.accounts]);
  const byBroker = useMemo(() => new Map(accounts.map((account) => [account.broker, account])), [accounts]);

  function card([broker, color]: readonly [BrokerType, string], type: "crypto" | "mt5" | "mt4") {
    const account = byBroker.get(broker) as ConnectedAccount | undefined;
    return (
      <BrokerCard
        key={broker}
        broker={broker}
        color={color}
        account={account}
        onConnect={() => (type === "crypto" ? setCryptoBroker(broker) : setMt5Broker(broker))}
        onSync={() => account && sync.mutate(account.id)}
        onDisconnect={() => account && disconnect.mutate(account.id)}
      />
    );
  }

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <header className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00D68F]/20 bg-[#00D68F]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D68F]">
          <PlugZap className="h-3.5 w-3.5" /> Auto Sync
        </div>
        <h1 className="text-3xl font-semibold text-white">Connect Your Trading Account</h1>
        <p className="mt-2 text-sm text-slate-400">Sync your trades automatically — no manual logging needed</p>
      </header>

      <Section title="Crypto Exchanges">{cryptoBrokers.map((item) => card(item, "crypto"))}</Section>
      <Section title="Forex / MT5 Brokers">{mt5Brokers.map((item) => card(item, "mt5"))}</Section>
      <Section title="MT4 Brokers">{mt4Brokers.map((item) => card(item, "mt4"))}</Section>

      <section className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-5">
        <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
        <div className="mt-4 space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#141820] p-3 text-sm">
              <span className="font-semibold text-white">{brokerLabels[account.broker]} · {account.nickname}</span>
              <span className="text-slate-400">{Number(account.account_balance ?? 0).toLocaleString()} {account.account_currency ?? "USD"} · {account.sync_status}</span>
            </div>
          ))}
          {!accounts.length ? <p className="text-sm text-slate-400">No accounts connected yet.</p> : null}
        </div>
      </section>

      <ConnectCryptoModal broker={cryptoBroker} onClose={() => setCryptoBroker(null)} />
      <ConnectMT5Modal broker={mt5Broker} onClose={() => setMt5Broker(null)} />
    </motion.div>
  );
}
