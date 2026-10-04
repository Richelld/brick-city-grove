// The languages the Grove can be shown in. Safe to import from server and client code.

export const LOCALES = ["en-US", "es", "pt-BR"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en-US";

// The visitor's choice is saved in this cookie by the language switcher.
export const LOCALE_COOKIE = "lang";

// What the switcher shows, written in each language's own words.
export const LOCALE_NAMES: Record<Locale, string> = {
  "en-US": "English (US)",
  es: "Español",
  "pt-BR": "Português (Brasil)",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// Picks the best supported language from an Accept-Language header, e.g. "pt-BR,pt;q=0.9,en;q=0.8".
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of wanted) {
    if (tag.startsWith("en")) return "en-US";
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("pt")) return "pt-BR";
  }
  return null;
}

// Fills "{name}" placeholders in a dictionary string.
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
