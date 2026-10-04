"use client"; // Needs useState for the active tab and the search box.

import { useState } from "react";
import ListingCard from "./ListingCard";
import { useTranslation } from "./LanguageProvider";
import { categoryName, fill } from "@/lib/i18n";
import type { Place, GroveEvent, Job } from "@/lib/fake-data";

export type Tab = "food" | "events" | "jobs";

const ALL = "All"; // category filter value meaning "no filter"

type Props = {
  places: Place[];
  events: GroveEvent[];
  jobs: Job[];
  startTab: Tab;
  startSearch: string;
};

export default function HomeTabs({ places, events, jobs, startTab, startSearch }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>(startTab);
  const [search, setSearch] = useState(startSearch);
  const [category, setCategory] = useState(ALL); // Groves tab only

  // Forest name + plain label, so new users and screen readers aren't confused.
  const tabs: { id: Tab; name: string; plain: string }[] = [
    { id: "food", name: t.header.groves, plain: t.header.localBusinesses },
    { id: "events", name: t.header.gatherings, plain: t.header.events },
    { id: "jobs", name: t.header.quests, plain: t.header.jobs },
  ];

  // Category buttons: only the kinds of businesses that are actually listed.
  const categories = [ALL, ...Array.from(new Set(places.map((p) => p.category))).sort()];

  // Turn whichever list is active into the same card shape.
  let cards;
  if (activeTab === "food") {
    cards = places
      .filter((p) => category === ALL || p.category === category)
      .map((p) => {
        const kind = categoryName(t, p.category);
        return { id: p.id, title: p.name, subtitle: `${kind} · ${p.neighborhood}`, detail: p.hours, photo: p.photo, photoIsLogo: p.photoIsLogo, label: kind, isSample: p.isSample };
      });
  } else if (activeTab === "events") {
    cards = events.map((e) => ({ id: e.id, title: e.title, subtitle: e.date, detail: e.location, photo: e.photo, photoIsLogo: false, label: categoryName(t, e.category), isSample: e.isSample }));
  } else {
    cards = jobs.map((j) => ({ id: j.id, title: j.role, subtitle: j.business, detail: `${j.pay} · ${j.shift}`, photo: j.photo, photoIsLogo: false, label: t.tabs.job, isSample: j.isSample }));
  }

  // Simple search: keep cards whose title contains the search text.
  const visible = cards.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <section id="browse" className="flex scroll-mt-4 flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-sage">{t.tabs.search}</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.tabs.searchPlaceholder}
          className="rounded-xl border border-bark bg-moss px-4 py-3 text-base text-mist placeholder:text-sage/70 focus:border-mint focus:outline-none"
        />
      </label>

      <div role="tablist" aria-label={t.tabs.categoriesLabel} className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "rounded-full bg-mint px-4 py-2 text-sm font-semibold text-forest"
                : "rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold text-mist hover:border-mint"
            }
          >
            {tab.name}
            <span className={activeTab === tab.id ? "font-normal" : "font-normal text-sage"}> · {tab.plain}</span>
          </button>
        ))}
      </div>

      {activeTab === "food" && (
        <div aria-label={t.tabs.filterLabel} className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={
                category === c
                  ? "rounded-full border border-mint bg-olive px-3 py-1 text-sm font-semibold"
                  : "rounded-full border border-bark px-3 py-1 text-sm text-sage hover:border-mint"
              }
            >
              {c === ALL ? t.tabs.all : categoryName(t, c)}
            </button>
          ))}
        </div>
      )}

      <div role="tabpanel" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visible.map((c) => (
          <ListingCard key={c.id} title={c.title} subtitle={c.subtitle} detail={c.detail} photo={c.photo} photoIsLogo={c.photoIsLogo} label={c.label} isSample={c.isSample} sampleLabel={t.tabs.sample} />
        ))}
      </div>

      {visible.length === 0 && <p className="text-sage">{fill(t.tabs.noMatches, { search })}</p>}
    </section>
  );
}
