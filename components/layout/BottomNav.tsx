"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Bot, Brain, CalendarDays, ClipboardList, CreditCard, LayoutDashboard, LineChart, Menu, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

const primary = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Journal", href: "/dashboard/journal", icon: ClipboardList },
  { label: "Signals", href: "/dashboard/signals", icon: LineChart },
  { label: "Psychology", href: "/dashboard/psychology", icon: Brain },
];

const more = [
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "AI Review", href: "/dashboard/ai-review", icon: Bot },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Challenge", href: "/dashboard/challenge", icon: Target },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function BottomNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-5 border-t border-border bg-[#0E1117]/95 px-2 backdrop-blur md:hidden">
        {primary.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center gap-1 text-[11px] text-foreground-secondary", isActive(item.href) && "text-[#00D68F]")}>
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        <button className="flex flex-col items-center justify-center gap-1 text-[11px] text-foreground-secondary" type="button" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
          More
        </button>
      </nav>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/70 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 rounded-t-[16px] border-t border-border bg-[#0E1117] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">More</h2>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground-secondary" type="button" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-2">
              {more.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("flex h-12 items-center gap-3 rounded-xl border border-border px-3 text-sm text-foreground-secondary", isActive(item.href) && "border-[#00D68F]/30 bg-[#00D68F]/10 text-[#00D68F]")}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
