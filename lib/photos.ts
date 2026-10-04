// Checks photos that business owners upload. Server-only.
// We look at the file's first bytes instead of trusting its name or the browser's label.

import { MAX_PHOTO_BYTES } from "./business-form";

export function detectImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (starts(0x89, 0x50, 0x4e, 0x47)) return "image/png";
  // WebP: "RIFF" .... "WEBP"
  if (starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  return null;
}

// Reads an uploaded photo from a form. Returns null if none was chosen,
// or "invalid" if it's too big or not a JPG/PNG/WebP.
export async function readPhoto(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > MAX_PHOTO_BYTES) return "invalid" as const;
  const data = Buffer.from(await file.arrayBuffer());
  const contentType = detectImageType(data);
  return contentType ? { contentType, data } : ("invalid" as const);
}
