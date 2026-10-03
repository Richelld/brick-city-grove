// Database helpers. Only import this from server code (pages, route handlers),
// never from a "use client" file — it uses the secret DATABASE_URL.

import { Pool } from "pg";
import type { Place, GroveEvent, Job, Resource } from "./fake-data";

// Reuse one connection pool, even when Next.js hot-reloads in development.
const globalForDb = globalThis as unknown as { pool?: Pool };
const pool = globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
globalForDb.pool = pool;

// "as" renames snake_case columns to the camelCase names the UI uses.
export async function getPlaces(): Promise<Place[]> {
  const { rows } = await pool.query(
    `select id, name, category, neighborhood, address, lat, lng, hours, photo, is_sample as "isSample" from places order by name`
  );
  return rows;
}

export async function getEvents(): Promise<GroveEvent[]> {
  const { rows } = await pool.query(
    `select id, title, date, location, category, photo, is_sample as "isSample" from events order by id`
  );
  return rows;
}

export async function getJobs(): Promise<Job[]> {
  const { rows } = await pool.query(
    `select id, role, business, pay, shift, is_sample as "isSample" from jobs order by id`
  );
  return rows;
}

// Total spent at local businesses in the last 7 days, in dollars.
export async function getDollarsKeptLocal(): Promise<number> {
  const { rows } = await pool.query(
    `select coalesce(sum(amount_cents), 0) / 100 as dollars from visits where time > now() - interval '7 days'`
  );
  return Number(rows[0].dollars);
}

export async function getResources(): Promise<Resource[]> {
  const { rows } = await pool.query(
    `select id, name, kind, location, detail, is_sample as "isSample" from resources order by id`
  );
  return rows;
}

// ---- Owner dashboard ----
// Seeds rule for now: 1 Seed for every $10 spent.

export type DashboardStats = {
  visitsThisWeek: number;
  visitsLastWeek: number;
  seedsThisWeek: number;
  seedsLastWeek: number;
  busiestHour: number | null; // 0–23, Newark time
  busiestHourAvg: number;     // average visits in that hour on a weekday
  trafficByHour: { hour: number; avg: number }[]; // average weekday, last 4 weeks
  fridayEveningChange: number | null; // % change in Fri 5–9pm visits vs last week; null if none
};

// Shorthand used in the queries below.
const THIS_WEEK = `time > now() - interval '7 days'`;
const LAST_WEEK = `time <= now() - interval '7 days' and time > now() - interval '14 days'`;
const FRI_EVENING = `extract(isodow from time at time zone 'America/New_York') = 5
                     and extract(hour from time at time zone 'America/New_York') between 17 and 20`;

export async function getDashboardStats(placeId: string): Promise<DashboardStats> {
  const weeks = await pool.query(
    `select
       count(*) filter (where ${THIS_WEEK}) as visits_this,
       count(*) filter (where ${LAST_WEEK}) as visits_last,
       coalesce(sum(amount_cents) filter (where ${THIS_WEEK}), 0) / 1000 as seeds_this,
       coalesce(sum(amount_cents) filter (where ${LAST_WEEK}), 0) / 1000 as seeds_last,
       count(*) filter (where ${THIS_WEEK} and ${FRI_EVENING}) as fri_this,
       count(*) filter (where ${LAST_WEEK} and ${FRI_EVENING}) as fri_last
     from visits where place_id = $1 and time > now() - interval '14 days'`,
    [placeId]
  );

  // Weekday visits per hour over the last 4 weeks, divided by 20 weekdays = average weekday.
  const hours = await pool.query(
    `select extract(hour from time at time zone 'America/New_York')::int as hour, count(*) / 20.0 as avg
     from visits
     where place_id = $1 and time > now() - interval '28 days'
       and extract(isodow from time at time zone 'America/New_York') < 6
     group by 1 order by 1`,
    [placeId]
  );

  const w = weeks.rows[0];
  const trafficByHour: { hour: number; avg: number }[] = hours.rows.map((r) => ({
    hour: r.hour,
    avg: Math.round(Number(r.avg)),
  }));
  const busiest = trafficByHour.reduce<{ hour: number; avg: number } | null>(
    (best, h) => (best === null || h.avg > best.avg ? h : best),
    null
  );
  const friLast = Number(w.fri_last);

  return {
    visitsThisWeek: Number(w.visits_this),
    visitsLastWeek: Number(w.visits_last),
    seedsThisWeek: Number(w.seeds_this),
    seedsLastWeek: Number(w.seeds_last),
    busiestHour: busiest?.hour ?? null,
    busiestHourAvg: busiest?.avg ?? 0,
    trafficByHour,
    fridayEveningChange: friLast > 0 ? Math.round(((Number(w.fri_this) - friLast) / friLast) * 100) : null,
  };
}

// Adds an event posted from the owner dashboard.
export async function addEvent(e: { title: string; date: string; location: string; category: string; description: string }) {
  await pool.query(
    `insert into events (id, title, date, location, category, description, photo, is_sample)
     values ($1, $2, $3, $4, $5, $6, null, false)`,
    [`e-${Date.now()}`, e.title, e.date, e.location, e.category, e.description || null]
  );
}
