// Serves a photo a business owner uploaded: /api/photos/<placeId>/<version>.
// The version number changes with each upload, so it's safe to let browsers cache it forever.
// Photos of businesses still waiting for approval are only shown to their owner and admins.

import { getPlacePhoto } from "@/lib/db";
import { getCurrentUser, isAdmin } from "@/lib/current-user";

export async function GET(_request: Request, { params }: { params: Promise<{ placeId: string; version: string }> }) {
  const { placeId } = await params;
  const photo = await getPlacePhoto(placeId);
  if (!photo) return new Response("Not found", { status: 404 });

  const isPublic = photo.placeStatus === "approved";
  if (!isPublic) {
    const user = await getCurrentUser();
    if (!isAdmin(user) && user?.placeId !== placeId) return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
