// Creates the tables and loads the placeholder data from lib/fake-data.ts.
// Run with: npm run db:seed
// Re-running is safe: existing rows are updated, not duplicated.

import { readFileSync } from "node:fs";
import pg from "pg";
import { places, events, jobs, resources } from "../lib/fake-data.ts";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

console.log("Creating tables…");
await client.query(readFileSync("db/schema.sql", "utf8"));

console.log(`Seeding ${places.length} places…`);
for (const p of places) {
  await client.query(
    `insert into places (id, name, category, neighborhood, address, lat, lng, hours, photo, photo_is_logo, is_sample)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     on conflict (id) do update set name = $2, category = $3, neighborhood = $4, address = $5,
       lat = $6, lng = $7, hours = $8, photo = $9, photo_is_logo = $10, is_sample = $11`,
    [p.id, p.name, p.category, p.neighborhood, p.address, p.lat, p.lng, p.hours, p.photo, p.photoIsLogo, p.isSample]
  );
}

console.log(`Seeding ${events.length} events…`);
for (const e of events) {
  await client.query(
    `insert into events (id, title, date, location, category, photo, is_sample)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (id) do update set title = $2, date = $3, location = $4, category = $5, photo = $6, is_sample = $7`,
    [e.id, e.title, e.date, e.location, e.category, e.photo, e.isSample]
  );
}

console.log(`Seeding ${jobs.length} jobs…`);
for (const j of jobs) {
  await client.query(
    `insert into jobs (id, role, business, pay, shift, photo, is_sample)
     values ($1, $2, $3, $4, $5, $6, $7)
     on conflict (id) do update set role = $2, business = $3, pay = $4, shift = $5, photo = $6, is_sample = $7`,
    [j.id, j.role, j.business, j.pay, j.shift, j.photo, j.isSample]
  );
}

console.log(`Seeding ${resources.length} resources…`);
for (const r of resources) {
  await client.query(
    `insert into resources (id, name, kind, location, detail, is_sample)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (id) do update set name = $2, kind = $3, location = $4, detail = $5, is_sample = $6`,
    [r.id, r.name, r.kind, r.location, r.detail, r.isSample]
  );
}

// Simulated activity (tell judges it's simulated): 500–2,500 visits per place over the
// last 4 weeks (so some places are busier, for the heatmap), each spending $4–$30. Visits cluster around a busy hour per type
// (cafes/bakeries 8am, delis noon, restaurants 7pm, Newark time). Replaced on every seed.
console.log("Simulating 4 weeks of visits…");
await client.query(`delete from visits`);
await client.query(
  `insert into visits (time, place_id, amount_cents)
   select (date_trunc('day', now() at time zone 'America/New_York')
           - floor(random() * 28) * interval '1 day'
           + greatest(6, least(22, p.peak + round((random() + random() + random() - 1.5) * 3))) * interval '1 hour'
           + random() * interval '1 hour') at time zone 'America/New_York',
          p.id,
          (400 + random() * 2600)::int
   from (select id, case category when 'Restaurant' then 19 when 'Deli' then 12 else 8 end as peak,
                (500 + random() * 2000)::int as visit_count
         from places) p
   cross join lateral generate_series(1, p.visit_count)`
);
await client.query(`delete from visits where time > now()`); // no visits from the future

console.log("Refreshing hourly summary…");
await client.query(`call refresh_continuous_aggregate('visits_hourly', null, null)`);

await client.end();
console.log("Done.");
