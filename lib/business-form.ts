// Limits for the business sign-up form. Safe to import from server and client code.

export const MAX_DESCRIPTION_CHARS = 300;
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4 MB
export const PHOTO_TYPES = "image/jpeg,image/png,image/webp"; // for <input accept="…">
