"use client"; // Needs useState for the active tab and the search box.

import { useState } from "react";
import ListingCard from "./ListingCard";
import type { Place, GroveEvent, Job } from "@/lib/fake-data";

export type Tab = "food" | "events" | "jobs";

// Forest name + plain label, so new users and screen readers aren't confused.
const TABS: { id: Tab; name: string; plain: string }[] = [
  { id: "food", name: "Groves", plain: "Food & Shops" },
  { id: "events", name: "Gatherings", plain: "Events" },
  { id: "jobs", name: "Quests", plain: "Jobs" },
];


type Props = {
  places: Place[];
  events: GroveEvent[];
  jobs: Job[];
  startTab: Tab;
  startSearch: string;
};

export default function HomeTabs({ places, events, jobs, startTab, startSearch }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(startTab);
  const [search, setSearch] = useState(startSearch);

  // Turn whichever list is active into the same card shape.
  let cards;
  if (activeTab === "food") {
    cards = places.map((p) => ({ id: p.id, title: p.name, subtitle: `${p.category} · ${p.neighborhood}`, detail: p.hours, photo: p.photo, label: p.category, isSample: p.isSample }));
  } else if (activeTab === "events") {
    cards = events.map((e) => ({ id: e.id, title: e.title, subtitle: e.date, detail: e.location, photo: e.photo, label: e.category, isSample: e.isSample }));
  } else {
    cards = jobs.map((j) => ({ id: j.id, title: j.role, subtitle: j.business, detail: `${j.pay} · ${j.shift}`, photo: null, label: "Job", isSample: j.isSample }));
  }

  // Simple search: keep cards whose title contains the search text.
  const visible = cards.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <section id="browse" className="flex scroll-mt-4 flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-sage">Search</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cafes, events, jobs…"
          className="rounded-xl border border-bark bg-moss px-4 py-3 text-base text-mist placeholder:text-sage/70 focus:border-mint focus:outline-none"
        />
      </label>

      <div role="tablist" aria-label="Categories" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
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

      <div role="tabpanel" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visible.map((c) => (
          <ListingCard key={c.id} title={c.title} subtitle={c.subtitle} detail={c.detail} photo={c.photo} label={c.label} isSample={c.isSample} />
        ))}
      </div>

      {visible.length === 0 && <p className="text-sage">Nothing matches “{search}”.</p>}
    </section>
  );
}
