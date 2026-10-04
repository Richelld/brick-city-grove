import Image from "next/image";
import { redirect } from "next/navigation";
import { getBusinessRequests, type BusinessRequest } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/current-user";
import { categoryName, fill, type Dictionary } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n/server";
import { approve, reject } from "./actions";

// Admin page: review business sign-ups. Only emails in ADMIN_EMAILS can open it.
// Suggested check: call the business's public phone number and ask for the owner.
export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/");

  const { error } = await searchParams;
  const [requests, { t }] = await Promise.all([getBusinessRequests(), getDictionary()]);
  const pending = requests.filter((r) => r.status === "pending");
  const done = requests.filter((r) => r.status !== "pending");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sage">{t.admin.eyebrow}</p>
        <h1 className="font-display text-4xl font-bold">{t.admin.title}</h1>
        <p className="text-sage">{t.admin.intro}</p>
      </header>

      {error === "owned" && (
        <p role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3">
          {t.admin.ownedError}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">{fill(t.admin.waiting, { count: pending.length })}</h2>
        {pending.length === 0 && <p className="text-sage">{t.admin.nothing}</p>}
        {pending.map((r) => (
          <RequestCard key={r.userId} t={t} request={r} />
        ))}
      </section>

      {done.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold">{t.admin.reviewed}</h2>
          {done.map((r) => (
            <RequestCard key={r.userId} t={t} request={r} />
          ))}
        </section>
      )}
    </main>
  );
}

function RequestCard({ t, request: r }: { t: Dictionary; request: BusinessRequest }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-bark bg-moss p-5 sm:flex-row sm:items-center sm:justify-between">
      {/* What will appear on their public card, so it can be checked before approving.
          unoptimized: the browser loads it directly, with the admin's sign-in, since it isn't public yet. */}
      {r.placePhoto && (
        <Image
          src={r.placePhoto}
          alt={fill(t.admin.photoAlt, { name: r.placeName })}
          width={96}
          height={96}
          unoptimized
          className="h-24 w-24 shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-display text-xl font-semibold">
          {r.placeName}
          <span className="ml-2 rounded-full bg-olive px-2 py-0.5 align-middle font-sans text-xs font-normal text-sage">
            {r.isNewPlace ? t.admin.newBusiness : t.admin.claiming}
          </span>
        </p>
        <p className="text-sm text-sage">
          {categoryName(t, r.placeCategory)}
          {r.placeAddress ? ` · ${r.placeAddress}` : ""}
        </p>
        <p className="text-sm">
          {r.name ?? t.admin.unknown} ({r.ownerTitle ? (t.welcome.roles[r.ownerTitle] ?? r.ownerTitle) : "—"}) · {r.email}
        </p>
        <p className="text-sm">
          {t.admin.phone} <strong>{r.phone ?? "—"}</strong>
          {r.website ? ` · ${r.website}` : ""}
        </p>
        <p className="text-sm">
          <span className="text-sage">{t.admin.description}</span> {r.placeDescription ?? t.admin.noDescription}
        </p>
        {r.alreadyOwned && (
          <p className="text-sm font-semibold">{fill(t.admin.alreadyOwned, { emails: r.existingMembers ?? "" })}</p>
        )}
      </div>

      {r.status === "pending" ? (
        <div className="flex gap-2">
          <form action={approve.bind(null, r.userId)}>
            <button
              className="rounded-full bg-mint px-5 py-2 font-semibold text-forest hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.admin.approve}
            </button>
          </form>
          <form action={reject.bind(null, r.userId)}>
            <button className="rounded-full border border-bark px-5 py-2 font-semibold hover:border-mint">{t.admin.reject}</button>
          </form>
        </div>
      ) : (
        <span className="rounded-full border border-bark px-4 py-1 text-sm font-semibold">
          {t.admin.statuses[r.status] ?? r.status}
        </span>
      )}
    </article>
  );
}
