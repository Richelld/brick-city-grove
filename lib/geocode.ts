// Turns a street address into map coordinates with Azure Maps search.
// Server-only. Returns nulls if there's no key or no match (the business just has no pin).

const DOWNTOWN_NEWARK = { lat: 40.7357, lng: -74.1724 };

export async function geocode(address: string): Promise<{ lat: number | null; lng: number | null }> {
  const key = process.env.NEXT_PUBLIC_AZURE_MAPS_KEY;
  if (!key || !address) return { lat: null, lng: null };

  const url = new URL("https://atlas.microsoft.com/search/address/json");
  url.searchParams.set("api-version", "1.0");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrySet", "US");
  url.searchParams.set("lat", String(DOWNTOWN_NEWARK.lat)); // prefer results near Newark
  url.searchParams.set("lon", String(DOWNTOWN_NEWARK.lng));
  url.searchParams.set("query", `${address}, Newark, NJ`);
  url.searchParams.set("subscription-key", key);

  try {
    const res = await fetch(url);
    const data = await res.json();
    const position = data.results?.[0]?.position;
    return position ? { lat: position.lat, lng: position.lon } : { lat: null, lng: null };
  } catch {
    return { lat: null, lng: null };
  }
}
