"use client";

import { useState } from "react";
import { Banknote, Coins, CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { ManualPaymentForm } from "@/components/billing/ManualPaymentForm";

const methods = [
  { id: "binance", name: "Binance Pay", icon: Coins, recommended: true },
  { id: "paypal", name: "PayPal", icon: CreditCard },
  { id: "jazzcash", name: "JazzCash", icon: Smartphone, recommended: true },
  { id: "easypaisa", name: "EasyPaisa", icon: Wallet },
  { id: "nayapay", name: "NayaPay", icon: Banknote },
  { id: "bank", name: "Bank Transfer", icon: Landmark },
];

export function PaymentMethodSelector() {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  async function choose(id: string) {
    setSelected(id);
    if (id !== "paypal") return;
    setLoading(true);
    const response = await fetch("/api/billing/paypal/create-subscription", { method: "POST" });
    const payload = await response.json();
    setLoading(false);
    if (payload.approvalUrl) window.location.href = payload.approvalUrl;
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {methods.map((method) => {
          const Icon = method.icon;
          return (
            <button key={method.id} type="button" className={cn("relative rounded-[16px] border border-border bg-background-secondary p-4 text-left transition hover:border-border-strong", selected === method.id && "border-[#00D68F]/50 bg-[#00D68F]/5")} onClick={() => choose(method.id)}>
              {method.recommended ? <span className="absolute right-3 top-3 rounded-full bg-[#00D68F]/10 px-2 py-1 text-[10px] font-bold uppercase text-[#00D68F]">Recommended</span> : null}
              <Icon className="h-6 w-6 text-[#00D68F]" />
              <p className="mt-3 font-semibold text-white">{method.name}</p>
            </button>
          );
        })}
      </div>
      {loading ? <p className="mt-4 text-sm text-foreground-secondary">Redirecting to PayPal...</p> : null}
      {selected && selected !== "paypal" ? <ManualPaymentForm method={selected} /> : null}
    </div>
  );
}

