"use client";

import Link from "next/link";

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-[16px] border border-border bg-[#0E1117] p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-foreground-primary">
          You&apos;ve reached your 20 trade limit this month
        </h2>
        <p className="mt-2 text-sm leading-6 text-foreground-secondary">
          Upgrade to Pro to log unlimited trades, upload screenshots, and unlock full analytics.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[10px] border border-border bg-background-tertiary p-3">
            <p className="font-semibold text-foreground-primary">Free</p>
            <p className="mt-2 text-foreground-secondary">20 trades/month</p>
            <p className="text-foreground-secondary">No screenshots</p>
          </div>
          <div className="rounded-[10px] border border-border-accent bg-accent-subtle p-3">
            <p className="font-semibold text-accent">Pro</p>
            <p className="mt-2 text-foreground-primary">Unlimited trades</p>
            <p className="text-foreground-primary">Screenshot uploads</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            className="h-10 flex-1 rounded-[10px] border border-border text-sm text-foreground-secondary"
            type="button"
            onClick={onClose}
          >
            Not now
          </button>
          <Link
            className="flex h-10 flex-1 items-center justify-center rounded-[10px] bg-accent text-sm font-semibold text-black"
            href="/pricing"
          >
            Upgrade to Pro — $19/month
          </Link>
        </div>
      </div>
    </div>
  );
}
