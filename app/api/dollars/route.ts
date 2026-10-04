// The "dollars kept local this week" number, for the live counter on the home page.
// Not cached: it reads the database on every request.

import { getDollarsKeptLocal } from "@/lib/db";

export async function GET() {
  return Response.json({ dollars: await getDollarsKeptLocal() });
}
