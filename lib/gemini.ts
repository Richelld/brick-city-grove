// Small helper for one-off Gemini requests (server-only; GEMINI_API_KEY never reaches the browser).
// Same models and retry rules as the Forest Guide in app/api/guide/route.ts.

const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
const FALLBACK_MODEL = "gemini-3.5-flash"; // used when the main model is overloaded

// Returns Gemini's text answer, or null if Gemini isn't set up or couldn't answer.
export async function askGemini(instructions: string, prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: instructions }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  // Gemini sometimes answers 503 "high demand" or 429 "rate limited". Try each model twice.
  for (const model of [MODEL, FALLBACK_MODEL]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body,
      });
      if (res.ok) {
        const data = await res.json();
        const text: string = (data.candidates?.[0]?.content?.parts ?? [])
          .map((p: { text?: string }) => p.text ?? "")
          .join("")
          .trim();
        return text || null;
      }
      if (res.status !== 503 && res.status !== 429) {
        console.error("Gemini error", res.status, await res.text());
        return null;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return null;
}
