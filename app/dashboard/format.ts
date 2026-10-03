// 8 -> "8am", 12 -> "12pm", 19 -> "7pm"
export function formatHour(hour: number): string {
  const suffix = hour < 12 ? "am" : "pm";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${suffix}`;
}

// Percent change, e.g. 120 vs 100 -> 20. Returns 0 when there's nothing to compare.
export function percentChange(now: number, before: number): number {
  return before > 0 ? Math.round(((now - before) / before) * 100) : 0;
}
