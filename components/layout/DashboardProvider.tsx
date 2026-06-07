"use client";

import { createContext, useContext, type ReactNode } from "react";

export type DashboardUser = {
  id: string;
  email: string;
  name: string;
  initials: string;
};

export type DashboardSubscription = {
  plan: "free" | "pro";
  status: string;
};

export type DashboardConnectedAccount = {
  id: string;
  broker: string;
  nickname: string | null;
  account_balance: number | string | null;
  account_currency: string | null;
  sync_status: string;
  last_synced_at: string | null;
  is_primary: boolean;
};

type DashboardContextValue = {
  user: DashboardUser;
  subscription: DashboardSubscription;
  connectedAccounts: DashboardConnectedAccount[];
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  children,
  user,
  subscription,
  connectedAccounts,
}: DashboardContextValue & { children: ReactNode }) {
  return (
    <DashboardContext.Provider value={{ user, subscription, connectedAccounts }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider.");
  }

  return context;
}
