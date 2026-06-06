"use client";

import { cn } from "@/lib/utils";
import type { emotions } from "@/types/trades";

type Emotion = (typeof emotions)[number];

const options: Array<{ value: Emotion; emoji: string; label: string }> = [
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "focused", emoji: "🎯", label: "Focused" },
  { value: "overconfident", emoji: "🚀", label: "Confident" },
  { value: "fomo", emoji: "😤", label: "FOMO" },
  { value: "frustrated", emoji: "😤", label: "Frustrated" },
];

export function emotionLabel(value?: string | null) {
  return options.find((option) => option.value === value);
}

export function EmotionPicker({
  value,
  onChange,
}: {
  value?: Emotion | null;
  onChange: (value: Emotion) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 rounded-[10px] border border-border bg-[#141820] px-3 py-2 text-left text-sm text-foreground-secondary transition hover:border-border-strong hover:text-foreground-primary",
              selected && "border-border-accent bg-accent-subtle text-accent",
            )}
          >
            <span>{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
