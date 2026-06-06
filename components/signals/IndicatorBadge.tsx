"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function IndicatorBadge({
  name,
  value,
  pass,
}: {
  name: string;
  value: number | string | null;
  pass: boolean;
}) {
  const Icon = pass ? Check : X;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs",
        pass ? "border-border-accent bg-accent-subtle text-accent" : "border-loss/30 bg-loss/10 text-loss",
      )}
    >
      {name}: {typeof value === "number" ? value.toFixed(2) : value ?? "-"}
      <Icon className="h-3 w-3" />
    </span>
  );
}
