import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { challengeProgress, type Challenge } from "@/types/challenges";

type Rule = { name: string; current: string; limit: string; percent: number; violated?: boolean; compliant?: boolean };

function badge(rule: Rule) {
  if (rule.violated) return { text: "Violated", className: "bg-[#FF4757]/10 text-[#FF8895]", icon: XCircle };
  if (rule.percent >= 70) return { text: "Monitor", className: "bg-amber-400/10 text-amber-200", icon: AlertTriangle };
  return { text: rule.compliant ? "Compliant" : "Safe", className: "bg-[#00D68F]/10 text-[#00D68F]", icon: CheckCircle2 };
}

export function RulesChecklist({ challenge }: { challenge: Challenge }) {
  const p = challengeProgress(challenge);
  const rules: Rule[] = [
    { name: "Daily loss limit", current: `$${p.dailyUsed.toFixed(0)}`, limit: `$${p.dailyLimit.toFixed(0)}`, percent: p.dailyPercent, violated: p.dailyPercent >= 100 },
    { name: "Max drawdown", current: `$${p.drawdownUsed.toFixed(0)}`, limit: `$${p.maxDrawdown.toFixed(0)}`, percent: p.drawdownPercent, violated: p.drawdownPercent >= 100 },
    { name: "Min trading days", current: `${challenge.days_traded}`, limit: `${challenge.min_trading_days}`, percent: challenge.min_trading_days ? (challenge.days_traded / challenge.min_trading_days) * 100 : 100, compliant: challenge.days_traded >= challenge.min_trading_days },
    { name: "No weekend holding", current: challenge.no_weekend_holding ? "Required" : "Allowed", limit: "Firm rule", percent: 0, compliant: true },
    { name: "No news trading", current: challenge.no_news_trading ? "Required" : "Allowed", limit: "Firm rule", percent: 0, compliant: true },
    { name: "Max position size", current: challenge.max_lot_size ? `${challenge.max_lot_size} lots` : "Not set", limit: challenge.max_lot_size ? `${challenge.max_lot_size} lots` : "No limit", percent: 0, compliant: true },
  ];

  return (
    <div className="space-y-2">
      {rules.map((rule) => {
        const status = badge(rule);
        const Icon = status.icon;
        return (
          <div key={rule.name} className={cn("flex items-center justify-between gap-3 rounded-[12px] border border-border bg-background-tertiary p-3", rule.violated && "border-[#FF4757]/30 bg-[#FF4757]/10")}>
            <div className="flex items-center gap-3">
              <Icon className={cn("h-4 w-4", rule.violated ? "text-[#FF4757]" : rule.percent >= 70 ? "text-amber-300" : "text-[#00D68F]")} />
              <div>
                <p className="text-sm font-semibold text-white">{rule.name}</p>
                <p className="text-xs text-foreground-secondary">{rule.current} / {rule.limit}</p>
              </div>
            </div>
            <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", status.className)}>{status.text}</span>
          </div>
        );
      })}
    </div>
  );
}
