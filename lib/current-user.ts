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

// Admins approve businesses. Set ADMIN_EMAILS in .env.local (comma-separated).
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(user.email.toLowerCase());
}
