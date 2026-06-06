"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const pkrAmount = 19 * 280;

const details: Record<string, string> = {
  jazzcash: "Send $19 to 03XX-XXXXXXX (Account name: Muhammad Mouazam)",
  easypaisa: "Send $19 equivalent to 03XX-XXXXXXX",
  nayapay: "Send to @azoraglobal",
  bank: "Account: XXXX, Bank: XXXX, Title: MMJ Technologies",
  binance: "Binance ID: XXXXXXX or scan QR code",
};

export function ManualPaymentForm({ method }: { method: string }) {
  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isPakistanMethod = ["jazzcash", "easypaisa", "nayapay", "bank"].includes(method);

  async function submit() {
    setLoading(true);
    let screenshotUrl = "";
    if (file) {
      const supabase = createClient();
      const path = `manual-payments/${Date.now()}-${file.name}`;
      const { data } = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: true });
      screenshotUrl = data?.path ?? "";
    }
    const response = await fetch("/api/billing/manual-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, transaction_id: transactionId, screenshot_url: screenshotUrl, amount_usd: 19, amount_pkr: isPakistanMethod ? pkrAmount : null }),
    });
    setLoading(false);
    if (response.ok) {
      toast.success("📨 Payment proof submitted — activation within 2-4 hours");
      setMessage("Payment submitted! We will activate your account within 2-4 hours.");
    } else {
      toast.error("Unable to submit payment proof. Please try again.");
      setMessage("Unable to submit payment proof. Please try again.");
    }
  }

  return (
    <div className="mt-4 rounded-[16px] border border-border bg-background-tertiary p-4">
      <p className="text-sm font-semibold text-white">{details[method] ?? details.bank}</p>
      {isPakistanMethod ? <p className="mt-2 text-sm text-[#00D68F]">Amount: PKR {pkrAmount.toLocaleString()} at $1 = PKR 280</p> : null}
      <div className="mt-4 space-y-3">
        <input className="h-11 w-full rounded-xl border border-border bg-[#141820] px-3 text-sm text-white outline-none" placeholder="Transaction ID" value={transactionId} onChange={(event) => setTransactionId(event.target.value)} />
        <input className="w-full rounded-xl border border-border bg-[#141820] p-3 text-sm text-foreground-secondary" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button className="h-11 w-full rounded-xl bg-[#00D68F] text-sm font-semibold text-black" type="button" disabled={loading} onClick={submit}>Submit Payment Proof</button>
      </div>
      {message ? <p className="mt-3 text-sm text-[#00D68F]">{message}</p> : null}
    </div>
  );
}
