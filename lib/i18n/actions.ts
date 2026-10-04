"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from ".";

// Language switcher: remember the choice for a year. Setting a cookie in a server action
// makes Next.js re-render the current page, so it switches language right away.
export async function setLanguage(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
