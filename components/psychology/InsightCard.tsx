"use client";

import { Brain, Lightbulb, ThumbsDown, ThumbsUp, TriangleAlert } from "lucide-react";
import type { PsychologyInsight } from "@/types/psychology";

export function InsightCard({ insight }: { insight: PsychologyInsight }) {
  const Icon = insight.severity === "critical" ? TriangleAlert : insight.severity === "warning" ? Brain : Lightbulb;
  return (
    <article className="rounded-[16px] border border-border bg-background-secondary p-5">
      <Icon className="h-6 w-6 text-accent" />
      <h3 className="mt-4 text-lg font-semibold text-foreground-primary">{insight.title}</h3>
      <p className="mt-2 text-sm leading-6 text-foreground-secondary">{insight.description}</p>
      <div className="mt-4 flex items-center gap-2 text-sm text-foreground-secondary">
        Is this accurate?
        <button className="rounded-full border border-border p-2" type="button"><ThumbsUp className="h-4 w-4" /></button>
        <button className="rounded-full border border-border p-2" type="button"><ThumbsDown className="h-4 w-4" /></button>
      </div>
    </article>
  );
}
