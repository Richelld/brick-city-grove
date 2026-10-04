// Demo mode: keeps adding simulated purchases so the "dollars kept local" counter goes up live.
// Run in a second terminal while the app is running:  npm run demo:live
// Change the pace (seconds between purchases):        npm run demo:live -- --every=120
// Stop with Ctrl+C. Purchases are simulated, so say so in the demo.

import pg from "pg";

const everyArg = process.argv.find((a) => a.startsWith("--every="));
const EVERY_SECONDS = everyArg ? Number(everyArg.split("=")[1]) : 20;
if (!(EVERY_SECONDS > 0)) throw new Error("--every must be a number of seconds, e.g. --every=60");

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

// Picks a business at random, favoring the ones that are usually busy at this day and hour
// (so a cafe gets the 8am purchases and a restaurant the 7pm ones), then adds a $4–$30 purchase.
async function addPurchase() {
  const { rows } = await client.query(
    `with weights as (
       select p.id, p.name, coalesce(sum(v.visits), 0) + 1 as weight
       from places p
       left join visits_hourly v on v.place_id = p.id
         and v.bucket >= now() - interval '28 days'
         and extract(isodow from v.bucket at time zone 'America/New_York') = extract(isodow from now() at time zone 'America/New_York')
         and extract(hour from v.bucket at time zone 'America/New_York') = extract(hour from now() at time zone 'America/New_York')
       where p.status = 'approved'
       group by p.id, p.name
     )
     select id, name from weights order by -ln(1 - random()) / weight limit 1`
  );
  if (rows.length === 0) throw new Error("No approved places. Run npm run db:seed first.");

  const cents = 400 + Math.floor(Math.random() * 2600);
  await client.query(`insert into visits (time, place_id, amount_cents) values (now(), $1, $2)`, [rows[0].id, cents]);

  const total = await client.query(
    `select coalesce(sum(amount_cents), 0) / 100 as dollars from visits where time > now() - interval '7 days'`
  );
  const time = new Date().toLocaleTimeString("en-US");
  console.log(`${time}  +$${(cents / 100).toFixed(2)} at ${rows[0].name}  →  $${Number(total.rows[0].dollars).toLocaleString("en-US")} kept local this week`);
}

console.log(`Demo mode: adding a simulated purchase every ${EVERY_SECONDS}s. Press Ctrl+C to stop.`);
await addPurchase();
const timer = setInterval(() => addPurchase().catch((e) => console.error(e.message)), EVERY_SECONDS * 1000);

process.on("SIGINT", async () => {
  clearInterval(timer);
  await client.end();
  console.log("\nDemo mode stopped.");
  process.exit(0);
});
