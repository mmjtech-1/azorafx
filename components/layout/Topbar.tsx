"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useDashboard } from "@/components/layout/DashboardProvider";

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Your trading command center.",
  },
  "/dashboard/journal": {
    title: "Trade Journal",
    subtitle: "Log, review, and refine every trade.",
  },
  "/dashboard/analytics": {
    title: "Analytics",
    subtitle: "Performance patterns and edge quality.",
  },
  "/dashboard/signals": {
    title: "Signals",
    subtitle: "Live strategy monitoring.",
  },
  "/dashboard/psychology": {
    title: "Psychology",
    subtitle: "Mental state and discipline tracking.",
  },
  "/dashboard/ai-review": {
    title: "AI Review",
    subtitle: "Structured feedback for your setups.",
  },
  "/dashboard/calendar": {
    title: "Economic Calendar",
    subtitle: "Market-moving events and trade windows.",
  },
  "/dashboard/challenge": {
    title: "Challenge Tracker",
    subtitle: "Prop firm rules, targets, and risk limits.",
  },
  "/dashboard/connect": {
    title: "Connect Account",
    subtitle: "Auto-import trades from brokers and exchanges.",
  },
  "/dashboard/billing": {
    title: "Billing",
    subtitle: "Subscription, usage, and payment history.",
  },
  "/dashboard/admin": {
    title: "Admin",
    subtitle: "Payments, users, and revenue.",
  },
};

export function Topbar() {
  const pathname = usePathname();
  const { user, connectedAccounts } = useDashboard();
  const copy = pageCopy[pathname] ?? pageCopy["/dashboard"];
  const primaryAccount = connectedAccounts.find((account) => account.is_primary) ?? connectedAccounts[0];
  const syncing = connectedAccounts.some((account) => account.sync_status === "syncing");
  const lastSynced = primaryAccount?.last_synced_at
    ? Math.max(0, Math.round((Date.now() - new Date(primaryAccount.last_synced_at).getTime()) / 60000))
    : null;

  return (
    <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-border bg-[#080B11]/80 px-3 backdrop-blur-xl sm:px-4 md:px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground-primary">{copy.title}</h1>
        <p className="hidden text-xs text-foreground-secondary sm:block">{copy.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {primaryAccount ? (
          <div className="hidden h-9 items-center rounded-full border border-border bg-background-secondary px-3 text-xs font-semibold text-foreground-primary sm:flex">
            {Number(primaryAccount.account_balance ?? 0).toLocaleString()} {primaryAccount.account_currency ?? "USD"}
          </div>
        ) : null}
        <div className="hidden h-9 items-center gap-2 rounded-full border border-border bg-background-secondary px-3 text-xs font-medium text-foreground-secondary sm:flex">
          <span className="relative flex h-2 w-2" aria-hidden="true" title={lastSynced === null ? "Last synced: never" : `Last synced: ${lastSynced} min ago`}>
            {syncing ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /> : null}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${syncing ? "bg-accent" : "bg-slate-500"}`} />
          </span>
          Bot Active
        </div>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background-secondary text-foreground-secondary transition hover:border-border-strong hover:text-foreground-primary"
          type="button"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-subtle text-sm font-semibold text-accent">
          {user.initials}
        </div>
      </div>
    </header>
  );
}
