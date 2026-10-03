import { connection } from "next/server";
import ListingCard from "../components/ListingCard";
import { getResources } from "@/lib/db";

// Lantern Board: free community resources (pantries, library programs, clinics, campus events).
export default async function LanternBoard() {
  await connection();
  const resources = await getResources();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-sage">Lantern Board · Resources</p>
        <h1 className="font-display text-4xl font-bold">Free help, lit up for everyone.</h1>
        <p className="max-w-xl text-lg text-sage">
          Food pantries, library programs, free clinics, and NJIT &amp; Rutgers-Newark public events.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {resources.map((r) => (
          <ListingCard
            key={r.id}
            title={r.name}
            subtitle={`${r.kind} · ${r.location}`}
            detail={r.detail}
            photo={null}
            label={r.kind}
            isSample={r.isSample}
          />
        ))}
      </div>
    </main>
  );
}
