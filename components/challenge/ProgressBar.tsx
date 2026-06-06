"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function colorFor(value: number, mode: "profit" | "loss" | "drawdown") {
  if (mode === "profit") return "bg-[#00D68F]";
  if (value >= 80) return "bg-[#FF4757]";
  if (value >= 50) return "bg-amber-400";
  return "bg-[#00D68F]";
}

export function ProgressBar({
  value,
  max,
  label,
  sublabel,
  colorMode,
}: {
  value: number;
  max: number;
  label: string;
  sublabel: string;
  colorMode: "profit" | "loss" | "drawdown";
}) {
  const percent = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-foreground-secondary">{sublabel}</p>
        </div>
        <span className="text-sm font-semibold text-foreground-secondary">{percent.toFixed(0)}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-background-tertiary">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorFor(percent, colorMode))}
        />
      </div>
    </div>
  );
}

