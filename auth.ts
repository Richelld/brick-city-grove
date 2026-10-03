// Google sign-in with Auth.js. Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from .env.local.
// Google only proves who someone is; their role (resident/business) lives in our users table.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/login" }, // use our login page instead of the default one
  callbacks: {
    // Runs after Google says "yes": save the person in Tiger Cloud.
    async signIn({ user }) {
      if (!user.email) return false;
      await upsertUser(user.email, user.name ?? null, user.image ?? null);
      return true;
    },
  },
});
