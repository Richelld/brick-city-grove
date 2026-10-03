"use client"; // Maps need the browser (window, canvas), so this runs client-side.

import { useEffect, useRef } from "react";
import "azure-maps-control/dist/atlas.min.css";
import type { Place } from "@/lib/fake-data";

// Downtown Newark, as [longitude, latitude] (Azure Maps puts longitude first).
const NEWARK: [number, number] = [-74.168, 40.738];

// Dark map for Moonlit Forest, regular map for Daytime Glade.
function mapStyle() {
  return document.documentElement.dataset.theme === "light" ? "road" : "night";
}

export default function MapView({ places }: { places: Place[] }) {
  const mapDiv = useRef<HTMLDivElement>(null);

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
        // One pin per business that has coordinates. Clicking a pin shows its name.
        for (const place of places) {
          if (place.lat === null || place.lng === null) continue;

          const label = document.createElement("div");
          label.className = "px-3 py-2 text-sm text-stone-900";
          label.textContent = `${place.name} · ${place.address}`;

          const popup = new atlas.Popup({ content: label, pixelOffset: [0, -30] });
          const pin = new atlas.HtmlMarker({ position: [place.lng, place.lat], color: "#7cc58f", popup });

          map!.markers.add(pin);
          map!.events.add("click", pin, () => pin.togglePopup());
        }

        // Zoom so every pin fits on screen.
        const positions = places.filter((p) => p.lat !== null && p.lng !== null).map((p) => [p.lng!, p.lat!]);
        if (positions.length > 0) {
          map!.setCamera({ bounds: atlas.data.BoundingBox.fromPositions(positions), padding: 40 });
        }
      });
    });

    // When the theme toggle is clicked, switch the map between dark and light.
    const onThemeChange = () => map?.setStyle({ style: mapStyle() });
    window.addEventListener("themechange", onThemeChange);

    // Clean up when the component goes away.
    return () => {
      cancelled = true;
      window.removeEventListener("themechange", onThemeChange);
      map?.dispose();
    };
  }, [places]);

  return (
    <div
      ref={mapDiv}
      className="h-72 w-full overflow-hidden rounded-3xl border border-bark"
      aria-label="Map of local businesses in Newark"
    />
  );
}
