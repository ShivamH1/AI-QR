"use client";

import { useRef, useState, useEffect } from "react";

/* ── Static preview card data ── */
const PREVIEW_CARDS = [
  {
    label: "Neon Cyberpunk",
    tag: "AI QR Code",
    gradient:
      "linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(236,72,153,0.2) 50%, rgba(6,182,214,0.3) 100%)",
    borderColor: "rgba(124,58,237,0.25)",
    icon: "🌃",
    modules: [
      1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1,
    ],
    moduleColor: "#a78bfa",
    accentColor: "#a78bfa",
    description: "AI-generated artwork blended with scannable QR",
  },
  {
    label: "Enchanted Forest",
    tag: "AI QR Code",
    gradient:
      "linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(20,184,166,0.2) 50%, rgba(132,204,22,0.2) 100%)",
    borderColor: "rgba(16,185,129,0.25)",
    icon: "🍄",
    modules: [
      1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1,
    ],
    moduleColor: "#34d399",
    accentColor: "#34d399",
    description: "AI-generated artwork blended with scannable QR",
  },
  {
    label: "Professional ID",
    tag: "Digital Card",
    gradient:
      "linear-gradient(135deg, rgba(245,158,11,0.3) 0%, rgba(249,115,22,0.2) 50%, rgba(234,179,8,0.2) 100%)",
    borderColor: "rgba(245,158,11,0.25)",
    icon: "💼",
    modules: [
      1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1,
    ],
    moduleColor: "#fbbf24",
    accentColor: "#fbbf24",
    description: "Digital contact cards with embedded QR",
  },
];

export default function HeroSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  // Simple CSS-based entrance animation — no GSAP dependency for visibility
  useEffect(() => {
    // Small delay to trigger the CSS transition after mount
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden">
      {/* Background orbs */}
      <div
        className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(124,58,237,0.12)" }}
      />
      <div
        className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "rgba(6,182,214,0.08)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: "rgba(236,72,153,0.06)" }}
      />

      {/* Badge */}
      <div
        className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm text-gray-300 mb-10 shadow-lg"
        style={{
          background: "rgba(17,24,39,0.5)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 0 40px rgba(124,58,237,0.06)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        Powered by MistralAI + Stable Diffusion
      </div>

      {/* Title */}
      <h1
        className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem] font-bold tracking-tight mb-8 max-w-5xl"
        style={{
          lineHeight: 1.05,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "opacity 0.8s ease 0.15s, transform 0.8s ease 0.15s",
        }}
      >
        QR codes that are{" "}
        <span className="gradient-text">actually beautiful</span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-gray-400 text-lg sm:text-xl md:text-2xl max-w-2xl mb-16 leading-relaxed"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
        }}
      >
        Enter any URL and a visual theme. AI transforms it into a scannable work
        of art.
      </p>

      {/* ── Three Preview Cards ── */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-16 px-4">
        {PREVIEW_CARDS.map((card, idx) => (
          <div
            key={card.label}
            className="group relative rounded-3xl p-6 sm:p-7 flex flex-col items-center text-center cursor-default overflow-hidden"
            onMouseEnter={() => setHoveredCard(idx)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: card.gradient,
              border: `1px solid ${card.borderColor}`,
              backdropFilter: "blur(12px)",
              boxShadow:
                hoveredCard === idx
                  ? `0 20px 60px -15px rgba(0,0,0,0.4), 0 0 40px ${card.accentColor}15`
                  : "0 10px 40px -15px rgba(0,0,0,0.3)",
              transform: visible
                ? hoveredCard === idx
                  ? "translateY(-6px) scale(1.03)"
                  : "translateY(0) scale(1)"
                : "translateY(40px) scale(0.95)",
              opacity: visible ? 1 : 0,
              transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${0.4 + idx * 0.1}s`,
            }}
          >
            {/* Subtle inner glow */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
              }}
            />

            {/* Tag */}
            <span
              className="relative z-10 text-[10px] font-bold uppercase mb-5 px-3 py-1.5 rounded-full"
              style={{
                color: card.accentColor,
                letterSpacing: "0.2em",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {card.tag}
            </span>

            {/* QR Module Grid */}
            <div
              className="relative z-10 w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] rounded-2xl flex items-center justify-center mb-5"
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  hoveredCard === idx
                    ? `0 0 30px ${card.accentColor}20`
                    : "none",
                transition: "box-shadow 0.4s ease",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "5px",
                  padding: "12px",
                }}
              >
                {card.modules.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "3px",
                      background: m
                        ? card.moduleColor
                        : "rgba(255,255,255,0.04)",
                      opacity: m ? (hoveredCard === idx ? 1 : 0.75) : 1,
                      transition: "opacity 0.4s ease",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Icon + Label */}
            <span className="relative z-10 text-2xl mb-2">{card.icon}</span>
            <h3 className="relative z-10 font-heading font-bold text-white text-base sm:text-lg tracking-tight">
              {card.label}
            </h3>
            <p className="relative z-10 text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-[200px]">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
        {[
          { icon: "🎨", label: "AI Art Generation" },
          { icon: "📱", label: "Instant QR Scan" },
          { icon: "💼", label: "Pro ID Cards" },
          { icon: "🪄", label: "Smart Autofill" },
        ].map((f, i) => (
          <span
            key={f.label}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-300"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.5s ease ${0.7 + i * 0.06}s, transform 0.5s ease ${0.7 + i * 0.06}s`,
            }}
          >
            <span>{f.icon}</span>
            {f.label}
          </span>
        ))}
      </div>

      {/* CTA arrow */}
      <div
        className="flex flex-col items-center gap-3 text-gray-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.9)",
          transition: "opacity 0.5s ease 0.9s, transform 0.5s ease 0.9s",
        }}
      >
        <span className="text-sm tracking-wide">Start generating below</span>
        <svg
          className="w-5 h-5 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
