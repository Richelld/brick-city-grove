// Gives an existing account admin access (approving businesses at /admin).
// Usage:   npm run make-admin -- someone@example.com
// Remove:  npm run make-admin -- someone@example.com --remove
// Only people with the database connection string can run this, which keeps admin safe.

import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();
const remove = process.argv.includes("--remove");
if (!email || !email.includes("@")) {
  console.log("Usage: npm run make-admin -- someone@example.com [--remove]");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rowCount } = await client.query(`update users set is_admin = $2 where lower(email) = $1`, [email, !remove]);
await client.end();

if (rowCount === 0) {
  console.log(`No account found for ${email}. Sign up or sign in first, then run this again.`);
  process.exit(1);
}
console.log(remove ? `${email} is no longer an admin.` : `${email} is now an admin. Sign out and back in if the Admin link doesn't show.`);
