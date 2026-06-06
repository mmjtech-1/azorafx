import { z } from "zod";

export const moods = ["anxious", "neutral", "focused", "overconfident", "fomo", "frustrated"] as const;
export type Mood = (typeof moods)[number];

const score = z.coerce.number().min(0).max(100).optional().nullable();

export const psychologyLogSchema = z.object({
  discipline_score: score,
  patience_score: score,
  fomo_control_score: score,
  confidence_score: score,
  revenge_urge_score: score,
  stress_score: score,
  focus_score: score,
  morning_mindset: z.string().optional().nullable(),
  end_of_day_notes: z.string().optional().nullable(),
  biggest_mistake: z.string().optional().nullable(),
  biggest_win: z.string().optional().nullable(),
  morning_mood: z.enum(moods).optional().nullable(),
  end_mood: z.enum(moods).optional().nullable(),
});

export type PsychologyInput = z.infer<typeof psychologyLogSchema>;

export type PsychologyLog = PsychologyInput & {
  id: string;
  user_id: string;
  log_date: string;
  overall_score: number | null;
  created_at: string;
  updated_at: string;
};

export type InsightSeverity = "info" | "warning" | "critical";
export type PsychologyInsight = {
  title: string;
  description: string;
  severity: InsightSeverity;
};
