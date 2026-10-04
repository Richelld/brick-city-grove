import type { Dictionary } from "@/lib/i18n";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist placeholder:text-sage/70";

// Saved in English in the database; shown translated.
export const OWNER_TITLES = ["Owner", "Co-owner", "Manager"];

// What an admin uses to confirm the person really works at the business.
// `values` refills the fields after a failed submit; `phoneError` shows under the phone box.
export default function VerificationFields({
  t,
  values,
  phoneError,
}: {
  t: Dictionary;
  values?: { ownerTitle?: string; phone?: string; website?: string };
  phoneError?: string | null;
}) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-bark pt-4">
      <legend className="pb-2 text-sm font-semibold">{t.welcome.verifyTitle}</legend>
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.yourRole}
        <select key={values?.ownerTitle} name="ownerTitle" required defaultValue={values?.ownerTitle ?? OWNER_TITLES[0]} className={INPUT}>
          {OWNER_TITLES.map((title) => (
            <option key={title} value={title}>{t.welcome.roles[title]}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.phone}
        <input
          name="phone"
          type="tel"
          required
          defaultValue={values?.phone}
          placeholder="(973) 555-0123"
          aria-invalid={phoneError ? true : undefined}
          className={`${INPUT} ${phoneError ? "border-mint" : ""}`}
        />
        {phoneError && <span className="text-sm font-semibold text-mist">{phoneError}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.website}
        <input name="website" defaultValue={values?.website} placeholder={t.welcome.websitePlaceholder} className={INPUT} />
      </label>
    </fieldset>
  );
}
