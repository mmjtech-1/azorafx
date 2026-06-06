import { cn } from "@/lib/utils";
import type { CalendarImpact } from "@/types/calendar";

const styles: Record<CalendarImpact, string> = {
  high: "bg-[#FF4757] text-[#FFB8C0]",
  medium: "bg-amber-400 text-amber-100",
  low: "bg-[#00D68F] text-emerald-100",
};

export function ImpactBadge({ impact, showLabel = true }: { impact: CalendarImpact; showLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
      <span className={cn("h-2.5 w-2.5 rounded-full", styles[impact])} />
      {showLabel ? impact : null}
    </span>
  );
}

