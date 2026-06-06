"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: number;
  change: string;
  changeType: "up" | "down";
  prefix?: string;
  suffix?: string;
  decimals?: number;
};

export function MetricCard({
  label,
  value,
  change,
  changeType,
  prefix = "",
  suffix = "",
  decimals = 0,
}: MetricCardProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 18, mass: 0.8 });
  const display = useTransform(spring, (latest) => {
    const formatted = latest.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return `${prefix}${formatted}${suffix}`;
  });
  const isPositive = changeType === "up";
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.article
      className={cn(
        "rounded-[16px] border border-border bg-background-secondary p-5 transition hover:border-border-strong",
        isPositive && "border-b-accent",
      )}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <p className="text-xs font-semibold uppercase text-foreground-secondary">{label}</p>
      <motion.p className="mt-4 text-[36px] font-semibold leading-none text-foreground-primary">
        {display}
      </motion.p>
      <div
        className={cn(
          "mt-4 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
          isPositive ? "bg-accent-subtle text-accent" : "bg-loss/10 text-loss",
        )}
      >
        <ChangeIcon className="h-3.5 w-3.5" />
        {change}
      </div>
    </motion.article>
  );
}
