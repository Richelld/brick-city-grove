import { redirect } from "next/navigation";
import { getBusinessRequests, type BusinessRequest } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/current-user";
import { approve, reject } from "./actions";

// Admin page: review business sign-ups. Only emails in ADMIN_EMAILS can open it.
// Suggested check: call the business's public phone number and ask for the owner.
export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/");

  const { error } = await searchParams;
  const requests = await getBusinessRequests();
  const pending = requests.filter((r) => r.status === "pending");
  const done = requests.filter((r) => r.status !== "pending");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-sage">Admin</p>
        <h1 className="font-display text-4xl font-bold">Business approvals</h1>
        <p className="text-sage">Call the business phone number to confirm the person runs it before approving.</p>
      </header>

      {error === "owned" && (
        <p role="alert" className="rounded-xl border border-bark bg-olive px-4 py-3">
          That business already has an approved owner. Reject the duplicate request instead.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">Waiting for review ({pending.length})</h2>
        {pending.length === 0 && <p className="text-sage">Nothing to review right now.</p>}
        {pending.map((r) => (
          <RequestCard key={r.userId} request={r} />
        ))}
      </section>

      {done.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold">Already reviewed</h2>
          {done.map((r) => (
            <RequestCard key={r.userId} request={r} />
          ))}
        </section>
      )}
    </main>
  );
}

function RequestCard({ request: r }: { request: BusinessRequest }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-bark bg-moss p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-semibold">
          {r.placeName}
          <span className="ml-2 rounded-full bg-olive px-2 py-0.5 align-middle font-sans text-xs font-normal text-sage">
            {r.isNewPlace ? "New business" : "Claiming listing"}
          </span>
        </p>
        <p className="text-sm text-sage">
          {r.placeCategory}
          {r.placeAddress ? ` · ${r.placeAddress}` : ""}
        </p>
        <p className="text-sm">
          {r.name ?? "Unknown"} ({r.ownerTitle ?? "—"}) · {r.email}
        </p>
        <p className="text-sm">
          Phone: <strong>{r.phone ?? "—"}</strong>
          {r.website ? ` · ${r.website}` : ""}
        </p>
        {r.alreadyOwned && (
          <p className="text-sm font-semibold">This business already has an approved owner.</p>
        )}
      </div>

      {r.status === "pending" ? (
        <div className="flex gap-2">
          <form action={approve.bind(null, r.userId)}>
            <button
              disabled={r.alreadyOwned}
              className="rounded-full bg-mint px-5 py-2 font-semibold text-forest hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Approve
            </button>
          </form>
          <form action={reject.bind(null, r.userId)}>
            <button className="rounded-full border border-bark px-5 py-2 font-semibold hover:border-mint">Reject</button>
          </form>
        </div>
      ) : (
        <span className="rounded-full border border-bark px-4 py-1 text-sm font-semibold capitalize">{r.status}</span>
      )}
    </article>
  );
}
