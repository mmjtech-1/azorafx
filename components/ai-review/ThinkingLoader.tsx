"use client";

import { useEffect, useState } from "react";
import { Brain } from "lucide-react";

const messages = [
  "Analyzing your setup...",
  "Checking risk management...",
  "Reviewing entry timing...",
  "Generating insights...",
];

export function ThinkingLoader() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % messages.length), 1800);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="rounded-[16px] border border-border bg-background-secondary p-6 text-center">
      <Brain className="mx-auto h-10 w-10 animate-pulse text-accent" />
      <p className="mt-4 text-sm text-foreground-secondary">{messages[index]}</p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-background-tertiary">
        <div className="h-full animate-[progress_8s_ease-in-out_infinite] rounded-full bg-accent" />
      </div>
      <style jsx>{`
        @keyframes progress {
          from { width: 8%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
