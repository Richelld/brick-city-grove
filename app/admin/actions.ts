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
  // A business can have several people (owner, co-owner, manager). If someone is already
  // approved, the admin page shows who, so the admin can check this person works there too.
  const request = (await getBusinessRequests()).find((r) => r.userId === userId);
  if (!request) redirect("/admin");
  await approveBusiness(userId);
  revalidatePath("/admin");
}

export async function reject(userId: number) {
  await requireAdmin();
  await rejectBusiness(userId);
  revalidatePath("/admin");
}
