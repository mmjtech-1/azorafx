import Link from "next/link";
import type { Metadata } from "next";
import { Check, HelpCircle } from "lucide-react";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose Free or Pro pricing for Azora FX, with PayPal, Binance Pay, and Pakistani payment methods.",
};

const free = ["20 trades/month", "3 AI reviews/month", "High-impact calendar only", "One challenge tracker", "Core dashboard"];
const pro = ["Unlimited trades", "Unlimited AI reviews", "All calendar impacts", "Multiple challenges", "Advanced analytics", "Signals and psychology insights"];

function PlanCard({ pro: isPro }: { pro?: boolean }) {
  const features = isPro ? pro : free;
  return (
    <div className={`rounded-[16px] border bg-[#0E1117] p-6 ${isPro ? "border-[#00D68F]/50 shadow-[0_0_36px_rgba(0,214,143,0.16)]" : "border-white/20"}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">{isPro ? "Pro" : "Free"}</h2>
        {isPro ? <span className="rounded-full bg-[#00D68F]/10 px-3 py-1 text-xs font-bold uppercase text-[#00D68F]">Most Popular</span> : null}
      </div>
      <p className="mt-4 text-4xl font-semibold text-white">{isPro ? "$19" : "$0"}<span className="text-base text-slate-400">/month</span></p>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-slate-300"><Check className="h-4 w-4 text-[#00D68F]" />{feature}</li>
        ))}
      </ul>
      <Link className={`mt-6 flex h-11 items-center justify-center rounded-xl text-sm font-semibold ${isPro ? "bg-[#00D68F] text-black" : "border border-white/15 text-white"}`} href={isPro ? "/dashboard/billing" : "/register"}>{isPro ? "Upgrade to Pro" : "Start Free"}</Link>
    </div>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#080B11] px-4 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl font-semibold">Simple Pricing</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">Start free, upgrade when Azora FX becomes part of your trading workflow.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <PlanCard />
          <PlanCard pro />
        </div>
        <section className="mt-10 rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-6">
          <h2 className="mb-5 text-xl font-semibold">Payment Methods</h2>
          <PaymentMethodSelector />
        </section>
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["How does billing work?", "Pro is $19/month. PayPal is recurring; local and crypto payments are reviewed manually."],
            ["Can I cancel?", "Yes. PayPal subscriptions can be cancelled and manual payments simply expire at period end."],
            ["Do you support Pakistani payments?", "Yes. JazzCash, EasyPaisa, NayaPay, bank transfer, and Binance Pay are supported."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-5">
              <HelpCircle className="mb-3 h-5 w-5 text-[#00D68F]" />
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-2 text-sm text-slate-400">{a}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
