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

type DashboardContextValue = {
  user: DashboardUser;
  subscription: DashboardSubscription;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  children,
  user,
  subscription,
}: DashboardContextValue & { children: ReactNode }) {
  return (
    <DashboardContext.Provider value={{ user, subscription }}>
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
