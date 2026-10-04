import { getDictionary } from "@/lib/i18n/server";

// Stand-in for the real map. Replace with Azure Maps later.
export default async function MapPlaceholder() {
  const { t } = await getDictionary();

  return (
    <div
      className="relative h-48 w-full overflow-hidden rounded-3xl border border-bark bg-moss"
      role="img"
      aria-label={t.map.placeholderLabel}
    >
      {/* A few fake "streets" so it reads as a map */}
      <div className="absolute left-0 top-1/3 h-2 w-full bg-bark" />
      <div className="absolute left-0 top-2/3 h-2 w-full bg-bark" />
      <div className="absolute left-1/4 top-0 h-full w-2 bg-bark" />
      <div className="absolute left-2/3 top-0 h-full w-2 bg-bark" />

      <p className="absolute bottom-3 left-3 rounded-md bg-olive px-2 py-1 text-sm font-medium text-mist">
        {t.map.placeholder}
      </p>
    </div>
  );
}
