import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { signInAsResident, signInAsBusiness } from "./actions";

// Login page: residents and business owners pick Google or email.
export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "business") redirect("/dashboard");
  if (user?.role === "resident") redirect("/");
  if (user) redirect("/welcome"); // signed in but hasn't picked a role yet

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="font-display text-4xl font-bold">Welcome to the Grove</h1>
        <p className="text-lg text-sage">Sign in to find local spots, events and jobs, or to run your business page.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <LoginCard
          title="Residents"
          text="Explore groves, gatherings and quests, and earn Seeds for shopping local."
          googleAction={signInAsResident}
          emailHref="/login/email?as=resident"
          primary
        />
        <LoginCard
          title="Business owners"
          text="Post gatherings, see your foot traffic, and get your weekly summary."
          googleAction={signInAsBusiness}
          emailHref="/login/email?as=business"
        />
      </div>
    </main>
  );
}

type CardProps = {
  title: string;
  text: string;
  googleAction: () => Promise<void>;
  emailHref: string; // sign in or create an account without Google
  primary?: boolean;
};

function LoginCard({ title, text, googleAction, emailHref, primary }: CardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-bark bg-moss p-6">
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="flex-1 text-sage">{text}</p>
      <div className="flex flex-col gap-2">
        <form action={googleAction}>
          <button
            className={
              primary
                ? "w-full rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90"
                : "w-full rounded-full border border-bark px-6 py-3 font-semibold hover:border-mint"
            }
          >
            Continue with Google
          </button>
        </form>
        <Link
          href={emailHref}
          className="w-full rounded-full border border-bark px-6 py-3 text-center font-semibold hover:border-mint"
        >
          Continue with email
        </Link>
      </div>
    </section>
  );
}
