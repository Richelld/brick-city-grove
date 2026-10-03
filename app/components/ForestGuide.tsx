"use client"; // The chat window keeps its messages in the browser and talks to /api/guide.

import { useEffect, useRef, useState } from "react";

// Floating "Forest Guide" chat on every page. Ask it where to go in Newark.
type ChatMessage = { role: "user" | "guide"; text: string };

const STARTERS = ["I'm bored, what can I do?", "I want coffee, where should I go?", "Where can I go to explore?"];

export default function ForestGuide() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", text: question }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setMessages([...next, { role: "guide", text: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages(messages); // let them try the same question again
      setInput(question);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-mint px-5 py-3 font-semibold text-forest shadow-lg hover:opacity-90"
      >
        Ask the Forest Guide
      </button>
    );
  }

  return (
    <section
      aria-label="Forest Guide chat"
      className="fixed inset-x-4 bottom-4 z-50 flex max-h-[75vh] flex-col rounded-3xl border border-bark bg-moss shadow-xl sm:left-auto sm:w-96"
    >
      <header className="flex items-center justify-between border-b border-bark px-5 py-3">
        <div>
          <p className="font-display text-lg font-semibold">Forest Guide</p>
          <p className="text-xs text-sage">Things to do in Newark</p>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full px-3 py-1 text-sage hover:text-mist">
          ✕
        </button>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4" aria-live="polite">
        {messages.length === 0 && (
          <>
            <p className="text-sm text-sage">Bored? Hungry? Tell me what you&apos;re in the mood for and I&apos;ll point you somewhere in Newark.</p>
            <div className="flex flex-col gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-2xl border border-bark px-3 py-2 text-left text-sm hover:border-mint"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
              m.role === "user" ? "self-end bg-mint text-forest" : "self-start bg-olive"
            }`}
          >
            {m.text}
          </p>
        ))}

        {loading && <p className="self-start rounded-2xl bg-olive px-3 py-2 text-sm text-sage">Looking around the Grove…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-bark p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I want tacos in the Ironbound…"
          aria-label="Your question"
          maxLength={1000}
          className="min-w-0 flex-1 rounded-full border border-bark bg-forest px-4 py-2 text-sm outline-none focus:border-mint"
        />
        <button
          disabled={loading || !input.trim()}
          className="rounded-full bg-mint px-4 py-2 text-sm font-semibold text-forest hover:opacity-90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}
