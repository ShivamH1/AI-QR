"use client";

import { useEffect, useState } from "react";
import { getGallery } from "@/lib/localStorage";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import type { GalleryEntry } from "@/types";
import Link from "next/link";

export default function GalleryPage() {
  const [entries, setEntries] = useState<GalleryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(getGallery());
    setLoaded(true);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="font-heading text-5xl font-bold mb-4">
          Your <span className="gradient-text">Gallery</span>
        </h1>
        <p className="text-gray-400 text-lg">
          All your AI-generated QR codes, saved locally on this device.
        </p>
      </div>

      {!loaded ? null : entries.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <div className="text-6xl mb-4">✦</div>
          <p className="text-gray-400 text-lg mb-6">No QR codes generated yet.</p>
          <Link
            href="/"
            className="inline-block bg-brand-purple hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Generate your first one
          </Link>
        </div>
      ) : (
        <GalleryGrid entries={entries} />
      )}
    </section>
  );
}
