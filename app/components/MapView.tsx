"use client"; // Maps need the browser (window, canvas), so this runs client-side.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import "azure-maps-control/dist/atlas.min.css";
import type { Place } from "@/lib/fake-data";
import type { HeatPoint } from "@/lib/db";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { useTranslation } from "./LanguageProvider";

// Downtown Newark, as [longitude, latitude] (Azure Maps puts longitude first).
const NEWARK: [number, number] = [-74.168, 40.738];

// Heatmap colors from quiet to busy. The legend below uses the same list.
const HEAT_COLORS = ["#7cc58f", "#e9d66b", "#f29e4c", "#e5566b"];

// Dark map for Moonlit Forest, regular map for Daytime Glade.
function mapStyle() {
  return document.documentElement.dataset.theme === "light" ? "road" : "night";
}

// The current minute, updated every 30 seconds so the map moves with the clock.
// On the server there's no "now" yet (null), which avoids a hydration mismatch.
function useMinute() {
  return useSyncExternalStore(
    (onChange) => {
      const timer = setInterval(onChange, 30_000);
      return () => clearInterval(timer);
    },
    () => Math.floor(Date.now() / 60_000),
    () => null
  );
}

// Weekday and hour in Newark, whatever time zone the visitor's device is in.
function newarkTime(minute: number, locale: Locale) {
  const date = new Date(minute * 60_000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.find((p) => p.type === "weekday")!.value);
  const hour = Number(parts.find((p) => p.type === "hour")!.value);
  const label = date.toLocaleString(locale, { timeZone: "America/New_York", weekday: "long", hour: "numeric", minute: "2-digit" });
  return { weekHour: weekday * 24 + hour, label };
}

// How busy a place is now, compared with its own busiest hour of the week.
function busyLabel(t: Dictionary, now: number, peak: number) {
  if (now === 0 || peak === 0) return t.map.usuallyQuiet;
  const ratio = now / peak;
  if (ratio >= 0.66) return t.map.busyNow;
  if (ratio >= 0.33) return t.map.littleBusy;
  return t.map.notTooBusy;
}

// All visits to a place over the 4 weeks: each hour's weekly average, times 4 weeks.
function totalVisits(point: HeatPoint) {
  return point.byWeekHour.reduce((a, b) => a + b, 0) * 4;
}

// What a pin shows when clicked: name, address, and how busy it is.
function popupContent(place: Place, busy: string) {
  const label = document.createElement("div");
  label.className = "px-3 py-2 text-sm text-stone-900";
  label.textContent = `${place.name} · ${place.address}`;
  if (busy) {
    const line = document.createElement("div");
    line.className = "font-semibold";
    line.textContent = busy;
    label.append(line);
  }
  return label;
}

