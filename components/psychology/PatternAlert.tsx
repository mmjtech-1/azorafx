"use client";

import { TriangleAlert } from "lucide-react";
import type { PsychologyLog } from "@/types/psychology";

export function PatternAlert({ today }: { today?: PsychologyLog }) {
  const alerts: Array<{ tone: "red" | "amber"; message: string; suggestion: string }> = [];
  if ((today?.fomo_control_score ?? 100) < 30) {
    alerts.push({ tone: "amber", message: "FOMO control is weak today.", suggestion: "Wait for a confirmed retest before entering." });
  }
  if ((today?.revenge_urge_score ?? 0) > 60) {
    alerts.push({ tone: "red", message: "Revenge urge is elevated.", suggestion: "Take a break after any losing trade." });
  }
  if (!alerts.length) return null;
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.message} className={alert.tone === "red" ? "rounded-[12px] border border-loss/30 bg-loss/10 p-4" : "rounded-[12px] border border-warning/30 bg-warning/10 p-4"}>
          <div className="flex gap-3">
            <TriangleAlert className={alert.tone === "red" ? "h-5 w-5 text-loss" : "h-5 w-5 text-warning"} />
            <div>
              <p className="font-semibold text-foreground-primary">{alert.message}</p>
              <p className="mt-1 text-sm text-foreground-secondary">{alert.suggestion}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
