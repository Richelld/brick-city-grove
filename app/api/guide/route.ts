// Forest Guide chatbot: answers "where should I go in Newark?" questions with Gemini.
// The Grove's own listings are put in the prompt so the guide recommends real entries first.
// Server-only: GEMINI_API_KEY never reaches the browser.

import { auth } from "@/auth";
import { getPlaces, getEvents, getResources } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n";

// Any model name from Google AI Studio works; set GEMINI_MODEL in .env.local to pin one.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-3.5-flash"; // used when the main model is overloaded
const MAX_TURNS = 12;        // only the most recent messages are sent, to keep requests small
const MAX_MESSAGE_CHARS = 1000;

type ChatMessage = { role: "user" | "guide"; text: string };

export async function POST(request: Request) {
  const { t } = await getDictionary(); // the visitor's language, from the switcher cookie
  // Signed-in users only, so strangers can't run up the Gemini bill.
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: t.guide.errorSignIn }, { status: 401 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return Response.json({ error: t.guide.errorNotSetUp }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages)
    ? body.messages
        .filter((m: ChatMessage) => (m?.role === "user" || m?.role === "guide") && typeof m.text === "string")
        .slice(-MAX_TURNS)
        .map((m: ChatMessage) => ({ role: m.role, text: m.text.slice(0, MAX_MESSAGE_CHARS) }))
    : [];
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: t.guide.errorNoQuestion }, { status: 400 });
  }

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: await buildInstructions(t) }] },
    contents: messages.map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] })),
  });

  // Gemini sometimes answers 503 "high demand" or 429 "rate limited". Try each model twice before giving up.
  let res: Response | null = null;
  for (const model of [MODEL, FALLBACK_MODEL]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: requestBody,
      });
      if (res.ok || (res.status !== 503 && res.status !== 429)) break;
      console.warn(`Gemini ${model} busy (${res.status}), retrying`);
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (res?.ok) break;
  }

  if (!res?.ok) {
    console.error("Gemini error", res?.status, await res?.text());
    return Response.json({ error: t.guide.errorBusy }, { status: 502 });
  }

  const data = await res.json();
  const reply: string = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  return Response.json({ reply: reply || t.guide.fallbackReply });
}

// The guide's personality and rules, plus everything listed in the Grove right now.
async function buildInstructions(t: Dictionary): Promise<string> {
  const [places, events, resources] = await Promise.all([getPlaces(), getEvents(), getResources()]);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York",
  });

  const placeLines = places.map(
    (p) =>
      `- ${p.name} (${p.category}, ${p.neighborhood}${p.address ? `, ${p.address}` : ""}). Hours: ${p.hours}` +
      (p.description ? ` About (written by the owner): ${p.description}` : "")
  );
  const eventLines = events.map((e) => `- ${e.title} (${e.category}) on ${e.date} at ${e.location}`);
  const resourceLines = resources.map((r) => `- ${r.name} (${r.kind}, ${r.location}): ${r.detail}`);

  return `You are the Forest Guide for Brick City Grove, an app that helps people find things to do in Newark, New Jersey and spend their money at local businesses.
Today is ${today}.

People ask things like "I'm bored, what can I do?", "I want coffee, where should I go?" or "Where can I go to explore?".
- Stay in Newark. If someone asks about somewhere else, gently bring them back to Newark options.
- Recommend places from the Grove listings below first, and say they're in the Grove.
- You may also suggest well-known Newark spots you're confident exist (e.g. Branch Brook Park, the Newark Museum of Art, the Ironbound), but say they aren't Grove listings and that hours should be checked first. Never invent businesses, addresses, hours or prices.
- Give 2-4 suggestions with one short line each on why it fits. Keep answers short and friendly, like a local friend texting back.
- If the request is vague, suggest a mix (food, outdoors, culture, events) and ask one follow-up question about mood, budget or neighborhood.
- Use plain text with simple "-" bullet lists. No markdown headings, bold or tables.
- Reply in ${t.guide.replyLanguage}, the language the person picked on the site. If they write to you in a different language, reply in the language they wrote in. Keep business, event and place names as they are.

GROVE BUSINESSES:
${placeLines.join("\n") || "(none yet)"}

GROVE EVENTS:
${eventLines.join("\n") || "(none yet)"}

FREE COMMUNITY RESOURCES (Lantern Board):
${resourceLines.join("\n") || "(none yet)"}`;
}
