"use client"; // Gives client components the visitor's language.

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, DICTIONARIES, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

// Wraps the whole page in app/layout.tsx with the language the server picked.
export default function LanguageProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

// In a client component: const { locale, t } = useTranslation();
export function useTranslation() {
  const locale = useContext(LocaleContext);
  return { locale, t: DICTIONARIES[locale] };
}
