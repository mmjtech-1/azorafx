"use client";

import type { ReactNode } from "react";

export function SectionShell({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[16px] border border-border bg-background-secondary p-5 ${className}`}>
      <h2 className="border-l-2 border-accent pl-3 text-lg font-semibold text-foreground-primary">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ChartSkeleton() {
  return <div className="h-[280px] animate-pulse rounded-[12px] bg-background-tertiary" />;
}
