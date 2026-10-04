import Link from "next/link";
import { redirect } from "next/navigation";
import Rich from "../components/Rich";
import { getDashboardStats, getPlaceById } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { categoryName, fill, type Dictionary } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import { publishEvent } from "./actions";
import { formatHour, percentChange } from "./format";
import TrafficChart from "./TrafficChart";

const CATEGORIES = ["Food", "Music", "Outdoors", "Shopping", "Career", "Volunteer"];

// Owner dashboard (Clover-style). Only approved business accounts can use it,
// and each owner only sees the business linked to their account.
export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "business" || !user.placeId) redirect("/");

  const place = await getPlaceById(user.placeId);
  if (!place) redirect("/");

  const { locale, t } = await getDictionary();

  // Not approved yet (or rejected): show the status instead of the dashboard.
  if (user.businessStatus !== "approved") {
    return <ReviewStatus t={t} placeName={place.name} status={user.businessStatus} />;
  }

  const { error } = await searchParams;
  const stats = await getDashboardStats(place.id);

  const visitsChange = percentChange(stats.visitsThisWeek, stats.visitsLastWeek);
  const seedsChange = percentChange(stats.seedsThisWeek, stats.seedsLastWeek);
  const busiest = stats.busiestHour === null ? "—" : formatHour(stats.busiestHour, locale);
  const direction = (change: number) => (change >= 0 ? t.dashboard.upLower : t.dashboard.downLower);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      {/* Title row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sage">{t.dashboard.eyebrow}</p>
          <h1 className="font-display text-4xl font-bold">{place.name}</h1>
          <p className="text-sage">{place.neighborhood} · {t.dashboard.simulated}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/?tab=food&q=${encodeURIComponent(place.name)}#browse`}
            className="rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold hover:border-mint"
          >
            {t.dashboard.viewPublic}
          </Link>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile t={t} label={t.dashboard.visitsThisWeek} value={stats.visitsThisWeek.toLocaleString(locale)} change={visitsChange} />
        <StatTile t={t} label={t.dashboard.seedsGranted} value={stats.seedsThisWeek.toLocaleString(locale)} change={seedsChange} />
        <div className="rounded-2xl border border-bark bg-moss p-5">
          <p className="text-sm text-sage">{t.dashboard.busiestHour}</p>
          <p className="font-display text-4xl font-bold">{busiest}</p>
          <p className="text-sm text-sage">{fill(t.dashboard.avgWeekdayVisits, { count: stats.busiestHourAvg })}</p>
        </div>
      </div>

      {/* Foot traffic chart */}
      <section className="rounded-2xl border border-bark bg-moss p-5">
        <h2 className="font-display text-2xl font-semibold">{t.dashboard.trafficTitle}</h2>
        <p className="mb-4 text-sm text-sage">{t.dashboard.trafficNote}</p>
        <TrafficChart data={stats.trafficByHour} />
      </section>

      {/* Weekly summary: written from the numbers by a simple template for now. */}
      <section className="rounded-2xl border border-bark bg-moss p-5">
        <h2 className="font-display text-2xl font-semibold">{t.dashboard.summaryTitle}</h2>
        <p className="mt-2 text-lg">
          <Rich text={fill(t.dashboard.summaryBusiest, { hour: busiest, count: stats.busiestHourAvg })} />
          {stats.busiestHour !== null &&
            fill(t.dashboard.summaryHelp, {
              from: formatHour(Math.max(0, stats.busiestHour - 1), locale),
              to: formatHour(Math.min(23, stats.busiestHour + 1), locale),
            })}
          <Rich text={fill(t.dashboard.summaryVisits, { direction: direction(visitsChange), percent: Math.abs(visitsChange) })} />
          {stats.fridayEveningChange !== null && (
            <Rich
              text={fill(t.dashboard.summaryFriday, {
                direction: direction(stats.fridayEveningChange),
                percent: Math.abs(stats.fridayEveningChange),
              })}
            />
          )}
        </p>
        <p className="mt-2 text-xs text-sage">
          {t.dashboard.summaryNote}
        </p>
      </section>

      {/* Post a gathering → adds an event to the database */}
      <section className="rounded-2xl border border-bark bg-moss p-5">
        <h2 className="font-display text-2xl font-semibold">{t.dashboard.postTitle}</h2>
        <p className="mb-4 text-sm text-sage">{t.dashboard.postNote}</p>
        {error === "missing" && (
          <p role="alert" className="mb-3 rounded-lg border border-bark bg-olive px-3 py-2 text-sm">
            {t.dashboard.postMissing}
          </p>
        )}

        <form action={publishEvent} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t.dashboard.eventTitle} name="title" placeholder={t.dashboard.eventTitlePlaceholder} />
            <Field label={t.dashboard.dateTime} name="date" placeholder={t.dashboard.dateTimePlaceholder} />
            <label className="flex flex-col gap-1 text-sm text-sage">
              {t.dashboard.category}
              <select name="category" className="rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{categoryName(t, c)}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm text-sage">
            {t.dashboard.description}
            <textarea
              name="description"
              rows={3}
              className="rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist focus:border-mint focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">{t.dashboard.publish}</button>
            <button
              type="button"
              disabled
              title={t.dashboard.needsGemini}
              className="cursor-not-allowed rounded-full border border-bark px-6 py-3 font-semibold text-sage"
            >
              {t.dashboard.draftGemini}
            </button>
            <span className="text-xs text-sage">{t.dashboard.geminiNote}</span>
          </div>
        </form>
      </section>
    </main>
  );
}

function StatTile({ t, label, value, change }: { t: Dictionary; label: string; value: string; change: number }) {
  const up = change >= 0;
  return (
    <div className="rounded-2xl border border-bark bg-moss p-5">
      <p className="text-sm text-sage">{label}</p>
      <p className="font-display text-4xl font-bold">{value}</p>
      {/* Arrow + word, so the trend isn't shown by color alone */}
      <p className="text-sm text-sage">
        <span aria-hidden="true">{up ? "▲" : "▼"} </span>
        {fill(t.dashboard.vsLastWeek, { direction: up ? t.dashboard.up : t.dashboard.down, percent: Math.abs(change) })}
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

function ReviewStatus({ t, placeName, status }: { t: Dictionary; placeName: string; status: string | null }) {
  const rejected = status === "rejected";
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-sage">{t.dashboard.eyebrow}</p>
      <h1 className="font-display text-4xl font-bold">{placeName}</h1>
      <section role="status" className="flex flex-col gap-2 rounded-3xl border border-bark bg-moss p-6">
        <h2 className="font-display text-2xl font-semibold">
          {rejected ? t.dashboard.rejectedTitle : t.dashboard.pendingTitle}
        </h2>
        <p className="text-sage">
          {rejected ? t.dashboard.rejectedText : t.dashboard.pendingText}
        </p>
        {rejected && (
          <Link href="/welcome?as=business" className="mt-2 w-fit rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">
            {t.dashboard.resubmit}
          </Link>
        )}
      </section>
    </main>
  );
}
