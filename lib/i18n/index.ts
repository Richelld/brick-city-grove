// All the text on the site, in every language. Safe to import from server and client code.
import enUS, { type Dictionary } from "./dictionaries/en-US";
import es from "./dictionaries/es";
import ptBR from "./dictionaries/pt-BR";
import type { Locale } from "./locales";

export type { Dictionary };
export * from "./locales";

export const DICTIONARIES: Record<Locale, Dictionary> = { "en-US": enUS, es, "pt-BR": ptBR };

// Translated name for a category stored in English in the database, e.g. "Bakery" -> "Panadería".
// Unknown categories (added later) are shown as they are.
export function categoryName(t: Dictionary, category: string): string {
  return t.categories[category] ?? category;
}
