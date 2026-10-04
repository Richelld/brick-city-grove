"use client"; // Checks for new purchases in the browser and animates the number.

import { useEffect, useRef, useState } from "react";

const CHECK_EVERY_MS = 5_000;
const COUNT_UP_MS = 1_200;

// "Dollars kept local this week". Starts with the number the server rendered, then checks
// /api/dollars every few seconds and counts up when new purchases come in (e.g. npm run demo:live).
export default function LiveCounter({ initialDollars }: { initialDollars: number }) {
  const [shown, setShown] = useState(initialDollars); // what's on screen, mid-animation
  const [gain, setGain] = useState<number | null>(null); // "+$12" badge after an increase
  const latest = useRef(initialDollars);

  useEffect(() => {
    let frame = 0;
    let badgeTimer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      if (document.hidden) return; // don't poll from background tabs
      const res = await fetch("/api/dollars").catch(() => null);
      if (!res?.ok) return;
      const { dollars } = (await res.json()) as { dollars: number };
      const from = latest.current;
      if (dollars === from) return;
      latest.current = dollars;

      if (dollars > from) {
        setGain(dollars - from);
        clearTimeout(badgeTimer);
        badgeTimer = setTimeout(() => setGain(null), 3_000);
      }

      // Count from the old number to the new one, unless the visitor prefers less motion.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setShown(dollars);
        return;
      }
      const start = performance.now();
      cancelAnimationFrame(frame);
      const step = (t: number) => {
        const progress = Math.min(1, (t - start) / COUNT_UP_MS);
        const eased = 1 - (1 - progress) ** 3; // fast at first, then settles
        setShown(Math.round(from + (dollars - from) * eased));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }

    const timer = setInterval(check, CHECK_EVERY_MS);
    return () => {
      clearInterval(timer);
      clearTimeout(badgeTimer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <p className="flex flex-wrap items-baseline gap-3">
      <span className="font-display text-5xl font-bold tabular-nums">${shown.toLocaleString("en-US")}</span>
      {gain !== null && (
        <span className="rounded-full bg-mint px-3 py-1 text-sm font-semibold text-forest">
          +${gain.toLocaleString("en-US")}
        </span>
      )}
    </p>
  );
}