export default function MapView({ places, heat }: { places: Place[]; heat: HeatPoint[] }) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"pins" | "heat">("pins");
  const [ready, setReady] = useState(false);
  const minute = useMinute();
  const { locale, t } = useTranslation();

  // Things the map creates once, which the effect below updates.
  type Pin = { place: Place; pin: import("azure-maps-control").HtmlMarker; popup: import("azure-maps-control").Popup };
  const pinsRef = useRef(new Map<string, Pin>());
  const heatLayerRef = useRef<import("azure-maps-control").layer.HeatMapLayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: import("azure-maps-control").Map | undefined;

    // Load the map library only in the browser.
    import("azure-maps-control").then((atlas) => {
      if (cancelled || !mapDiv.current) return;

      map = new atlas.Map(mapDiv.current, {
        center: NEWARK,
        zoom: 12.5,
        style: mapStyle(),
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: process.env.NEXT_PUBLIC_AZURE_MAPS_KEY,
        },
      });

      map.events.add("ready", () => {
        // Heatmap of the places people visit most. Each point's weight (0–1) is its visits
        // compared with the most-visited place. The radius grows as you zoom in so blobs
        // cover the same streets at every zoom. Hidden until the Heatmap tab is picked.
        const mostVisits = Math.max(0, ...heat.map(totalVisits));
        const source = new atlas.source.DataSource();
        source.add(
          heat.map(
            (p) => new atlas.data.Feature(new atlas.data.Point([p.lng, p.lat]), { weight: mostVisits > 0 ? totalVisits(p) / mostVisits : 0 })
          )
        );
        const layer = new atlas.layer.HeatMapLayer(source, "visits-heat", {
          weight: ["get", "weight"],
          radius: ["interpolate", ["exponential", 2], ["zoom"], 10, 25, 15, 250, 18, 1500],
          intensity: 3,
          opacity: 0.85,
          color: [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)",
            0.15, HEAT_COLORS[0],
            0.45, HEAT_COLORS[1],
            0.7, HEAT_COLORS[2],
            1, HEAT_COLORS[3],
          ],
          visible: false,
        });
        map!.sources.add(source);
        map!.layers.add(layer, "labels"); // under street names so they stay readable
        heatLayerRef.current = layer;

        // One pin per business that has coordinates. Clicking a pin shows its name and how busy it is.
        pinsRef.current.clear();
        for (const place of places) {
          if (place.lat === null || place.lng === null) continue;

          const popup = new atlas.Popup({ content: popupContent(place, ""), pixelOffset: [0, -30] });
          const pin = new atlas.HtmlMarker({ position: [place.lng, place.lat], color: "#7cc58f", popup });
          pinsRef.current.set(place.id, { place, pin, popup });

          map!.markers.add(pin);
          map!.events.add("click", pin, () => pin.togglePopup());
        }

        // Zoom so every pin fits on screen.
        const positions = places.filter((p) => p.lat !== null && p.lng !== null).map((p) => [p.lng!, p.lat!]);
        if (positions.length > 0) {
          map!.setCamera({ bounds: atlas.data.BoundingBox.fromPositions(positions), padding: 40 });
        }
        setReady(true);
      });
    });

    // When the theme toggle is clicked, switch the map between dark and light.
    const onThemeChange = () => map?.setStyle({ style: mapStyle() });
    window.addEventListener("themechange", onThemeChange);

    // Clean up when the component goes away.
    return () => {
      cancelled = true;
      setReady(false);
      window.removeEventListener("themechange", onThemeChange);
      map?.dispose();
    };
  }, [places, heat]);

  const now = minute === null ? null : newarkTime(minute, locale);
  const weekHour = now?.weekHour ?? null;

  // Switch between pins and heatmap.
  useEffect(() => {
    if (!ready) return;
    heatLayerRef.current?.setOptions({ visible: view === "heat" });
    for (const { pin, popup } of pinsRef.current.values()) {
      pin.setOptions({ visible: view === "pins" });
      if (view === "heat") popup.close();
    }
  }, [ready, view]);

  // Update each pin's "Busy right now" line when the hour changes.
  useEffect(() => {
    if (!ready || weekHour === null) return;
    for (const [placeId, { place, popup }] of pinsRef.current) {
      const point = heat.find((p) => p.placeId === placeId);
      const busy = point ? busyLabel(t, point.byWeekHour[weekHour], Math.max(...point.byWeekHour)) : "";
      popup.setOptions({ content: popupContent(place, busy) });
    }
  }, [ready, weekHour, heat, t]);

  const nameOf = (point: HeatPoint | null) => (point ? places.find((p) => p.id === point.placeId)?.name : null);

  // The most-visited place overall, for the Heatmap tab.
  const mostVisited = heat.reduce<HeatPoint | null>((best, p) => (totalVisits(p) > (best ? totalVisits(best) : 0) ? p : best), null);

  // The busiest place right now, for the Pins tab.
  const busiest =
    weekHour === null
      ? null
      : heat.reduce<HeatPoint | null>(
          (best, p) => (p.byWeekHour[weekHour] > (best?.byWeekHour[weekHour] ?? 0) ? p : best),
          null
        );

  return (
    <section className="flex flex-col gap-3" aria-label={t.map.sectionLabel}>
      <div className="flex w-fit rounded-full border border-bark p-1" role="group" aria-label={t.map.viewLabel}>
        {(["pins", "heat"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === v ? "bg-mint text-forest" : "hover:text-mint"}`}
          >
            {v === "pins" ? t.map.pins : t.map.heat}
          </button>
        ))}
      </div>

      {view === "pins" ? (
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sage">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-mint motion-reduce:animate-none" aria-hidden="true" />
            {t.map.rightNow}{now ? ` · ${now.label}` : ""}
          </p>
          <p className="text-lg font-semibold">
            {now === null ? " " : busiest ? fill(t.map.busiestSpot, { name: nameOf(busiest) ?? "" }) : t.map.quietEverywhere}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sage">{t.map.lastFourWeeks}</p>
          <p className="text-lg font-semibold">
            {mostVisited
              ? fill(t.map.mostVisited, {
                  name: nameOf(mostVisited) ?? "",
                  count: Math.round(totalVisits(mostVisited)).toLocaleString(locale),
                })
              : t.map.noVisits}
          </p>
        </div>
      )}

      <div ref={mapDiv} className="h-72 w-full overflow-hidden rounded-3xl border border-bark" />

      {view === "pins" ? (
        <p className="text-xs text-sage">
          {t.map.pinsNote}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {/* Legend: color plus words, so it doesn't rely on color alone. */}
          <div className="flex items-center gap-3 text-sm text-sage">
            <span>{t.map.fewerVisits}</span>
            <span
              className="h-3 flex-1 rounded-full"
              style={{ background: `linear-gradient(to right, ${HEAT_COLORS.join(", ")})` }}
              aria-hidden="true"
            />
            <span>{t.map.moreVisits}</span>
          </div>
          <p className="text-xs text-sage">
            {t.map.heatNote}
          </p>
        </div>
      )}
    </section>
  );
}
