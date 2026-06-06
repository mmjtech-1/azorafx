"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 80, damping: 22 });
  const display = useTransform(spring, (latest) => `${Math.round(latest).toLocaleString()}${suffix}`);

  useEffect(() => {
    raw.set(value);
  }, [raw, value]);

  return <motion.span>{display}</motion.span>;
}

export function LandingStats() {
  return (
    <div className="mt-8 grid gap-3 rounded-[16px] border border-white/[0.06] bg-[#0E1117] p-5 text-center md:grid-cols-3">
      <p className="text-sm text-slate-400">
        <span className="block text-2xl font-semibold text-white">
          <Counter value={18000} suffix="+" />
        </span>
        Trades Analyzed
      </p>
      <p className="text-sm text-slate-400">
        <span className="block text-2xl font-semibold text-white">AI Reviews</span>
        in seconds
      </p>
      <p className="text-sm text-slate-400">
        <span className="block text-2xl font-semibold text-white">$0</span>
        to start
      </p>
    </div>
  );
}

