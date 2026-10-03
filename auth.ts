// Sign-in with Auth.js. Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from .env.local.
// Google only proves who someone is; their role (resident/business) lives in our users table.
// People can also create an account with email + password (no Google needed).

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { upsertUser, getPasswordUser } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";

// Email + password sign-in for accounts made on /signup.
const passwordLogin = Credentials({
  id: "password",
  name: "Email and password",
  credentials: { email: {}, password: {} },
  async authorize(credentials) {
    const email = String(credentials.email ?? "").trim().toLowerCase();
    const user = await getPasswordUser(email);
    if (!user || !(await verifyPassword(String(credentials.password ?? ""), user.passwordHash))) return null;
    return { id: email, email, name: user.name };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, passwordLogin],
  pages: { signIn: "/login" }, // use our login page instead of the default one
  callbacks: {
    // Runs after sign-in succeeds: save the person in Tiger Cloud.
    async signIn({ user }) {
      if (!user.email) return false;
      await upsertUser(user.email, user.name ?? null, user.image ?? null);
      return true;
    },
  },
});
