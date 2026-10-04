"use client"; // Clicking changes the page theme in the browser.

import { useTranslation } from "./LanguageProvider";

// Switches between Moonlit Forest (dark) and Daytime Glade (light).
// The choice is saved in localStorage; app/layout.tsx re-applies it before the page paints.
export default function ThemeToggle() {
  const { t } = useTranslation();

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.dispatchEvent(new Event("themechange")); // lets the map switch styles too
  }

  // Both labels are rendered; CSS shows the right one, so server and browser HTML match.
  return (
    <button
      onClick={toggle}
      className="rounded-full border border-bark bg-moss px-4 py-2 text-sm font-semibold hover:border-mint"
    >
      <span className="light:hidden">{t.theme.toDay}</span>
      <span className="hidden light:inline">{t.theme.toNight}</span>
    </button>
  );
}
