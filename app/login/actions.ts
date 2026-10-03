"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import {
  becomeResident,
  createPendingPlace,
  getClaimablePlaces,
  requestBusinessClaim,
  type ClaimDetails,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";
import { BUSINESS_CATEGORIES } from "@/lib/categories";
import { geocode } from "@/lib/geocode";

// Login page buttons: send the person to Google, then to /welcome to finish setup.
export async function signInAsResident() {
  await signIn("google", { redirectTo: "/welcome?as=resident" });
}

export async function signInAsBusiness() {
  await signIn("google", { redirectTo: "/welcome?as=business" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// Welcome page: residents are set up right away.
export async function chooseResident() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  await becomeResident(user.email);
  redirect("/");
}

// Business owners give contact details so an admin can check they're real.
function readClaimDetails(formData: FormData): ClaimDetails | null {
  const ownerTitle = String(formData.get("ownerTitle") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  if (!ownerTitle || phone.replace(/\D/g, "").length < 10) return null; // need a real phone number
  return { ownerTitle, phone, website };
}

// "My business is already listed": claim it. Stays pending until an admin approves.
export async function claimBusiness(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role) redirect("/dashboard");

  const details = readClaimDetails(formData);
  const placeId = String(formData.get("place") ?? "");
  const claimable = await getClaimablePlaces();
  if (!details || !claimable.some((p) => p.id === placeId)) redirect("/welcome?as=business&error=claim");

  await requestBusinessClaim(user.email, placeId, details);
  redirect("/dashboard"); // shows "waiting for approval"
}

// "My business isn't listed": add it. Hidden from the public until an admin approves.
export async function addNewBusiness(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role) redirect("/dashboard");

  const details = readClaimDetails(formData);
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const neighborhood = String(formData.get("neighborhood") ?? "").trim() || "Newark";
  if (!details || !name || !address || !BUSINESS_CATEGORIES.includes(category)) {
    redirect("/welcome?as=business&error=new");
  }

  const { lat, lng } = await geocode(address); // for the map pin
  const placeId = await createPendingPlace({ name, category, neighborhood, address, lat, lng });
  await requestBusinessClaim(user.email, placeId, details);
  redirect("/dashboard");
}
