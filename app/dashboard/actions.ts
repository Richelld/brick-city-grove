"use server"; // These functions run on the server when the form is submitted.

import { redirect } from "next/navigation";
import { addEvent, getPlaces } from "@/lib/db";

// "Post a gathering" form on the owner dashboard.
// No login yet (hackathon demo), so anyone on the dashboard can post.
// Add an auth check here once Google sign-in is set up.
export async function publishEvent(placeId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "Food");
  const description = String(formData.get("description") ?? "").trim();

  const place = (await getPlaces()).find((p) => p.id === placeId);
  if (!place || !title || !date) {
    redirect(`/dashboard?place=${placeId}&error=missing`);
  }

  await addEvent({ title, date, location: place.name, category, description });

  // Show the new event on the home page's Gatherings tab.
  redirect("/?tab=events#browse");
}
