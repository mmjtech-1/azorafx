import Link from "next/link";
import { BarChart3, Bot, Brain, Check, ClipboardList, LineChart, ShieldCheck, Star, Target, Trophy } from "lucide-react";
import { LandingStats } from "@/components/landing/LandingStats";

const features = [
  { icon: ClipboardList, title: "Trade Journal", description: "Log every trade with emotion tracking and screenshots" },
  { icon: Bot, title: "AI Trade Review", description: "Get instant AI coaching on every trade you take" },
  { icon: BarChart3, title: "Performance Analytics", description: "Deep analytics that reveal your true edge" },
  { icon: LineChart, title: "Live Signals", description: "Real-time EMA bot signals across 6 major pairs" },
  { icon: Brain, title: "Psychology Tracker", description: "Track your mental state and find your best trading conditions" },
  { icon: Trophy, title: "Challenge Tracker", description: "Never break a prop firm rule again" },
];

const free = ["Trade Journal (20/month)", "3 AI Reviews", "High-impact Calendar only", "Basic Analytics (7 days)", "2 Signal pairs", "1 Challenge"];
const pro = ["Unlimited Trade Journal", "Unlimited AI Reviews", "Unlimited Calendar", "Unlimited Analytics", "Unlimited Signal pairs", "Unlimited Challenges"];

function PricingCard({ name, price, items, pro: isPro }: { name: string; price: string; items: string[]; pro?: boolean }) {
  return (
    <div className={`rounded-[16px] border bg-[#0E1117] p-6 ${isPro ? "border-[#00D68F]/50 shadow-[0_0_38px_rgba(0,214,143,0.18)]" : "border-white/15"}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-semibold text-white">{name}</h3>
        {isPro ? <span className="rounded-full bg-[#00D68F]/10 px-3 py-1 text-xs font-bold uppercase text-[#00D68F]">Most Popular</span> : null}
      </div>
      <p className="mt-4 text-4xl font-semibold text-white">{price}<span className="text-base text-slate-400">/month</span></p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm text-slate-300"><Check className="h-4 w-4 text-[#00D68F]" />{item}</li>
        ))}
      </ul>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="mx-auto mt-12 max-w-5xl rounded-[16px] border border-white/[0.08] bg-[#0E1117] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.5)]">
      <div className="grid gap-3 md:grid-cols-4">
        {["Balance", "Win Rate", "Avg R:R", "Drawdown"].map((label, index) => (
          <div key={label} className="rounded-xl border border-white/[0.06] bg-[#141820] p-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{["$52,840", "63%", "2.1", "4.8%"][index]}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[1.6fr_1fr]">
        <div className="h-48 rounded-xl border border-white/[0.06] bg-[linear-gradient(180deg,rgba(0,214,143,0.24),rgba(0,214,143,0.02))]" />
        <div className="space-y-3 rounded-xl border border-white/[0.06] bg-[#141820] p-4">
          {["EURUSD Long +$420", "XAUUSD Short -$120", "GBPJPY Long +$310"].map((trade) => (
            <div key={trade} className="rounded-lg bg-[#0E1117] px-3 py-2 text-sm text-slate-300">{trade}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <main className="bg-[#080B11] text-white">
      <section className="relative min-h-screen overflow-hidden px-4 py-20">
        <div className="landing-grid absolute inset-0 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,214,143,0.16),transparent_42rem)]" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00D68F]/20 bg-[#00D68F]/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D68F]">
            <ShieldCheck className="h-3.5 w-3.5" /> Azora FX
          </div>
          <h1 className="mx-auto mt-7 max-w-5xl text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">Trade Smarter. Think Clearer. Perform Better.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">The most advanced trading journal and analytics platform for serious forex and crypto traders</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="flex h-12 items-center justify-center rounded-xl bg-[#00D68F] px-6 text-sm font-semibold text-black" href="/register">Start Free Today</Link>
            <Link className="flex h-12 items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-semibold text-white" href="#features">See How It Works</Link>
          </div>
          <DashboardMockup />
        </div>
      </section>

      <section id="features" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold">Everything serious traders need</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-5 transition hover:-translate-y-1 hover:border-[#00D68F]/30">
                  <Icon className="h-6 w-6 text-[#00D68F]" />
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#00D68F]">Trusted by traders in 20+ countries</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Hamza Tariq", "I trade London session on gold, and the journal finally showed me how badly FOMO entries were affecting my results."],
              ["Omar Al-Farsi", "The prop firm tracker is simple but serious. I can see daily loss and max drawdown before I place another position."],
              ["Zainab Qureshi", "AI reviews helped me separate a valid forex setup from a trade I only took because price was moving fast."],
            ].map(([name, quote]) => (
              <div key={name} className="rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-5">
                <Star className="h-5 w-5 fill-[#00D68F] text-[#00D68F]" />
                <p className="mt-4 text-sm leading-6 text-slate-300">&quot;{quote}&quot;</p>
                <p className="mt-4 text-sm font-semibold">{name}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-5 text-center md:grid-cols-3">
            <p className="font-semibold text-white">Built for serious traders</p>
            <p className="font-semibold text-white">Prop firm ready</p>
            <p className="font-semibold text-white">AI-powered insights</p>
          </div>
          <LandingStats />
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-semibold">Choose your edge</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <PricingCard name="Free" price="$0" items={free} />
            <PricingCard name="Pro" price="$19" items={pro} pro />
          </div>
          <p className="mt-6 text-center text-sm text-slate-400">Binance Pay / PayPal / JazzCash / EasyPaisa / NayaPay / Bank Transfer</p>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-[#00D68F]">Azora FX</p>
            <p className="text-sm text-slate-400">Professional trading performance platform.</p>
            <p className="mt-2 text-xs text-slate-500">© {year} MMJ Technologies SMC Pvt Ltd</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <Link href="#features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
            <a href="https://azoraglobal.com">Part of Azora Global ecosystem</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
