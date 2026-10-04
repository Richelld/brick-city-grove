import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";
import { fill } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import { createAccount } from "../login/actions";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist";

// Create an account without Google. After this, people pick resident/business on /welcome,
// and business accounts still need admin approval.
export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (await getCurrentUser()) redirect("/welcome");
  const { error, as } = await searchParams;
  const isBusiness = as === "business"; // pre-select from the login card they came from
  const { t } = await getDictionary();
  const errorText = typeof error === "string" ? t.signup.errors[error] : undefined;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-4xl font-bold">{t.signup.title}</h1>
        <p className="text-sage">
          {t.signup.haveAccount}{" "}
          <Link href={`/login/email?as=${isBusiness ? "business" : "resident"}`} className="font-semibold text-mist underline">
            {t.signup.signIn}
          </Link>{" "}
          · <Link href="/login" className="font-semibold text-mist underline">{t.signup.useGoogle}</Link>
        </p>
      </header>

      {errorText && (
        <p role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3">{fill(errorText, { min: MIN_PASSWORD_LENGTH })}</p>
      )}

      <form action={createAccount} className="flex flex-col gap-4 rounded-3xl border border-bark bg-moss p-6">
        <label className="flex flex-col gap-1 text-sm text-sage">
          {t.signup.name}
          <input name="name" required autoComplete="name" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-sage">
          {t.signup.email}
          <input name="email" type="email" required autoComplete="email" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-sage">
          {fill(t.signup.password, { min: MIN_PASSWORD_LENGTH })}
          <input name="password" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-sage">
          {t.signup.confirm}
          <input name="confirm" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={INPUT} />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 text-sm text-sage">{t.signup.joiningAs}</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="resident" defaultChecked={!isBusiness} /> {t.signup.resident}
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="business" defaultChecked={isBusiness} /> {t.signup.business}
          </label>
        </fieldset>

        <button className="rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">{t.signup.submit}</button>
      </form>
    </main>
  );
}
