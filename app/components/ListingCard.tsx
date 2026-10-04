import Image from "next/image";

// One card, reused by every tab. Hover it (or tap/Tab to it) and it lifts a little,
// and a panel slides out underneath with the full description and details.
type Props = {
  title: string;
  subtitle: string;
  detail: string;
  photo: string | null; // path in /public or /api/photos/…, or null to show the label
  photoIsLogo?: boolean; // show the whole image (no cropping), for logos
  label: string;        // shown in the square when there's no photo, e.g. "Bakery"
  isSample: boolean;
  sampleLabel: string;  // "Sample" in the visitor's language
  description?: string | null;                    // written by the business; previewed on the card
  details?: { label: string; value: string }[];   // shown in the hover panel
  badge?: string | null;                          // e.g. "Verified business"
};

export default function ListingCard({
  title, subtitle, detail, photo, photoIsLogo, label, isSample, sampleLabel, description, details = [], badge,
}: Props) {
  const hasPanel = Boolean(description) || details.length > 0 || Boolean(badge);

  return (
    <article
      tabIndex={hasPanel ? 0 : undefined}
      className="group relative flex flex-col gap-1 rounded-2xl border border-bark bg-moss p-3 outline-none transition duration-200 hover:z-20 hover:-translate-y-1 hover:shadow-xl focus:z-20 focus:-translate-y-1 focus:shadow-xl focus-visible:ring-2 focus-visible:ring-mint motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:focus:translate-y-0"
    >
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-bark to-olive">
        {photo ? (
          <Image
            src={photo}
            alt={title}
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className={photoIsLogo ? "bg-white object-contain p-4" : "object-cover"}
          />
        ) : (
          <span className="font-display text-xl font-semibold text-sage" aria-hidden="true">{label}</span>
        )}
      </div>

      <h3 className="mt-2 font-display text-lg font-semibold text-mist">{title}</h3>
      <p className="text-sm text-sage">{subtitle}</p>
      <p className="text-sm text-sage">{detail}</p>

      {/* Two-line preview. Screen readers get the full text from the panel instead. */}
      {description && (
        <p className="mt-1 line-clamp-2 text-sm text-mist" aria-hidden="true">{description}</p>
      )}

      {isSample && (
        <span className="mt-1 w-fit rounded-full bg-olive px-2 py-0.5 text-xs text-sage">{sampleLabel}</span>
      )}

      {hasPanel && (
        <div
          className="pointer-events-none absolute -inset-x-px top-[calc(100%-0.75rem)] flex translate-y-1 flex-col gap-2 rounded-b-2xl border border-t-0 border-bark bg-moss px-3 pb-3 pt-4 opacity-0 shadow-xl transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus:pointer-events-auto group-focus:translate-y-0 group-focus:opacity-100 motion-reduce:transition-none"
        >
          {badge && (
            <span className="w-fit rounded-full border border-mint px-2 py-0.5 text-xs font-semibold">{badge}</span>
          )}
          {description && <p className="text-sm text-mist">{description}</p>}
          {details.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
              {details.map((d) => (
                <div key={d.label} className="contents">
                  <dt className="font-semibold text-sage">{d.label}</dt>
                  <dd className="text-mist">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </article>
  );
}
