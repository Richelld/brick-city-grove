import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getClaimablePlaces } from "@/lib/db";
import { BUSINESS_CATEGORIES } from "@/lib/categories";
import { chooseResident, claimBusiness, addNewBusiness } from "../login/actions";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist placeholder:text-sage/70";
const CARD = "flex flex-col gap-4 rounded-3xl border border-bark bg-moss p-6";
const BUTTON = "rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90";

// First sign-in only: confirm "resident", or set up a business (which then needs admin approval).
// /welcome?as=business shows the business forms; anything else shows the resident one.
export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "business") redirect("/dashboard");
  if (user.role === "resident") redirect("/");

  const { as, error } = await searchParams;
  const firstName = user.name?.split(" ")[0];

  if (as !== "business") {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
        <h1 className="font-display text-4xl font-bold">Hi{firstName ? `, ${firstName}` : ""}!</h1>
        <form action={chooseResident} className={CARD}>
          <p className="text-lg">You&apos;re joining as a <strong>resident</strong>.</p>
          <button className={BUTTON}>Start exploring</button>
          <Link href="/welcome?as=business" className="text-center text-sm text-sage underline">
            I own a business instead
          </Link>
        </form>
      </main>
    );
  }

  const claimable = await getClaimablePlaces();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-4xl font-bold">Set up your business{firstName ? `, ${firstName}` : ""}</h1>
        <p className="text-lg text-sage">
          To keep the Grove trustworthy, our team checks every business before it goes live. We&apos;ll call the
          business phone number you give us to confirm. Until then, your account is <strong>pending</strong>.
        </p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3">
          Please fill in every required field, including a full 10-digit business phone number.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Option 1: claim an existing listing */}
        <form action={claimBusiness} className={CARD}>
          <h2 className="font-display text-2xl font-semibold">My business is listed</h2>
          <label className="flex flex-col gap-1 text-sm text-sage">
            Your business *
            <select name="place" required className={INPUT}>
              {claimable.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.category}</option>
              ))}
            </select>
          </label>
          <VerificationFields />
          <button className={BUTTON}>Request access</button>
        </form>

        {/* Option 2: add a new business (any kind, not just food) */}
        <form action={addNewBusiness} className={CARD}>
          <h2 className="font-display text-2xl font-semibold">Add my business</h2>
          <label className="flex flex-col gap-1 text-sm text-sage">
            Business name *
            <input name="name" required className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-sage">
            Type of business *
            <select name="category" required className={INPUT}>
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-sage">
            Street address *
            <input name="address" required placeholder="91 Halsey St" className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm text-sage">
            Neighborhood
            <input name="neighborhood" placeholder="Ironbound, Downtown, North Ward…" className={INPUT} />
          </label>
          <VerificationFields />
          <button className={BUTTON}>Submit for review</button>
        </form>
      </div>

      <Link href="/welcome?as=resident" className="text-center text-sm text-sage underline">
        I&apos;m a resident instead
      </Link>
    </main>
  );
}

// What an admin uses to confirm the person really runs the business.
function VerificationFields() {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-bark pt-4">
      <legend className="pb-2 text-sm font-semibold">How we&apos;ll verify you</legend>
      <label className="flex flex-col gap-1 text-sm text-sage">
        Your role *
        <select name="ownerTitle" required className={INPUT}>
          <option>Owner</option>
          <option>Co-owner</option>
          <option>Manager</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-sage">
        Business phone (public number) *
        <input name="phone" type="tel" required placeholder="(973) 555-0123" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-sage">
        Website or Instagram
        <input name="website" placeholder="instagram.com/yourbusiness" className={INPUT} />
      </label>
    </fieldset>
  );
}
