import Link from "next/link";
import { connection } from "next/server";
import { getDashboardStats, getPlaces } from "@/lib/db";
import { publishEvent } from "./actions";
import { formatHour, percentChange } from "./format";
import TrafficChart from "./TrafficChart";

const CATEGORIES = ["Food", "Music", "Outdoors", "Shopping", "Career", "Volunteer"];

// Owner dashboard (Clover-style). No login yet, so the owner picks their business
// from the dropdown. /dashboard?place=p6 opens Teixeira's Bakery.
export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  await connection();
  const { place: placeParam, error } = await searchParams;
  const places = await getPlaces();
  const place = places.find((p) => p.id === placeParam) ?? places.find((p) => p.id === "p6") ?? places[0];
  const stats = await getDashboardStats(place.id);

  const visitsChange = percentChange(stats.visitsThisWeek, stats.visitsLastWeek);
  const seedsChange = percentChange(stats.seedsThisWeek, stats.seedsLastWeek);
  const busiest = stats.busiestHour === null ? "—" : formatHour(stats.busiestHour);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sage">Owner dashboard</p>
          <h1 className="font-display text-4xl font-bold">{place.name}</h1>
          <p className="text-sage">{place.neighborhood} · data simulated for demo</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Plain GET form: picking a business reloads the page with ?place=… */}
          <form className="flex gap-2">
            <label className="sr-only" htmlFor="place">Business</label>
            <select id="place" name="place" defaultValue={place.id} className="rounded-full border border-bark bg-moss px-4 py-2 text-sm">
              {places.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button className="rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold hover:border-mint">Switch</button>
          </form>
          <Link
            href={`/?tab=food&q=${encodeURIComponent(place.name)}#browse`}
            className="rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold hover:border-mint"
          >
            View public page →
          </Link>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Visits this week" value={stats.visitsThisWeek.toLocaleString("en-US")} change={visitsChange} />
        <StatTile label="Seeds granted" value={stats.seedsThisWeek.toLocaleString("en-US")} change={seedsChange} />
        <div className="rounded-2xl border border-bark bg-moss p-5">
          <p className="text-sm text-sage">Busiest hour</p>
          <p className="font-display text-4xl font-bold">{busiest}</p>
          <p className="text-sm text-sage">{stats.busiestHourAvg} visits on an average weekday</p>
        </div>
      </div>

      {/* Foot traffic chart */}
      <section className="rounded-2xl border border-bark bg-moss p-5">
        <h2 className="font-display text-2xl font-semibold">Foot traffic by hour</h2>
        <p className="mb-4 text-sm text-sage">Average weekday, last 4 weeks</p>
        <TrafficChart data={stats.trafficByHour} />
      </section>

      {/* Weekly summary: written from the numbers by a simple template for now. */}
      <section className="rounded-2xl border border-bark bg-moss p-5">
        <h2 className="font-display text-2xl font-semibold">Weekly summary</h2>
        <p className="mt-2 text-lg">
          Your busiest hour is <strong>{busiest}</strong>, with about {stats.busiestHourAvg} visits on an average weekday
          {stats.busiestHour !== null && (
            <> — consider extra help from {formatHour(Math.max(0, stats.busiestHour - 1))}–{formatHour(Math.min(23, stats.busiestHour + 1))}</>
          )}
          . Visits are {visitsChange >= 0 ? "up" : "down"} <strong>{Math.abs(visitsChange)}%</strong> from last week.
          {stats.fridayEveningChange !== null && (
            <>
              {" "}Friday evenings are {stats.fridayEveningChange >= 0 ? "up" : "down"}{" "}
              <strong>{Math.abs(stats.fridayEveningChange)}%</strong>.
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-sage">
          Built from your Tiger Data numbers with a template. An AI-written version needs Gemini connected.
        </p>
      </section>

      {/* Post a gathering → adds an event to the database */}
      <section className="rounded-2xl border border-bark bg-moss p-5">
        <h2 className="font-display text-2xl font-semibold">Post a gathering</h2>
        <p className="mb-4 text-sm text-sage">It shows up on the Gatherings tab right away.</p>
        {error === "missing" && (
          <p role="alert" className="mb-3 rounded-lg border border-bark bg-olive px-3 py-2 text-sm">
            Please add a title and a date &amp; time.
          </p>
        )}

        <form action={publishEvent.bind(null, place.id)} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Event title" name="title" placeholder="Pastel de nata tasting" />
            <Field label="Date & time" name="date" placeholder="Sat, 10am" />
            <label className="flex flex-col gap-1 text-sm text-sage">
              Category
              <select name="category" className="rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist">
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm text-sage">
            Description
            <textarea
              name="description"
              rows={3}
              className="rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist focus:border-mint focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">Publish</button>
            <button
              type="button"
              disabled
              title="Needs a Gemini API key"
              className="cursor-not-allowed rounded-full border border-bark px-6 py-3 font-semibold text-sage"
            >
              Draft with Gemini
            </button>
            <span className="text-xs text-sage">Gemini drafting turns on once an API key is added.</span>
          </div>
        </form>
      </section>
    </main>
  );
}

function StatTile({ label, value, change }: { label: string; value: string; change: number }) {
  const up = change >= 0;
  return (
    <div className="rounded-2xl border border-bark bg-moss p-5">
      <p className="text-sm text-sage">{label}</p>
      <p className="font-display text-4xl font-bold">{value}</p>
      {/* Arrow + word, so the trend isn't shown by color alone */}
      <p className="text-sm text-sage">
        <span aria-hidden="true">{up ? "▲" : "▼"} </span>
        {up ? "Up" : "Down"} {Math.abs(change)}% vs last week
      </p>
    </div>
  );
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-sage">
      {label}
      <input
        name={name}
        placeholder={placeholder}
        className="rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist placeholder:text-sage/70 focus:border-mint focus:outline-none"
      />
    </label>
  );
}
