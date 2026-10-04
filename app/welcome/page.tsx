import Link from "next/link";
import { redirect } from "next/navigation";
import Rich from "../components/Rich";
import { getCurrentUser, isAdmin } from "@/lib/current-user";
import { getClaimablePlaces } from "@/lib/db";
import { BUSINESS_CATEGORIES } from "@/lib/categories";
import { categoryName, fill, type Dictionary } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import { chooseResident, claimBusiness, addNewBusiness } from "../login/actions";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist placeholder:text-sage/70";
const CARD = "flex flex-col gap-4 rounded-3xl border border-bark bg-moss p-6";
const BUTTON = "rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90";

// Saved in English in the database; shown translated.
const OWNER_TITLES = ["Owner", "Co-owner", "Manager"];

// First sign-in only: confirm "resident", or set up a business (which then needs admin approval).
// /welcome?as=business shows the business forms; anything else shows the resident one.
export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "business") redirect("/dashboard");
  if (user.role === "resident") redirect(isAdmin(user) ? "/admin" : "/");

  const { as, error } = await searchParams;
  const firstName = user.name?.split(" ")[0];
  const { t } = await getDictionary();

  if (as !== "business") {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
        <h1 className="font-display text-4xl font-bold">{firstName ? fill(t.welcome.hiName, { name: firstName }) : t.welcome.hi}</h1>
        <form action={chooseResident} className={CARD}>
          <p className="text-lg"><Rich text={t.welcome.joiningResident} /></p>
          <button className={BUTTON}>{t.welcome.startExploring}</button>
          <Link href="/welcome?as=business" className="text-center text-sm text-sage underline">
            {t.welcome.ownBusiness}
          </Link>
        </form>
      </main>
    );
  }

  const claimable = await getClaimablePlaces();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-bold">{firstName ? fill(t.welcome.setUpName, { name: firstName }) : t.welcome.setUp}</h1>
        <p className="text-lg text-sage">
          <Rich text={t.welcome.setUpIntro} />
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3">
          {t.welcome.error}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Option 1: claim an existing listing */}
        <form action={claimBusiness} className={CARD}>
          <h2 className="font-display text-2xl font-semibold">{t.welcome.listedTitle}</h2>
          <label className="flex flex-col gap-1 text-sm text-sage">
            {t.welcome.yourBusiness}
            <select name="place" required className={INPUT}>
              {claimable.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {categoryName(t, p.category)}</option>
              ))}
            </select>
          </label>
          <VerificationFields t={t} />
          <button className={BUTTON}>{t.welcome.requestAccess}</button>
        </form>

        {/* Option 2: add a new business (any kind, not just food) */}
        <form action={addNewBusiness} className={CARD}>
          <h2 className="font-display text-2xl font-semibold">{t.welcome.addTitle}</h2>
          <label className="flex flex-col gap-1 text-sm text-sage">
            {t.welcome.businessName}
            <input name="name" required className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-sage">
            {t.welcome.businessType}
            <select name="category" required className={INPUT}>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryName(t, c)}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-sage">
            {t.welcome.address}
            <input name="address" required placeholder="91 Halsey St" className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-sage">
            {t.welcome.neighborhood}
            <input name="neighborhood" placeholder={t.welcome.neighborhoodPlaceholder} className={INPUT} />
          </label>
          <VerificationFields t={t} />
          <button className={BUTTON}>{t.welcome.submitReview}</button>
        </form>
      </div>

      <Link href="/welcome?as=resident" className="text-center text-sm text-sage underline">
        {t.welcome.residentInstead}
      </Link>
    </main>
  );
}

// What an admin uses to confirm the person really runs the business.
function VerificationFields({ t }: { t: Dictionary }) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-bark pt-4">
      <legend className="pb-2 text-sm font-semibold">{t.welcome.verifyTitle}</legend>
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.yourRole}
        <select name="ownerTitle" required className={INPUT}>
          {OWNER_TITLES.map((title) => (
            <option key={title} value={title}>{t.welcome.roles[title]}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.phone}
        <input name="phone" type="tel" required placeholder="(973) 555-0123" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-sage">
        {t.welcome.website}
        <input name="website" placeholder={t.welcome.websitePlaceholder} className={INPUT} />
      </label>
    </fieldset>
  );
}
