import { formatHour } from "./format";

// Bar chart of average weekday visits per hour, built from plain divs (no chart library).
// Hover or keyboard-focus a bar to see its number. A hidden table gives screen readers the data.
export default function TrafficChart({ data }: { data: { hour: number; avg: number }[] }) {
  // Show every hour from 6am to 10pm, even ones with no visits.
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const byHour = new Map(data.map((d) => [d.hour, d.avg]));
  const max = Math.max(1, ...data.map((d) => d.avg));

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative flex h-56 items-end gap-0.5 border-b border-bark pt-6" aria-hidden="true">
        {/* One faint gridline at the top value */}
        <div className="absolute inset-x-0 top-6 border-t border-dashed border-bark" />
        <span className="absolute left-0 top-0 text-xs text-sage">{max} visits</span>

        {hours.map((hour) => {
          const avg = byHour.get(hour) ?? 0;
          return (
            <div key={hour} tabIndex={0} className="group relative flex h-full flex-1 items-end outline-none">
              <div
                className="w-full rounded-t bg-chart transition-opacity group-hover:opacity-80 group-focus:opacity-80"
                style={{ height: `${(avg / max) * 100}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-bark bg-forest px-2 py-1 text-xs opacity-0 group-hover:opacity-100 group-focus:opacity-100">
                {formatHour(hour)} · {avg} visits
              </span>
            </div>
          );
        })}
      </div>

      {/* Hour labels every 3 hours */}
      <div className="flex gap-0.5 text-xs text-sage" aria-hidden="true">
        {hours.map((hour) => (
          <span key={hour} className="flex-1 text-center">
            {hour % 3 === 0 ? formatHour(hour) : ""}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Average weekday visits by hour</caption>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <th scope="row">{formatHour(hour)}</th>
              <td>{byHour.get(hour) ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
