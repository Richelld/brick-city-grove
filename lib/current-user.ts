// Who is signed in right now? Returns our user row (with role), or null if signed out.
// Use this in server components and server actions.

import { auth } from "@/auth";
import { getUserByEmail, type User } from "./db";

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;
  return getUserByEmail(email);
}

// Admins approve businesses. Someone is an admin if:
//  - their account has the admin flag (npm run make-admin -- email), or
//  - they signed in with Google and their email is in ADMIN_EMAILS (Google verified the email).
// Password accounts never get admin from ADMIN_EMAILS: anyone could sign up with that address.
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.hasPassword) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(user.email.toLowerCase());
}
