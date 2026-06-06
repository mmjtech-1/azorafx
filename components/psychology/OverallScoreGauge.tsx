"use client";

export function OverallScoreGauge({ score }: { score: number }) {
  const color = score > 70 ? "#00D68F" : score >= 40 ? "#FFA502" : "#FF4757";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  return (
    <section className="rounded-[16px] border border-border bg-background-secondary p-5 text-center">
      <h2 className="border-l-2 border-accent pl-3 text-left text-lg font-semibold">Today&apos;s Score</h2>
      <div className="relative mx-auto mt-6 h-40 w-40">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#141820" strokeWidth="12" />
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-semibold" style={{ color }}>
            {Math.round(score)}
          </span>
        </div>
      </div>
    </section>
  );
}
