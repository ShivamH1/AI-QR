"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function LoadingSpinner() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".spinner-ring-outer", {
        rotation: 360,
        duration: 1.8,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });
      gsap.to(".spinner-ring-inner", {
        rotation: -360,
        duration: 1.2,
        repeat: -1,
        ease: "none",
        transformOrigin: "center center",
      });
      gsap.to(".spinner-center", {
        scale: 1.2,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-6 py-12"
    >
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <svg
          className="spinner-ring-outer absolute inset-0 w-full h-full"
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="url(#grad-outer)"
            strokeWidth="3"
            strokeDasharray="60 160"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        {/* Inner ring */}
        <svg
          className="spinner-ring-inner absolute inset-0 w-full h-full"
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="24"
            fill="none"
            stroke="url(#grad-inner)"
            strokeWidth="2"
            strokeDasharray="30 120"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="grad-inner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
        {/* Center dot */}
        <div className="spinner-center absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-brand-purple to-brand-cyan" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-white font-medium mb-1">Generating your QR code</p>
        <p className="text-gray-500 text-sm">
          MistralAI is crafting your style prompt&hellip;
        </p>
      </div>
    </div>
  );
}
