"use server"; // These functions run on the server when the form is submitted.

import { redirect } from "next/navigation";
import { addEvent, getPlaces } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

// "Post a gathering" form on the owner dashboard.
// Checked on the server: only an approved business can post, and only as their own business.
export async function publishEvent(formData: FormData) {
  const user = await getCurrentUser();
  if (user?.role !== "business" || !user.placeId || user.businessStatus !== "approved") redirect("/login");
  const placeId = user.placeId;

  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "Food");
  const description = String(formData.get("description") ?? "").trim();

  const place = (await getPlaces()).find((p) => p.id === placeId);
  if (!place || !title || !date) {
    redirect("/dashboard?error=missing");
  }

  await addEvent({ title, date, location: place.name, category, description });

  // Show the new event on the home page's Gatherings tab.
  redirect("/?tab=events#browse");
}
