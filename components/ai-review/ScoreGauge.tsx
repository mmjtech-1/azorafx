"use client";

import { motion } from "framer-motion";

export function ScoreGauge({ score, size = 128, color }: { score: number; size?: number; color?: string }) {
  const resolved = color ?? (score >= 7 ? "#00D68F" : score >= 4 ? "#FFA502" : "#FF4757");
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="relative" style={{ height: size, width: size }}>
      <svg className="-rotate-90" height={size} viewBox="0 0 120 120" width={size}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#141820" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={resolved}
          strokeLinecap="round"
          strokeWidth="10"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8 }}
          strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold" style={{ color: resolved }}>{score.toFixed(1)}</span>
      </div>
    </div>
  );
}
