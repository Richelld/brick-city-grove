"use client"; // Picking a language saves it in a cookie and re-renders the page.

import { useTransition } from "react";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n";
import { setLanguage } from "@/lib/i18n/actions";
import { useTranslation } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { locale, t } = useTranslation();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center rounded-full border border-bark bg-moss px-3 py-2 text-sm font-semibold hover:border-mint">
      <span className="sr-only">{t.header.language}</span>
      <span aria-hidden="true" className="mr-1">🌐</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          startTransition(() => setLanguage(next));
        }}
        className="cursor-pointer bg-transparent outline-none disabled:opacity-60"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} lang={l} className="bg-moss text-mist">
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
