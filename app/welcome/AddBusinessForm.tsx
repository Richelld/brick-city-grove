"use client"; // Keeps what you typed and shows which field needs fixing if the server says no.

import { useActionState } from "react";
import { useTranslation } from "../components/LanguageProvider";
import { BUSINESS_CATEGORIES } from "@/lib/categories";
import { categoryName } from "@/lib/i18n";
import { addNewBusiness, type AddBusinessState } from "../login/actions";
import DescriptionField from "./DescriptionField";
import PhotoField from "./PhotoField";
import VerificationFields from "./VerificationFields";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist placeholder:text-sage/70";
const CARD = "flex flex-col gap-4 rounded-3xl border border-bark bg-moss p-6";
const BUTTON = "rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90 disabled:opacity-50";

// "Add my business": a business that isn't listed yet, with an optional description and photo.
export default function AddBusinessForm() {
  const { t } = useTranslation();
  const [state, formAction, pending] = useActionState<AddBusinessState, FormData>(addNewBusiness, null);
  const values = state?.values ?? {};
  const errorFor = (field: NonNullable<AddBusinessState>["errors"][number]) =>
    state?.errors.includes(field) ? t.welcome.fieldErrors[field] : null;

  return (
    <form action={formAction} className={CARD}>
      <h2 className="font-display text-2xl font-semibold">{t.welcome.addTitle}</h2>

      {state && state.errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3 text-sm">
          <p className="font-semibold">{t.welcome.fixBelow}</p>
          <ul className="mt-1 list-disc pl-5">
            {state.errors.map((e) => (
              <li key={e}>{t.welcome.fieldErrors[e]}</li>
            ))}
          </ul>
        </div>
      )}

      <Field label={t.welcome.businessName} error={errorFor("name")}>
        <input name="name" required defaultValue={values.name} className={INPUT} />
      </Field>
      <Field label={t.welcome.businessType} error={errorFor("category")}>
        {/* key: dropdowns only read defaultValue once, so rebuild it to keep the choice after an error */}
        <select key={values.category} name="category" required defaultValue={values.category || BUSINESS_CATEGORIES[0]} className={INPUT}>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{categoryName(t, c)}</option>
          ))}
        </select>
      </Field>
      <Field label={t.welcome.address} error={errorFor("address")}>
        <input name="address" required defaultValue={values.address} placeholder="91 Halsey St" className={INPUT} />
      </Field>
      <Field label={t.welcome.neighborhood}>
        <input name="neighborhood" defaultValue={values.neighborhood} placeholder={t.welcome.neighborhoodPlaceholder} className={INPUT} />
      </Field>

      <DescriptionField initialText={values.description} />
      <PhotoField error={errorFor("photo")} />
      <VerificationFields t={t} values={values} phoneError={errorFor("phone")} />

      <button disabled={pending} className={BUTTON}>
        {pending ? t.welcome.submitting : t.welcome.submitReview}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-sage">
      {label}
      {children}
      {error && <span className="text-sm font-semibold text-mist">{error}</span>}
    </label>
  );
}
