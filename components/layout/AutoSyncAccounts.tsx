"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useDashboard } from "@/components/layout/DashboardProvider";

export function AutoSyncAccounts() {
  const { connectedAccounts } = useDashboard();
  useEffect(() => {
    for (const account of connectedAccounts) {
      const last = account.last_synced_at ? new Date(account.last_synced_at).getTime() : 0;
      const stale = Date.now() - last > 60 * 60 * 1000;
      if (!stale || account.sync_status === "syncing") continue;
      toast.info(`Syncing your ${account.broker} trades...`);
      fetch(`/api/connected-accounts/${account.id}/sync`, { method: "POST" })
        .then((response) => response.json())
        .then((payload) => toast.success(`✅ ${payload.synced ?? 0} new trades imported`))
        .catch((error) => toast.error(error instanceof Error ? error.message : "Auto-sync failed"));
    }
  }, [connectedAccounts]);
  return null;
}
