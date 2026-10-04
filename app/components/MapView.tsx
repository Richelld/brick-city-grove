"use client"; // Maps need the browser (window, canvas), so this runs client-side.

import { useEffect, useRef, useState } from "react";
import "azure-maps-control/dist/atlas.min.css";
import type { Place } from "@/lib/fake-data";
import type { HeatPoint } from "@/lib/db";

// Downtown Newark, as [longitude, latitude] (Azure Maps puts longitude first).
const NEWARK: [number, number] = [-74.168, 40.738];

// Heatmap colors from quiet to busy. The legend below uses the same list.
const HEAT_COLORS = ["#7cc58f", "#e9d66b", "#f29e4c", "#e5566b"];

// Dark map for Moonlit Forest, regular map for Daytime Glade.
function mapStyle() {
  return document.documentElement.dataset.theme === "light" ? "road" : "night";
}

// 0 → "12 AM", 13 → "1 PM"
function hourLabel(hour: number) {
  return `${hour % 12 === 0 ? 12 : hour % 12} ${hour < 12 ? "AM" : "PM"}`;
}

const sum = (nums: number[]) => nums.reduce((a, b) => a + b, 0);

type Atlas = typeof import("azure-maps-control");

export default function MapView({ places, heat }: { places: Place[]; heat: HeatPoint[] }) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"pins" | "heat">("pins");
  const [hour, setHour] = useState<number | null>(null); // null = all day
  const [ready, setReady] = useState(false);

  // Things the map creates once, which the controls below update.
  const atlasRef = useRef<Atlas | null>(null);
  const pinsRef = useRef<import("azure-maps-control").HtmlMarker[]>([]);
  const heatSourceRef = useRef<import("azure-maps-control").source.DataSource | null>(null);
  const heatLayerRef = useRef<import("azure-maps-control").layer.HeatMapLayer | null>(null);

  useEffect(() => {
    let cancelled = false;
    let map: import("azure-maps-control").Map | undefined;

    // Load the map library only in the browser.
    import("azure-maps-control").then((atlas) => {
      if (cancelled || !mapDiv.current) return;
      atlasRef.current = atlas;

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
        // One pin per business that has coordinates. Clicking a pin shows its name.
        pinsRef.current = [];
        for (const place of places) {
          if (place.lat === null || place.lng === null) continue;

          const label = document.createElement("div");
          label.className = "px-3 py-2 text-sm text-stone-900";
          label.textContent = `${place.name} · ${place.address}`;

          const popup = new atlas.Popup({ content: label, pixelOffset: [0, -30] });
          const pin = new atlas.HtmlMarker({ position: [place.lng, place.lat], color: "#7cc58f", popup });

          map!.markers.add(pin);
          map!.events.add("click", pin, () => pin.togglePopup());
          pinsRef.current.push(pin);
        }

        // Heatmap of visits. Each point's "weight" (0–1) is set by the controls below.
        // The radius grows as you zoom in so blobs cover the same streets at every zoom.
        const source = new atlas.source.DataSource();
        const layer = new atlas.layer.HeatMapLayer(source, "visits-heat", {
          weight: ["get", "weight"],
          radius: ["interpolate", ["exponential", 2], ["zoom"], 10, 20, 15, 200, 18, 1200],
          intensity: 1.5,
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
        heatSourceRef.current = source;
        heatLayerRef.current = layer;

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
  }, [places]);

  // Show pins or heatmap, and redraw the heatmap for the chosen hour.
  useEffect(() => {
    const atlas = atlasRef.current;
    const source = heatSourceRef.current;
    if (!ready || !atlas || !source) return;

    for (const pin of pinsRef.current) pin.setOptions({ visible: view === "pins" });
    heatLayerRef.current?.setOptions({ visible: view === "heat" });

    // Scale against the busiest value anywhere, so a quiet hour looks quiet.
    const value = (p: HeatPoint) => (hour === null ? sum(p.byHour) : p.byHour[hour]);
    const max = hour === null ? Math.max(0, ...heat.map((p) => sum(p.byHour))) : Math.max(0, ...heat.flatMap((p) => p.byHour));

    source.setShapes(
      heat.map((p) => new atlas.data.Feature(new atlas.data.Point([p.lng, p.lat]), { weight: max > 0 ? value(p) / max : 0 }))
    );
  }, [ready, view, hour, heat]);

  const totalVisits = Math.round(sum(heat.map((p) => (hour === null ? sum(p.byHour) : p.byHour[hour]))));

  return (
    <section className="flex flex-col gap-3" aria-label="Map of local businesses in Newark">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-bark p-1" role="group" aria-label="Map view">
          {(["pins", "heat"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${view === v ? "bg-mint text-forest" : "hover:text-mint"}`}
            >
              {v === "pins" ? "Pins · Businesses" : "Heatmap · Foot traffic"}
            </button>
          ))}
        </div>

        {view === "heat" && (
          <p className="text-sm text-sage">
            {hour === null ? "All day" : `Around ${hourLabel(hour)}`}: about {totalVisits.toLocaleString("en-US")} visits a day
          </p>
        )}
      </div>

      <div ref={mapDiv} className="h-72 w-full overflow-hidden rounded-3xl border border-bark" />

      {view === "heat" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-bark bg-moss p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="heat-hour" className="text-sm font-semibold">
              Time of day
            </label>
            <input
              id="heat-hour"
              type="range"
              min={6}
              max={22}
              value={hour ?? 12}
              onChange={(e) => setHour(Number(e.target.value))}
              aria-valuetext={hour === null ? "All day" : hourLabel(hour)}
              className="min-w-40 flex-1 accent-mint"
            />
            <span className="w-14 text-sm tabular-nums">{hour === null ? "—" : hourLabel(hour)}</span>
            <button
              type="button"
              onClick={() => setHour(null)}
              aria-pressed={hour === null}
              className={`rounded-full border border-bark px-3 py-1 text-sm font-semibold ${hour === null ? "bg-mint text-forest" : "hover:border-mint"}`}
            >
              All day
            </button>
          </div>

          {/* Legend: color plus words, so it doesn't rely on color alone. */}
          <div className="flex items-center gap-3 text-sm text-sage">
            <span>Quiet</span>
            <span
              className="h-3 flex-1 rounded-full"
              style={{ background: `linear-gradient(to right, ${HEAT_COLORS.join(", ")})` }}
              aria-hidden="true"
            />
            <span>Busy</span>
          </div>
          <p className="text-xs text-sage">
            Average check-ins and purchases over the last 4 weeks, from Tiger Data (simulated activity).
          </p>
        </div>
      )}
    </section>
  );
}
