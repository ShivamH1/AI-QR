"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import DownloadButton from "@/components/ui/DownloadButton";
import type { GenerateResponse } from "@/types";

interface ResultCardProps {
  result: GenerateResponse;
  originalUrl: string;
  theme: string;
}

export default function ResultCard({
  result,
  originalUrl,
  theme,
}: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isCard = !!result.cardDetails;

  useGSAP(
    () => {
      const tl = gsap.timeline();

      // Initialize states explicitly to ensure robust rendering in dev double-mounts
      gsap.set(cardRef.current, { opacity: 0, scale: 0.85, y: 40 });
      gsap.set(".result-image-wrap", { opacity: 0 });
      gsap.set(".result-meta", { opacity: 0, y: 20 });

      tl.to(cardRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: "back.out(1.4)",
      })
        .to(
          ".result-image-wrap",
          { opacity: 1, duration: 0.8, ease: "power2.out" },
          "-=0.4",
        )
        .to(
          ".result-meta",
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
          },
          "-=0.6",
        );
    },
    { scope: cardRef, dependencies: [result] },
  );

  return (
    <div
      ref={cardRef}
      className={`w-full flex flex-col items-center ${isCard ? "max-w-[320px]" : "max-w-[480px]"}`}
    >
      {/* Dynamic Aspect Ratio Image Wrapper */}
      <div
        className={`result-image-wrap relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] transition-all ${isCard ? "aspect-[9/16]" : "aspect-[16/9]"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.imageData}
          alt={
            isCard
              ? `AI Digital ID Card for ${result.cardDetails?.name}`
              : `AI-styled QR code for ${originalUrl}`
          }
          className="w-full h-full object-cover"
        />
      </div>

      {/* Meta / Details */}
      <div className="w-full mt-6 space-y-4">
        {/* Compact metadata info for Simple QR */}
        {!isCard && (
          <div className="result-meta flex items-center justify-between text-xs text-gray-400 px-1">
            <span className="truncate max-w-[140px]">🔗 {originalUrl}</span>
            <span className="truncate max-w-[100px] text-right">
              🎨 {theme}
            </span>
          </div>
        )}

        {/* AI-Enhanced Prompt */}
        <div className="result-meta bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-semibold">
            AI-Enhanced Prompt
          </p>
          <p className="text-xs text-gray-300 leading-normal italic line-clamp-3 hover:line-clamp-none transition-all cursor-help">
            &ldquo;{result.prompt}&rdquo;
          </p>
        </div>

        {/* Action Buttons */}
        <div className="result-meta flex flex-col gap-2.5">
          {/* Primary: Combined Card */}
          <DownloadButton
            imageData={result.imageData}
            filename={
              isCard
                ? `digital-id-${result.cardDetails?.name.replace(/\s+/g, "-").toLowerCase()}`
                : `ai-qr-card-${theme.replace(/\s+/g, "-").toLowerCase()}`
            }
            className="w-full justify-center bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-90 border-none text-white text-xs py-3 rounded-xl font-semibold shadow-md shadow-brand-purple/10"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Combined Card
          </DownloadButton>

          {/* Secondary Splits */}
          <div className="flex gap-2">
            {result.artworkData && (
              <DownloadButton
                imageData={result.artworkData}
                filename={`ai-art-${theme.replace(/\s+/g, "-").toLowerCase()}`}
                className="flex-1 justify-center bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs py-2.5 rounded-xl font-semibold"
              >
                🎨 Art Only
              </DownloadButton>
            )}
            {result.qrCodeData && (
              <DownloadButton
                imageData={result.qrCodeData}
                filename={`ai-qr-${theme.replace(/\s+/g, "-").toLowerCase()}`}
                className="flex-1 justify-center bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-gray-300 hover:text-white text-xs py-2.5 rounded-xl font-semibold"
              >
                🔑 QR Only
              </DownloadButton>
            )}
          </div>

          {originalUrl &&
            originalUrl !== "Contact Card" &&
            !originalUrl.endsWith("(Contact Card)") && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 border border-white/[0.08] hover:border-white/15 text-gray-300 hover:text-white font-medium py-3 rounded-xl transition-colors text-xs"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Test Link
              </a>
            )}
        </div>
      </div>
    </div>
  );
}
