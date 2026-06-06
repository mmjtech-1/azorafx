import { XMLParser } from "fast-xml-parser";
import type { CalendarEvent, CalendarImpact } from "@/types/calendar";

const FEED_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.xml";

type RawForexFactoryEvent = {
  title?: string;
  country?: string;
  currency?: string;
  date?: string;
  time?: string;
  impact?: string;
  previous?: string;
  forecast?: string;
  actual?: string;
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text || text === "-" || text.toLowerCase() === "tentative") return null;
  return text;
}

function normalizeImpact(value: unknown): CalendarImpact {
  const text = String(value ?? "").toLowerCase();
  if (text.includes("high")) return "high";
  if (text.includes("medium")) return "medium";
  return "low";
}

function parseDate(value: unknown) {
  const text = clean(value);
  if (!text) return null;
  const parts = text.split(/[-/]/).map((part) => Number(part));
  if (parts.length >= 3) {
    const [month, day, year] = parts;
    if (month && day && year) return `${year.toString().padStart(4, "20")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function parseTime(value: unknown) {
  const text = clean(value);
  if (!text || text.toLowerCase() === "all day") return null;
  const match = text.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function numeric(value: string | null) {
  if (!value) return null;
  const multiplier = value.toLowerCase().includes("k") ? 1_000 : value.toLowerCase().includes("m") ? 1_000_000 : 1;
  const parsed = Number(value.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed * multiplier : null;
}

function detectBeat(actual: string | null, forecast: string | null) {
  const actualNumber = numeric(actual);
  const forecastNumber = numeric(forecast);
  if (actualNumber === null || forecastNumber === null) return null;
  return actualNumber >= forecastNumber;
}

function normalizeEvent(raw: RawForexFactoryEvent): CalendarEvent | null {
  const eventDate = parseDate(raw.date);
  const currency = clean(raw.country ?? raw.currency);
  const eventName = clean(raw.title);
  if (!eventDate || !currency || !eventName) return null;
  const eventTime = parseTime(raw.time);
  const forecast = clean(raw.forecast);
  const actual = clean(raw.actual);

  return {
    event_date: eventDate,
    event_time: eventTime,
    currency: currency.toUpperCase(),
    impact: normalizeImpact(raw.impact),
    event_name: eventName,
    previous_value: clean(raw.previous),
    forecast_value: forecast,
    actual_value: actual,
    beat_forecast: detectBeat(actual, forecast),
    source_id: `${eventDate}-${eventTime ?? "all-day"}-${currency}-${eventName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  };
}

export async function fetchForexFactoryCalendar(): Promise<CalendarEvent[]> {
  try {
    const response = await fetch(FEED_URL, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const xml = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
    const parsed = parser.parse(xml);
    const events = asArray<RawForexFactoryEvent>(parsed?.weeklyevents?.event ?? parsed?.events?.event);
    return events.map(normalizeEvent).filter((event): event is CalendarEvent => Boolean(event));
  } catch {
    return [];
  }
}
