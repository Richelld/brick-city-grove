import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwords";
import { createAccount } from "../login/actions";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist";

const ERRORS: Record<string, string> = {
  fields: "Please enter your name and a valid email.",
  short: `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`,
  match: "The two passwords don't match.",
  taken: "That email already has an account. Sign in instead (with Google if that's how you joined).",
};

// Create an account without Google. After this, people pick resident/business on /welcome,
// and business accounts still need admin approval.
export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  if (await getCurrentUser()) redirect("/welcome");
  const { error, as } = await searchParams;
  const isBusiness = as === "business"; // pre-select from the login card they came from

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-4xl font-bold">Create an account</h1>
        <p className="text-sage">
          Already have an account?{" "}
          <Link href={`/login/email?as=${isBusiness ? "business" : "resident"}`} className="font-semibold text-mist underline">
            Sign in
          </Link>{" "}
          · <Link href="/login" className="font-semibold text-mist underline">Use Google</Link>
        </p>
      </header>

      {typeof error === "string" && ERRORS[error] && (
        <p role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3">{ERRORS[error]}</p>
      )}

      <form action={createAccount} className="flex flex-col gap-4 rounded-3xl border border-bark bg-moss p-6">
        <label className="flex flex-col gap-1 text-sm text-sage">
          Name
          <input name="name" required autoComplete="name" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-sage">
          Email
          <input name="email" type="email" required autoComplete="email" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-sage">
          Password (at least {MIN_PASSWORD_LENGTH} characters)
          <input name="password" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-sage">
          Confirm password
          <input name="confirm" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" className={INPUT} />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 text-sm text-sage">I&apos;m joining as a…</legend>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="resident" defaultChecked={!isBusiness} /> Resident
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="type" value="business" defaultChecked={isBusiness} /> Business owner (needs approval)
          </label>
        </fieldset>

        <button className="rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">Create account</button>
      </form>
    </main>
  );
}
