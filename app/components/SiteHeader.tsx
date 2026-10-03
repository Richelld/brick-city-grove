import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

// Forest name + plain label for every link.
const NAV = [
  { href: "/?tab=food#browse", name: "Groves", plain: "Food & Shops" },
  { href: "/?tab=events#browse", name: "Gatherings", plain: "Events" },
  { href: "/?tab=jobs#browse", name: "Quests", plain: "Jobs" },
  { href: "/lantern", name: "Lantern Board", plain: "Resources" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-bark">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold">Brick City Grove</span>
          </Link>

          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold hover:border-mint"
            >
              Owner dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <nav aria-label="Main" className="flex flex-wrap gap-x-5 gap-y-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="py-1 text-sm font-semibold hover:text-mint">
              {item.name}
              <span className="font-normal text-sage"> · {item.plain}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
