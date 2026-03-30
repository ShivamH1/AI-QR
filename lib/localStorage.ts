import type { GalleryEntry } from "@/types";

const STORAGE_KEY = "qr-gallery";

export function getGallery(): GalleryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveToGallery(entry: GalleryEntry): void {
  try {
    const existing = getGallery();
    // Keep max 4 entries to prevent local storage quota overflow (each entry contains multiple large base64 strings)
    const updated = [entry, ...existing].slice(0, 4);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("localStorage quota exceeded, truncating gallery list:", e);
    try {
      // Fallback: Try saving only the newest entry
      localStorage.setItem(STORAGE_KEY, JSON.stringify([entry]));
    } catch (err) {
      console.error("Failed to save even a single entry to gallery:", err);
    }
  }
}

export function clearGallery(): void {
  localStorage.removeItem(STORAGE_KEY);
}
