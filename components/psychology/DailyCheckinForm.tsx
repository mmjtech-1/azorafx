"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDashboard } from "@/components/layout/DashboardProvider";
import { MoodPicker } from "@/components/psychology/MoodPicker";
import { ScoreSlider } from "@/components/psychology/ScoreSlider";
import { useSaveEveningLog, useSaveMorningCheckin } from "@/hooks/usePsychology";
import type { PsychologyInput, PsychologyLog } from "@/types/psychology";

const textarea = "mt-2 min-h-20 w-full rounded-[10px] border border-border bg-[#141820] px-3 py-3 text-sm outline-none focus:border-border-accent";

export function DailyCheckinForm({ today }: { today?: PsychologyLog }) {
  const { user } = useDashboard();
  const [editing, setEditing] = useState(!today);
  const morning = useSaveMorningCheckin();
  const evening = useSaveEveningLog();
  const isAfterTwo = new Date().getHours() >= 14;
  const form = useForm<PsychologyInput>({
    defaultValues: {
      discipline_score: today?.discipline_score ?? 70,
      patience_score: today?.patience_score ?? 70,
      fomo_control_score: today?.fomo_control_score ?? 70,
      confidence_score: today?.confidence_score ?? 70,
      focus_score: today?.focus_score ?? 70,
      stress_score: today?.stress_score ?? 30,
      revenge_urge_score: today?.revenge_urge_score ?? 20,
      morning_mood: today?.morning_mood ?? "focused",
      end_mood: today?.end_mood ?? "neutral",
      morning_mindset: today?.morning_mindset ?? "",
      end_of_day_notes: today?.end_of_day_notes ?? "",
      biggest_mistake: today?.biggest_mistake ?? "",
      biggest_win: today?.biggest_win ?? "",
    },
  });
  const values = form.watch();

  if (today && !editing) {
    return (
      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <h2 className="text-xl font-semibold text-accent">Check-in complete ✓</h2>
        <p className="mt-2 text-sm text-foreground-secondary">Overall score: {today.overall_score ?? 0}</p>
        <button className="mt-4 rounded-[10px] border border-border px-4 py-2 text-sm" type="button" onClick={() => setEditing(true)}>
          Edit
        </button>
      </section>
    );
  }

  async function saveMorning(input: PsychologyInput) {
    await morning.mutateAsync(input);
    setEditing(false);
  }

  async function saveEvening(input: PsychologyInput) {
    await evening.mutateAsync({ date: new Date().toISOString().slice(0, 10), input });
    setEditing(false);
  }

  const sliders: Array<[keyof PsychologyInput, string, boolean?]> = [
    ["discipline_score", "Discipline"],
    ["patience_score", "Patience"],
    ["fomo_control_score", "FOMO Control"],
    ["confidence_score", "Confidence"],
    ["focus_score", "Focus"],
    ["stress_score", "Stress", true],
    ["revenge_urge_score", "Revenge Urge", true],
  ];

  return (
    <section className="rounded-[16px] border border-border bg-background-secondary p-5">
      {!isAfterTwo || !today ? (
        <form className="space-y-5" onSubmit={form.handleSubmit(saveMorning)}>
          <h2 className="text-xl font-semibold">How are you feeling today, {user.name}?</h2>
          <Controller control={form.control} name="morning_mood" render={({ field }) => <MoodPicker value={field.value} onChange={field.onChange} />} />
          <div className="space-y-4">
            {sliders.map(([name, label, lowerBetter]) => (
              <ScoreSlider key={name} label={label} lowerBetter={lowerBetter} value={Number(values[name] ?? 0)} onChange={(value) => form.setValue(name, value)} />
            ))}
          </div>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-foreground-tertiary">Morning mindset</span>
            <textarea className={textarea} placeholder="What is your game plan today?" {...form.register("morning_mindset")} />
          </label>
          <button className="h-11 w-full rounded-[10px] bg-accent text-sm font-semibold text-black" type="submit">Save Morning Check-in</button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={form.handleSubmit(saveEvening)}>
          <h2 className="text-xl font-semibold">End of day review</h2>
          <Controller control={form.control} name="end_mood" render={({ field }) => <MoodPicker value={field.value} onChange={field.onChange} />} />
          <textarea className={textarea} placeholder="How did today go?" {...form.register("end_of_day_notes")} />
          <textarea className={textarea} placeholder="Biggest mistake today" {...form.register("biggest_mistake")} />
          <textarea className={textarea} placeholder="Biggest win today" {...form.register("biggest_win")} />
          <button className="h-11 w-full rounded-[10px] bg-accent text-sm font-semibold text-black" type="submit">Save Evening Log</button>
        </form>
      )}
    </section>
  );
}
