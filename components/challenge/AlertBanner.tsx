import { challengeProgress, type Challenge } from "@/types/challenges";

export function AlertBanner({ challenge }: { challenge: Challenge }) {
  const progress = challengeProgress(challenge);
  if (progress.drawdownPercent >= 80) {
    return <div className="rounded-[16px] border border-[#FF4757]/30 bg-[#FF4757]/10 p-4 text-sm font-semibold text-[#FFB8C0]">DANGER: Your max drawdown is at {progress.drawdownPercent.toFixed(0)}% - stop trading immediately.</div>;
  }
  if (progress.dailyPercent >= 70) {
    return <div className="rounded-[16px] border border-amber-400/30 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">CAUTION: Your daily loss limit is at {progress.dailyPercent.toFixed(0)}% - trade carefully.</div>;
  }
  return <div className="rounded-[16px] border border-[#00D68F]/25 bg-[#00D68F]/10 p-4 text-sm font-semibold text-[#B8FFE7]">All rules compliant - you&apos;re on track.</div>;
}

