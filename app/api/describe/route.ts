// "Write with Gemini" on the business sign-up form: drafts or polishes a short card description.
// Signed-in users only, so strangers can't run up the Gemini bill.

import { getCurrentUser } from "@/lib/current-user";
import { getLocale } from "@/lib/i18n/server";
import { LOCALE_NAMES } from "@/lib/i18n";
import { askGemini } from "@/lib/gemini";
import { MAX_DESCRIPTION_CHARS } from "@/lib/business-form";

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request: Request) {
  if (!(await getCurrentUser())) {
    return Response.json({ error: "signIn" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = text(body?.name, 100);
  const category = text(body?.category, 50);
  const neighborhood = text(body?.neighborhood, 80);
  const draft = text(body?.draft, 600);
  if (!name) return Response.json({ error: "needsName" }, { status: 400 });

  const language = LOCALE_NAMES[await getLocale()];
  const instructions = `You write the short description shown on a local business's card in Brick City Grove, an app for Newark, New Jersey.
Rules:
- 1 or 2 sentences, at most ${MAX_DESCRIPTION_CHARS} characters. Warm, specific, plain words.
- Write in ${language}.
- Only use facts the owner gave you (name, type, neighborhood, and their notes). Never invent menu items, prices, hours, awards, history or ownership details.
- If the owner's notes are empty, write something simple and true from the name, type and neighborhood only.
- Plain text only: no quotes around it, no hashtags, no emojis, no markdown.`;

  const prompt = `Business name: ${name}
Type of business: ${category || "not given"}
Neighborhood: ${neighborhood || "Newark"}
Owner's notes or draft: ${draft || "(none)"}

${draft ? "Polish the owner's draft, keeping their facts and voice." : "Write a first draft."}`;

  const reply = await askGemini(instructions, prompt);
  if (!reply) return Response.json({ error: "busy" }, { status: 502 });

  return Response.json({ description: reply.replace(/^["“]|["”]$/g, "").slice(0, MAX_DESCRIPTION_CHARS) });
}
