import Image from "next/image";

// One card, reused by all three tabs.
type Props = {
  title: string;
  subtitle: string;
  detail: string;
  photo: string | null; // path in /public, or null to show the label
  photoIsLogo?: boolean; // show the whole image (no cropping), for logos
  label: string;        // shown in the square when there's no photo, e.g. "Bakery"
  isSample: boolean;
};

export default function ListingCard({ title, subtitle, detail, photo, photoIsLogo, label, isSample }: Props) {
  return (
    <article className="flex flex-col gap-1 rounded-2xl border border-bark bg-moss p-3">
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

      {isSample && (
        <span className="mt-1 w-fit rounded-full bg-olive px-2 py-0.5 text-xs text-sage">Sample</span>
      )}
    </article>
  );
}
