"use client";

import { DailyCheckinForm } from "@/components/psychology/DailyCheckinForm";
import { EmotionOutcomeTable } from "@/components/psychology/EmotionOutcomeTable";
import { InsightCard } from "@/components/psychology/InsightCard";
import { OverallScoreGauge } from "@/components/psychology/OverallScoreGauge";
import { PatternAlert } from "@/components/psychology/PatternAlert";
import { PsychologyChart } from "@/components/psychology/PsychologyChart";
import { useGeneratePsychologyInsights, usePsychologyInsights, usePsychologyLogs } from "@/hooks/usePsychology";

export default function PsychologyPage() {
  const logsQuery = usePsychologyLogs();
  const insightsQuery = usePsychologyInsights();
  const generateInsights = useGeneratePsychologyInsights();
  const logs = logsQuery.data?.logs ?? [];
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = logs.find((log) => log.log_date === todayKey);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground-primary">Psychology</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Track discipline, emotional state, and behavioral trading patterns.
        </p>
      </div>

      {logsQuery.isLoading ? (
        <div className="h-96 animate-pulse rounded-[16px] bg-background-secondary" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(360px,40%)_minmax(0,60%)]">
          <div className="space-y-5">
            <DailyCheckinForm today={today} />
            <PatternAlert today={today} />
          </div>
          <div className="space-y-5">
            <OverallScoreGauge score={today?.overall_score ?? 72} />
            <PsychologyChart logs={logs} />
            <EmotionOutcomeTable logs={logs} />
          </div>
        </div>
      )}

      <section className="rounded-[16px] border border-border bg-background-secondary p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="border-l-2 border-accent pl-3 text-lg font-semibold">AI Psychology Insights</h2>
            <p className="mt-2 text-sm text-foreground-secondary">Weekly behavioral pattern detection.</p>
          </div>
          <button
            className="h-10 rounded-[10px] bg-accent px-4 text-sm font-semibold text-black"
            type="button"
            onClick={() => generateInsights.mutate()}
          >
            {generateInsights.isPending ? "Generating..." : "Generate Insights"}
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(generateInsights.data?.insights ?? insightsQuery.data?.insights ?? []).map((insight) => (
            <InsightCard key={insight.title} insight={insight} />
          ))}
        </div>
      </section>
    </div>
  );
}
