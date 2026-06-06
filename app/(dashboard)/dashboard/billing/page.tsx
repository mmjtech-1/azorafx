import { CreditCard } from "lucide-react";
import type { Metadata } from "next";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: sub }, { data: usage }, { data: payments }] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", user?.id).maybeSingle(),
    supabase.from("usage_logs").select("*").eq("user_id", user?.id).eq("month_year", new Date().toISOString().slice(0, 7)).maybeSingle(),
    supabase.from("payments").select("*").eq("user_id", user?.id).order("created_at", { ascending: false }).limit(10),
  ]);
  const isPro = sub?.plan === "pro";
  return (
    <div className="space-y-6">
      <header className="border-b border-white/[0.06] pb-5">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#00D68F]/20 bg-[#00D68F]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D68F]"><CreditCard className="h-3.5 w-3.5" /> Billing</div>
        <h1 className="text-3xl font-semibold text-white">Subscription & Payments</h1>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[16px] border border-border bg-background-secondary p-5"><p className="text-xs uppercase tracking-[0.12em] text-foreground-tertiary">Current Plan</p><p className="mt-2 text-2xl font-semibold text-white">{isPro ? "PRO" : "FREE"}</p></div>
        <div className="rounded-[16px] border border-border bg-background-secondary p-5"><p className="text-xs uppercase tracking-[0.12em] text-foreground-tertiary">Period End</p><p className="mt-2 text-lg font-semibold text-white">{sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : "No active period"}</p></div>
        <div className="rounded-[16px] border border-border bg-background-secondary p-5"><p className="text-xs uppercase tracking-[0.12em] text-foreground-tertiary">Usage This Month</p><p className="mt-2 text-sm text-white">{usage?.trades_logged ?? 0} trades / {usage?.ai_reviews_used ?? 0} AI reviews</p></div>
      </section>
      {isPro ? <button className="h-10 rounded-xl border border-[#FF4757]/30 px-4 text-sm font-semibold text-[#FF8895]" type="button">Cancel</button> : null}
      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">Upgrade to Pro</h2>
        <PaymentMethodSelector />
      </section>
      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <h2 className="mb-4 text-xl font-semibold text-white">Payment History</h2>
        <div className="space-y-2">
          {(payments ?? []).map((payment) => <div key={payment.id} className="grid grid-cols-4 gap-3 rounded-xl bg-background-tertiary p-3 text-sm text-foreground-secondary"><span>{payment.method}</span><span>${payment.amount_usd}</span><span>{payment.status}</span><span>{new Date(payment.created_at).toLocaleDateString()}</span></div>)}
          {!payments?.length ? <p className="text-sm text-foreground-secondary">No payments yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
