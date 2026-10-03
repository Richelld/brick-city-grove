"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { approveBusiness, rejectBusiness, getBusinessRequests } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/current-user";

// Every action re-checks that the person clicking is an admin.
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) redirect("/");
}

export async function approve(userId: number) {
  await requireAdmin();
  // Never approve a second owner for a business that already has one.
  const request = (await getBusinessRequests()).find((r) => r.userId === userId);
  if (!request || request.alreadyOwned) redirect("/admin?error=owned");
  await approveBusiness(userId);
  revalidatePath("/admin");
}

export async function reject(userId: number) {
  await requireAdmin();
  await rejectBusiness(userId);
  revalidatePath("/admin");
}
