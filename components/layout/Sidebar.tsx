"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  BellRing,
  Bot,
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { useSidebarStore } from "@/stores/useSidebarStore";

const navSections = [
  {
    label: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "TOOLS",
    items: [
      { label: "Trade Journal", href: "/dashboard/journal", icon: ClipboardList },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Signals", href: "/dashboard/signals", icon: LineChart },
      { label: "Psychology", href: "/dashboard/psychology", icon: Brain },
      { label: "AI Review", href: "/dashboard/ai-review", icon: Bot },
    ],
  },
  {
    label: "NEW",
    items: [
      { label: "Economic Calendar", href: "/dashboard/calendar", icon: CalendarDays },
      { label: "Challenge Tracker", href: "/dashboard/challenge", icon: Target },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, subscription } = useDashboard();
  const { isCollapsed, toggle } = useSidebarStore();
  const isPro = subscription.plan === "pro";

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.24, ease: "easeInOut" }}
      className="sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-[#0E1117]"
    >
      <div className="flex h-[72px] items-center justify-between px-4">
        <Link className="flex items-center gap-3 overflow-hidden" href="/dashboard">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-accent bg-accent-subtle text-sm font-bold text-accent shadow-accent">
            <span className="absolute inset-0 rounded-xl bg-accent/10 blur-md" />
            <span className="relative">A</span>
          </span>
          {!isCollapsed ? (
            <span className="whitespace-nowrap text-base font-semibold text-foreground-primary">
              Azora FX
            </span>
          ) : null}
        </Link>

        {!isCollapsed ? (
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground-secondary transition hover:border-border-strong hover:text-foreground-primary"
            type="button"
            onClick={toggle}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isCollapsed ? (
        <button
          className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-border text-foreground-secondary transition hover:border-border-strong hover:text-foreground-primary"
          type="button"
          onClick={toggle}
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}

      <nav className="flex-1 space-y-6 px-3 py-2">
        {navSections.map((section) => (
          <div key={section.label}>
            {!isCollapsed ? (
              <p className="mb-2 px-3 text-xs font-semibold text-foreground-tertiary">
                {section.label}
              </p>
            ) : null}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (pathname === "/dashboard-preview" && item.href === "/dashboard") ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground-secondary transition hover:bg-background-hover hover:text-foreground-primary",
                      isActive && "bg-[rgba(0,214,143,0.08)] text-[#00D68F]",
                      isCollapsed && "justify-center px-0",
                    )}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-border p-3">
        {!isPro && !isCollapsed ? (
          <Link
            className="flex h-10 items-center justify-center rounded-[10px] bg-gradient-to-r from-accent to-[#00F0A0] px-3 text-sm font-semibold text-black shadow-accent transition hover:brightness-110"
            href="/pricing"
          >
            Upgrade to Pro
          </Link>
        ) : null}

        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-sm font-semibold text-accent">
            {user.initials}
          </div>

          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-foreground-primary">{user.name}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    isPro ? "bg-accent-subtle text-accent" : "bg-background-tertiary text-foreground-secondary",
                  )}
                >
                  {isPro ? "PRO" : "FREE"}
                </span>
              </div>
              <p className="truncate text-xs text-foreground-tertiary">{user.email}</p>
            </div>
          ) : null}
        </div>
      </div>
    </motion.aside>
  );
}
