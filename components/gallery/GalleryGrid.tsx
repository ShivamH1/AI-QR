import GalleryItem from "./GalleryItem";
import type { GalleryEntry } from "@/types";

interface GalleryGridProps {
  entries: GalleryEntry[];
}

export default function GalleryGrid({ entries }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((entry) => (
        <GalleryItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
