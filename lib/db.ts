// Database helpers. Only import this from server code (pages, route handlers),
// never from a "use client" file — it uses the secret DATABASE_URL.

import { Pool } from "pg";
import type { Place, GroveEvent, Job, Resource } from "./fake-data";

// Reuse one connection pool, even when Next.js hot-reloads in development.
const globalForDb = globalThis as unknown as { pool?: Pool };
const pool = globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
globalForDb.pool = pool;

// "as" renames snake_case columns to the camelCase names the UI uses.
// Only approved businesses are public; pending ones wait for an admin.
export async function getPlaces(): Promise<Place[]> {
  const { rows } = await pool.query(
    `select id, name, category, neighborhood, address, lat, lng, hours, photo, is_sample as "isSample"
     from places where status = 'approved' order by name`
  );
  return rows;
}

// Any place by id, including pending ones (for the owner's own status page).
export async function getPlaceById(id: string): Promise<Place | null> {
  const { rows } = await pool.query(
    `select id, name, category, neighborhood, address, lat, lng, hours, photo, is_sample as "isSample"
     from places where id = $1`,
    [id]
  );
  return rows[0] ?? null;
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

// ---- Users (Google sign-in) ----

export type User = {
  id: number;
  email: string;
  name: string | null;
  role: "resident" | "business" | null; // null = hasn't picked yet
  placeId: string | null;               // the business they own, if role = business
  businessStatus: "pending" | "approved" | "rejected" | null;
};

// Called on every Google sign-in: creates the user the first time, updates name/photo after.
export async function upsertUser(email: string, name: string | null, image: string | null) {
  await pool.query(
    `insert into users (email, name, image) values ($1, $2, $3)
     on conflict (email) do update set name = $2, image = $3`,
    [email, name, image]
  );
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query(
    `select id, email, name, role, place_id as "placeId", business_status as "businessStatus" from users where email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function becomeResident(email: string) {
  await pool.query(`update users set role = 'resident' where email = $1 and role is null`, [email]);
}

// ---- Business verification ----

export type ClaimDetails = { ownerTitle: string; phone: string; website: string };

// Approved businesses that don't have an approved owner yet (can be claimed).
export async function getClaimablePlaces(): Promise<Place[]> {
  const places = await getPlaces();
  const { rows } = await pool.query(
    `select place_id from users where business_status = 'approved' and place_id is not null`
  );
  const owned = new Set(rows.map((r) => r.place_id));
  return places.filter((p) => !owned.has(p.id));
}

// Owner asks to manage an existing listing. Stays pending until an admin approves.
export async function requestBusinessClaim(email: string, placeId: string, d: ClaimDetails) {
  await pool.query(
    `update users set role = 'business', place_id = $2, business_status = 'pending',
       owner_title = $3, business_phone = $4, business_website = $5
     where email = $1 and role is null`,
    [email, placeId, d.ownerTitle, d.phone, d.website || null]
  );
}

// Owner adds a business that isn't listed yet. The place is hidden until approved.
export async function createPendingPlace(p: {
  name: string; category: string; neighborhood: string; address: string; lat: number | null; lng: number | null;
}): Promise<string> {
  const id = `b-${Date.now()}`;
  await pool.query(
    `insert into places (id, name, category, neighborhood, address, lat, lng, hours, photo, is_sample, status)
     values ($1, $2, $3, $4, $5, $6, $7, 'Hours: TBD', null, false, 'pending')`,
    [id, p.name, p.category, p.neighborhood, p.address, p.lat, p.lng]
  );
  return id;
}

export type BusinessRequest = {
  userId: number;
  name: string | null;
  email: string;
  ownerTitle: string | null;
  phone: string | null;
  website: string | null;
  status: "pending" | "approved" | "rejected";
  placeId: string;
  placeName: string;
  placeCategory: string;
  placeAddress: string | null;
  isNewPlace: boolean;     // the owner added this business themselves
  alreadyOwned: boolean;   // someone else is already the approved owner
};

// Everything the admin page needs, newest first.
export async function getBusinessRequests(): Promise<BusinessRequest[]> {
  const { rows } = await pool.query(
    `select u.id as "userId", u.name, u.email, u.owner_title as "ownerTitle", u.business_phone as phone,
            u.business_website as website, u.business_status as status,
            p.id as "placeId", p.name as "placeName", p.category as "placeCategory", p.address as "placeAddress",
            (p.status <> 'approved') as "isNewPlace",
            exists (select 1 from users o where o.place_id = u.place_id and o.business_status = 'approved'
                    and o.id <> u.id) as "alreadyOwned"
     from users u join places p on p.id = u.place_id
     where u.role = 'business'
     order by (u.business_status = 'pending') desc, u.created_at desc`
  );
  return rows;
}

// Approving the owner also makes their business public (if it was new).
export async function approveBusiness(userId: number) {
  await pool.query(`update users set business_status = 'approved' where id = $1`, [userId]);
  await pool.query(
    `update places set status = 'approved' where id = (select place_id from users where id = $1)`,
    [userId]
  );
}

export async function rejectBusiness(userId: number) {
  await pool.query(`update users set business_status = 'rejected' where id = $1`, [userId]);
  // A business the owner created themselves is rejected too; existing listings stay public.
  await pool.query(
    `update places set status = 'rejected'
     where id = (select place_id from users where id = $1) and status = 'pending'`,
    [userId]
  );
}
