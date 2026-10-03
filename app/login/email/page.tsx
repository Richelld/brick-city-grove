import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { passwordSignIn } from "../actions";

const INPUT = "rounded-xl border border-bark bg-forest px-4 py-3 text-base text-mist";

// Email + password sign-in, for people who don't use Google.
// ?as=business|resident is passed on to "Create an account" so the right type is pre-selected.
export default async function EmailLoginPage({ searchParams }: PageProps<"/login/email">) {
  if (await getCurrentUser()) redirect("/welcome");
  const { as, error } = await searchParams;
  const type = as === "business" ? "business" : "resident";

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-4xl font-bold">Sign in with email</h1>
        <p className="text-sage">
          New here?{" "}
          <Link href={`/signup?as=${type}`} className="font-semibold text-mist underline">
            Create an account
          </Link>
        </p>
      </header>

      {error === "password" && (
        <p role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3">
          That email and password don&apos;t match an account.
        </p>
      )}

      <form action={passwordSignIn} className="flex flex-col gap-4 rounded-3xl border border-bark bg-moss p-6">
        <input type="hidden" name="as" value={type} />
        <label className="flex flex-col gap-1 text-sm text-sage">
          Email
          <input name="email" type="email" required autoComplete="email" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-sage">
          Password
          <input name="password" type="password" required autoComplete="current-password" className={INPUT} />
        </label>
        <button className="rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">Sign in</button>
      </form>

      <Link href="/login" className="text-center text-sm text-sage underline">
        Back to all sign-in options
      </Link>
    </main>
  );
}
