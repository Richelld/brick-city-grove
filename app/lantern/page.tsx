import { connection } from "next/server";
import ListingCard from "../components/ListingCard";
import { getResources } from "@/lib/db";
import { categoryName } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";

// Lantern Board: free community resources (pantries, library programs, clinics, campus events).
export default async function LanternBoard() {
  await connection();
  const [resources, { t }] = await Promise.all([getResources(), getDictionary()]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-sage">{t.lantern.eyebrow}</p>
        <h1 className="font-display text-4xl font-bold">{t.lantern.title}</h1>
        <p className="max-w-xl text-lg text-sage">{t.lantern.intro}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {resources.map((r) => {
          const kind = categoryName(t, r.kind);
          return (
            <ListingCard
              key={r.id}
              title={r.name}
              subtitle={`${kind} · ${r.location}`}
              detail={r.detail}
              photo={null}
              label={kind}
              isSample={r.isSample}
              sampleLabel={t.tabs.sample}
            />
          );
        })}
      </div>
    </main>
  );
}
