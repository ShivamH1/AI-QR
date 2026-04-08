"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import DownloadButton from "@/components/ui/DownloadButton";
import type { GalleryEntry } from "@/types";

gsap.registerPlugin(ScrollTrigger);

interface GalleryItemProps {
  entry: GalleryEntry;
}

export default function GalleryItem({ entry }: GalleryItemProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isCard = !!entry.cardDetails;

  useGSAP(
    () => {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: cardRef }
  );

  const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      ref={cardRef}
      className="glass rounded-2xl overflow-hidden group hover:glow-purple transition-all duration-300"
    >
      {/* Image Container with Dynamic Aspect Ratio */}
      <div className={`relative w-full overflow-hidden ${isCard ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.imageData}
          alt={isCard ? `AI Digital ID for ${entry.cardDetails?.name}` : `AI QR code for ${entry.url}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2">
          <DownloadButton
            imageData={entry.imageData}
            filename={isCard
              ? `digital-id-${(entry.cardDetails?.name || "card").replace(/\s+/g, "-").toLowerCase()}`
              : `ai-qr-card-${entry.theme.replace(/\s+/g, "-").toLowerCase()}`}
            className="w-full justify-center bg-gradient-to-r from-brand-purple to-brand-cyan border-none text-white text-xs py-2"
          >
            🪪 Download Card
          </DownloadButton>

          {entry.qrCodeData && (
            <DownloadButton
              imageData={entry.qrCodeData}
              filename={`ai-qr-${entry.theme.replace(/\s+/g, "-").toLowerCase()}`}
              className="w-full justify-center bg-white/10 hover:bg-white/20 text-white text-xs py-2"
            >
              🎯 Download QR Only
            </DownloadButton>
          )}

          {entry.artworkData && (
            <DownloadButton
              imageData={entry.artworkData}
              filename={`ai-art-${entry.theme.replace(/\s+/g, "-").toLowerCase()}`}
              className="w-full justify-center bg-white/10 hover:bg-white/20 text-white text-xs py-2"
            >
              🎨 Download Art Only
            </DownloadButton>
          )}
        </div>
      </div>

      {/* Info Details */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500 font-mono truncate">
            {isCard && entry.cardDetails ? entry.cardDetails.name : entry.url}
          </p>
          <span className="text-xs text-gray-600 shrink-0">{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCard ? 'bg-brand-cyan' : 'bg-brand-purple'}`} />
          <p className="text-sm text-gray-300 truncate">
            {isCard && entry.cardDetails?.title 
              ? `${entry.cardDetails.title} (${entry.theme})`
              : `${entry.theme}`}
          </p>
        </div>
      </div>
    </div>
  );
}
