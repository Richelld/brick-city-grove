"use client"; // Shows a preview of the chosen photo before the form is sent.

import { useEffect, useState } from "react";
import { useTranslation } from "../components/LanguageProvider";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/business-form";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist file:mr-3 file:rounded-full file:border-0 file:bg-olive file:px-3 file:py-1 file:text-sm file:text-mist";

// Photo upload for the "Add my business" form. The server checks the file again (lib/photos.ts).
export default function PhotoField({ error: serverError }: { error?: string | null }) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Free the preview's memory when it changes or the form goes away.
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    setPreview(null);
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setError(t.welcome.photoTooBig);
      e.target.value = ""; // don't send it
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.photo}
        <input name="photo" type="file" accept={PHOTO_TYPES} onChange={onChange} className={INPUT} />
      </label>
      <p className="text-xs text-sage">{t.welcome.photoHint}</p>
      {(error ?? serverError) && <p className="text-sm font-semibold text-mist">{error ?? serverError}</p>}
      {preview && (
        // A local preview from the visitor's own computer, so a plain <img> is right here.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={t.welcome.photoPreview} className="aspect-square w-32 rounded-xl object-cover" />
      )}
    </div>
  );
}
