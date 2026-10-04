import type { Locale } from "@/lib/i18n";

// English: 8 -> "8am", 19 -> "7pm". Spanish: 19 -> "19:00". Brazilian Portuguese: 19 -> "19h".
export function formatHour(hour: number, locale: Locale = "en-US"): string {
  if (locale === "es") return `${hour}:00`;
  if (locale === "pt-BR") return `${hour}h`;
  const suffix = hour < 12 ? "am" : "pm";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${suffix}`;
}

// Percent change, e.g. 120 vs 100 -> 20. Returns 0 when there's nothing to compare.
export function percentChange(now: number, before: number): number {
  return before > 0 ? Math.round(((now - before) / before) * 100) : 0;
}
