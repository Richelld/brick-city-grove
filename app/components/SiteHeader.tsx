import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { getCurrentUser, isAdmin } from "@/lib/current-user";
import { getDictionary } from "@/lib/i18n/server";
import { signOutAction } from "../login/actions";

const PILL = "rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold hover:border-mint";

export default async function SiteHeader() {
  const [user, { t }] = await Promise.all([getCurrentUser(), getDictionary()]);

  // Forest name + plain label for every link.
  const nav = [
    { href: "/?tab=food#browse", name: t.header.groves, plain: t.header.localBusinesses },
    { href: "/?tab=events#browse", name: t.header.gatherings, plain: t.header.events },
    { href: "/?tab=jobs#browse", name: t.header.quests, plain: t.header.jobs },
    { href: "/lantern", name: t.header.lanternBoard, plain: t.header.resources },
  ];

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
                {t.header.admin}
              </Link>
            )}
            {/* Only business owners get the dashboard link */}
            {user?.role === "business" && (
              <Link href="/dashboard" className={PILL}>
                {t.header.ownerDashboard}
              </Link>
            )}
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <form action={signOutAction} className="flex items-center gap-2">
                {user.name && <span className="hidden text-sm text-sage sm:inline">{user.name}</span>}
                <button className={PILL}>{t.header.signOut}</button>
              </form>
            ) : (
              <Link href="/login" className="rounded-full bg-mint px-4 py-2 text-sm font-semibold text-forest hover:opacity-90">
                {t.header.signIn}
              </Link>
            )}
          </div>
        </div>

        <nav aria-label="Main" className="flex flex-wrap gap-2">
          {nav.map((item) => (
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
