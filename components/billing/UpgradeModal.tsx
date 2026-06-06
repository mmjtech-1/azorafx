"use client";

import { X } from "lucide-react";
import { PaymentMethodSelector } from "@/components/billing/PaymentMethodSelector";

export function UpgradeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[16px] border border-border bg-[#0E1117] p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Upgrade to Azora FX Pro</h2>
            <p className="mt-2 text-sm text-foreground-secondary">Unlock unlimited trading tools for $19/month.</p>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground-secondary" type="button" onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <PaymentMethodSelector />
      </div>
    </div>
  );
}
