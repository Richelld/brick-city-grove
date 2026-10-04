import Link from "next/link";
import { connection } from "next/server";
import MapPlaceholder from "./components/MapPlaceholder";
import MapView from "./components/MapView";
import LiveCounter from "./components/LiveCounter";
import HomeTabs, { type Tab } from "./components/HomeTabs";
import { getPlaces, getEvents, getJobs, getDollarsKeptLocal, getHeatmap } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/server";

// Resident home screen. This is a server component, so it can read
// from the database directly and pass the results to HomeTabs.
// The URL can pick the starting tab and search, e.g. /?tab=events or /?q=Teixeira.
export default async function Home({ searchParams }: PageProps<"/">) {
  await connection(); // Load fresh data on every visit instead of once at build time.
  const { tab, q } = await searchParams;
  const startTab: Tab = tab === "events" || tab === "jobs" ? tab : "food";
  const startSearch = typeof q === "string" ? q : "";

  const [places, events, jobs, dollars, heat, { t }] = await Promise.all([
    getPlaces(),
    getEvents(),
    getJobs(),
    getDollarsKeptLocal(),
    getHeatmap(),
    getDictionary(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8">
      {/* Hero: tagline and the "dollars kept local" counter */}
      <section className="flex flex-col gap-5 rounded-3xl border border-bark bg-moss p-6 sm:p-10">
        <span className="w-fit rounded-full bg-olive px-3 py-1 text-sm font-medium">
          {t.home.badge}
        </span>
        <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          {t.home.title}
        </h1>
        <p className="max-w-xl text-lg text-sage">
          {t.home.intro}
        </p>

        <div className="rounded-2xl border border-bark bg-olive p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-sage">{t.home.dollarsTitle}</p>
          <LiveCounter initialDollars={dollars} />
          <p className="mt-1 text-sm text-sage">{t.home.dollarsNote}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/?tab=food#browse" className="rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">
            {t.home.exploreGroves}
          </Link>
          <Link href="/?tab=events#browse" className="rounded-full border border-bark px-6 py-3 font-semibold hover:border-mint">
            {t.home.seeHappening}
          </Link>
        </div>
      </section>

      {/* Teammates without an Azure key in .env.local see the placeholder instead. */}
      {process.env.NEXT_PUBLIC_AZURE_MAPS_KEY ? <MapView places={places} heat={heat} /> : <MapPlaceholder />}

      {/* key makes HomeTabs restart on the new tab when a menu link changes the URL */}
      <HomeTabs
        key={`${startTab}-${startSearch}`}
        places={places}
        events={events}
        jobs={jobs}
        startTab={startTab}
        startSearch={startSearch}
      />
    </main>
  );
}
