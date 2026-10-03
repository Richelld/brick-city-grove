"use client"; // Must also render in the browser so it can switch to the inert type there.

// A <script> that runs once while the HTML loads (before first paint).
// In the browser React renders it as text/plain, which avoids React's dev
// warning about <script> tags. Pattern from the Next.js "Preventing Flash" guide.
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
