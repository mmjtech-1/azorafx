"use client";

import { cn } from "@/lib/utils";
import type { Mood } from "@/types/psychology";

const moods: Array<{ value: Mood; emoji: string; label: string }> = [
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "focused", emoji: "🎯", label: "Focused" },
  { value: "overconfident", emoji: "🚀", label: "Confident" },
  { value: "fomo", emoji: "😤", label: "FOMO" },
  { value: "frustrated", emoji: "😤", label: "Frustrated" },
];

export function moodDisplay(value?: string | null) {
  return moods.find((mood) => mood.value === value);
}

export function MoodPicker({ value, onChange }: { value?: Mood | null; onChange: (value: Mood) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            "rounded-[10px] border border-border bg-[#141820] px-3 py-2 text-sm text-foreground-secondary transition",
            value === mood.value && "border-border-accent bg-accent-subtle text-accent shadow-accent",
          )}
        >
          {mood.emoji} {mood.label}
        </button>
      ))}
    </div>
  );
}
