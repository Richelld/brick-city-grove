import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { getCurrentUser, isAdmin } from "@/lib/current-user";
import { signOutAction } from "../login/actions";

// Forest name + plain label for every link.
const NAV = [
  { href: "/?tab=food#browse", name: "Groves", plain: "Local Businesses" },
  { href: "/?tab=events#browse", name: "Gatherings", plain: "Events" },
  { href: "/?tab=jobs#browse", name: "Quests", plain: "Jobs" },
  { href: "/lantern", name: "Lantern Board", plain: "Resources" },
];

const PILL = "rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold hover:border-mint";

export default async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-bark">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="font-display text-2xl font-semibold">
            Brick City Grove
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin(user) && (
              <Link href="/admin" className={PILL}>
                Admin
              </Link>
            )}
            {/* Only business owners get the dashboard link */}
            {user?.role === "business" && (
              <Link href="/dashboard" className={PILL}>
                Owner dashboard
              </Link>
            )}
            <ThemeToggle />
            {user ? (
              <form action={signOutAction} className="flex items-center gap-2">
                {user.name && <span className="hidden text-sm text-sage sm:inline">{user.name}</span>}
                <button className={PILL}>Sign out</button>
              </form>
            ) : (
              <Link href="/login" className="rounded-full bg-mint px-4 py-2 text-sm font-semibold text-forest hover:opacity-90">
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav aria-label="Main" className="flex flex-wrap gap-2">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={PILL}>
              {item.name}
              <span className="font-normal text-sage"> · {item.plain}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
