// Which language to show this visitor. Use in server components, server actions, and route handlers.
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, DICTIONARIES, LOCALE_COOKIE, isLocale, localeFromAcceptLanguage, type Locale } from ".";

// The language they picked in the switcher, else their browser's language, else American English.
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return localeFromAcceptLanguage((await headers()).get("accept-language")) ?? DEFAULT_LOCALE;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, t: DICTIONARIES[locale] };
}
