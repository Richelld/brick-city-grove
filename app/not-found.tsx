import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";

// Shown for any URL that doesn't exist, in the visitor's language (Next.js's default 404 is English only).
export default async function NotFound() {
  const { t } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
      <p className="font-display text-6xl font-bold text-sage">404</p>
      <h1 className="font-display text-3xl font-bold">{t.notFound.title}</h1>
      <p className="text-sage">{t.notFound.text}</p>
      <Link href="/" className="rounded-full bg-mint px-6 py-3 font-semibold text-forest hover:opacity-90">
        {t.notFound.home}
      </Link>
    </main>
  );
}
