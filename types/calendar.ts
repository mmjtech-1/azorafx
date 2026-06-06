export type CalendarImpact = "high" | "medium" | "low";

export type CalendarEvent = {
  id?: string;
  event_date: string;
  event_time: string | null;
  currency: string;
  impact: CalendarImpact;
  event_name: string;
  previous_value: string | null;
  forecast_value: string | null;
  actual_value: string | null;
  beat_forecast: boolean | null;
  source_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CalendarFilters = {
  impact: "all" | CalendarImpact;
  currency: string;
  range: "today" | "tomorrow" | "thisWeek" | "nextWeek";
};

export type GroupedCalendarEvents = Record<string, CalendarEvent[]>;

