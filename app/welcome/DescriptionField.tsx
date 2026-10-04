"use client"; // The "Write with Gemini" button runs in the browser.

import { useRef, useState } from "react";
import { useTranslation } from "../components/LanguageProvider";
import { fill } from "@/lib/i18n";
import { MAX_DESCRIPTION_CHARS } from "@/lib/business-form";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist placeholder:text-sage/70 focus:border-mint focus:outline-none";

// Short description for the business card. Gemini can write a first draft from the
// name/type/neighborhood fields in the same form, or polish what the owner typed.
export default function DescriptionField({ initialText = "" }: { initialText?: string }) {
  const { t } = useTranslation();
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  // Read another field from the same form, e.g. the business name.
  function field(name: string): string {
    const el = box.current?.form?.elements.namedItem(name);
    return el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? el.value : "";
  }

  async function askGemini() {
    if (!field("name").trim()) {
      setError(t.welcome.geminiNeedsName);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: field("name"), category: field("category"), neighborhood: field("neighborhood"), draft: text }),
      });
      const data = await res.json();
      if (!res.ok || !data.description) throw new Error();
      setText(data.description);
    } catch {
      setError(t.welcome.geminiError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.description}
        <textarea
          ref={box}
          name="description"
          rows={3}
          value={text}
          maxLength={MAX_DESCRIPTION_CHARS}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.welcome.descriptionPlaceholder}
          className={INPUT}
        />
      </label>
      <p className="text-xs text-sage">{fill(t.welcome.descriptionHint, { count: text.length, max: MAX_DESCRIPTION_CHARS })}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={askGemini}
          disabled={loading}
          className="rounded-full border border-bark px-4 py-2 text-sm font-semibold hover:border-mint disabled:opacity-50"
        >
          {loading ? t.welcome.geminiWorking : text.trim() ? t.welcome.geminiPolish : t.welcome.geminiWrite}
        </button>
        <span className="text-xs text-sage">{t.welcome.geminiNote}</span>
      </div>
      <p role="status" aria-live="polite" className="text-sm">{error}</p>
    </div>
  );
}
