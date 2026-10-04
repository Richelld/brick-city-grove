import { Fragment } from "react";

// Shows a translated string that marks bold words with <strong>…</strong>,
// e.g. "You're joining as a <strong>resident</strong>." Only <strong> is supported; nothing is parsed as HTML.
export default function Rich({ text }: { text: string }) {
  return text.split(/<strong>(.*?)<\/strong>/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
  );
}
