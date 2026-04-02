"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ResultCard from "./ResultCard";
import { saveToGallery } from "@/lib/localStorage";
import type { GenerateResponse } from "@/types";
import LoadingSpinner from "../ui/LoadingSpinner";

const STYLE_PRESETS = [
  {
    name: "Neon Cyberpunk",
    prompt:
      "neon cyberpunk city at night, futuristic, glowing lines, synthwave, 8k resolution",
    icon: "🌃",
  },
  {
    name: "Enchanted Forest",
    prompt:
      "enchanted forest with glowing mushrooms, mystical atmosphere, soft bioluminescent lighting, 8k",
    icon: "🍄",
  },
  {
    name: "Watercolor Minimalist",
    prompt:
      "watercolor painting, soft pastel colors, clean white background, abstract shapes, minimalist art, highly detailed",
    icon: "🎨",
  },
  {
    name: "Holographic 3D",
    prompt:
      "holographic 3D render, abstract glassy shapes, iridescent gradients, dark tech background, octane render",
    icon: "💎",
  },
  {
    name: "Claymation",
    prompt:
      "cute 3D claymation character, clay style, vibrant colors, clean lighting, soft shadows, octane render",
    icon: "🧸",
  },
];

export default function GeneratorForm() {
  const [mode, setMode] = useState<"simple" | "card">("simple");
  const [url, setUrl] = useState("");
  const [theme, setTheme] = useState(STYLE_PRESETS[0].prompt);
  const [loading, setLoading] = useState(false);
  const [autofillLoading, setAutofillLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Card details state
  const [cardTheme, setCardTheme] = useState<"light" | "dark">("light");
  const [qrType, setQrType] = useState<"url" | "vcard">("url");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");

  // AI Autofill input bio
  const [rawBio, setRawBio] = useState("");

  // Presets State
  const [selectedPreset, setSelectedPreset] = useState(STYLE_PRESETS[0].name);

  // Sync preset selection with visual theme prompt input
  const handlePresetChange = (presetName: string) => {
    const preset = STYLE_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setSelectedPreset(presetName);
      setTheme(preset.prompt);
    }
  };

  useGSAP(
    () => {
      gsap.from(".form-field", {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.1,
      });
      gsap.from(".preview-panel", {
        opacity: 0,
        scale: 0.98,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.2,
      });
    },
    { scope: formRef },
  );

  const handleAutofill = async () => {
    if (!rawBio.trim()) return;
    setAutofillLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawBio }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Autofill failed");
      }

      // Populate state values
      if (data.name) setName(data.name);
      if (data.title) setTitle(data.title);
      if (data.company) setCompany(data.company);
      if (data.location) setLocation(data.location);
      if (data.email) setEmail(data.email);
      if (data.url) {
        setUrl(data.url);
        setQrType("url");
      } else {
        setQrType("vcard");
      }
      if (data.theme) {
        setTheme(data.theme);
        setSelectedPreset("custom");
      }

      // Auto-switch to card mode upon autofill trigger
      setMode("card");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "AI Autofill extraction failed.",
      );
    } finally {
      setAutofillLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        url: mode === "simple" || qrType === "url" || url ? url : undefined,
        theme,
        mode,
        cardTheme: mode === "card" ? cardTheme : undefined,
        qrType: mode === "card" ? qrType : undefined,
        name: mode === "card" ? name : undefined,
        title: mode === "card" ? title : undefined,
        company: mode === "card" ? company : undefined,
        location: mode === "card" ? location : undefined,
        email: mode === "card" ? email : undefined,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          typeof data.error === "string"
            ? data.error
            : Object.values(data.error as Record<string, string[]>)
                .flat()
                .join(", ");
        throw new Error(msg);
      }

      const response = data as GenerateResponse;
      setResult(response);

      saveToGallery({
        id: crypto.randomUUID(),
        url:
          mode === "simple" || qrType === "url"
            ? url
            : `${name} (Contact Card)`,
        theme,
        imageData: response.imageData,
        prompt: response.prompt,
        qrCodeData: response.qrCodeData,
        artworkData: response.artworkData,
        cardDetails: response.cardDetails,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ───── Shared input className ───── */
  const inputCls =
    "input-glow w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-3.5 text-white placeholder-gray-600 text-[15px] focus:border-brand-purple/60 transition-all hover:border-white/15";

  return (
    <div ref={formRef} className="max-w-7xl mx-auto">
      {/* ── Section Header ── */}
      <div className="mb-16 text-center">
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight leading-tight">
          AI-Powered <span className="gradient-text">QR Card Studio</span>
        </h2>
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Generate premium, styled AI QR codes and professional digital contact
          cards in seconds.
        </p>
      </div>

      {/* ── Two-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
        {/* ─── Left Column: Form & Inputs (8 cols) ─── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          {/* AI Autofill Panel */}
          <div className="form-field glass rounded-3xl p-7 sm:p-8 glow-purple">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-purple/20 to-brand-cyan/20 flex items-center justify-center text-xl">
                🪄
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  Quick AI Bio Autofill
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Powered by Mistral AI
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed max-w-xl">
              Paste your email signature, LinkedIn summary, or a short
              introduction. Our AI will automatically parse and fill out the
              profile details below.
            </p>
            <div className="space-y-4">
              <textarea
                value={rawBio}
                onChange={(e) => setRawBio(e.target.value)}
                placeholder="e.g. Hi, I'm Alexander Sterling. I'm the Managing Director of Global Leadership in London. Contact me at sterling@executive.com..."
                rows={4}
                className={`${inputCls} resize-none`}
              />
              <button
                type="button"
                onClick={handleAutofill}
                disabled={autofillLoading || !rawBio.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-purple/15 flex items-center justify-center gap-2"
              >
                {autofillLoading ? (
                  <>
                    <LoadingSpinner />
                    AI is extracting details...
                  </>
                ) : (
                  "✦ Autofill Profile Details"
                )}
              </button>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="form-field glass rounded-3xl p-7 sm:p-8">
            {/* Mode Switcher */}
            <div className="flex bg-white/[0.04] p-1.5 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setMode("simple")}
                className={`flex-1 text-center py-3.5 rounded-xl text-sm font-medium transition-all ${
                  mode === "simple"
                    ? "bg-white/10 text-white shadow-sm font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                ✦ Simple QR Code
              </button>
              <button
                type="button"
                onClick={() => setMode("card")}
                className={`flex-1 text-center py-3.5 rounded-xl text-sm font-medium transition-all ${
                  mode === "card"
                    ? "bg-white/10 text-white shadow-sm font-semibold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                💼 Professional ID Card
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Card Mode Sub-options */}
              {mode === "card" && (
                <div className="space-y-7">
                  {/* Card Design Theme */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-200 tracking-wide">
                      Card Design Theme
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCardTheme("light")}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl border text-sm font-medium transition-all ${
                          cardTheme === "light"
                            ? "bg-white text-gray-900 border-white font-semibold shadow-lg shadow-white/10"
                            : "bg-white/[0.03] text-gray-300 border-white/[0.08] hover:border-white/20"
                        }`}
                      >
                        ☀️ Light Theme
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardTheme("dark")}
                        className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl border text-sm font-medium transition-all ${
                          cardTheme === "dark"
                            ? "bg-gray-950 text-white border-brand-purple/50 font-semibold shadow-lg shadow-brand-purple/10"
                            : "bg-white/[0.03] text-gray-300 border-white/[0.08] hover:border-white/20"
                        }`}
                      >
                        🌙 Dark Theme
                      </button>
                    </div>
                  </div>

                  {/* QR Payload Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-200 tracking-wide">
                      QR Code Encoded Data
                    </label>
                    <div className="flex bg-white/[0.04] p-1.5 rounded-xl text-sm">
                      <button
                        type="button"
                        onClick={() => setQrType("url")}
                        className={`flex-1 text-center py-3 rounded-lg font-medium transition-all ${
                          qrType === "url"
                            ? "bg-brand-purple/20 text-brand-cyan font-bold"
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        🔗 Website Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrType("vcard")}
                        className={`flex-1 text-center py-3 rounded-lg font-medium transition-all ${
                          qrType === "vcard"
                            ? "bg-brand-purple/20 text-brand-cyan font-bold"
                            : "text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        🪪 vCard Contact
                      </button>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-5 pt-5 border-t border-white/[0.06]">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em]">
                      Profile Information
                    </h4>

                    {/* Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Full Name <span className="text-brand-pink">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alexander Sterling"
                        required={mode === "card"}
                        className={inputCls}
                      />
                    </div>

                    {/* Title & Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Managing Director"
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Department / Company
                        </label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. Global Leadership"
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Location & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Location
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Mayfair, London"
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. sterling@executive.com"
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* URL Input */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-200 tracking-wide">
                  {mode === "simple"
                    ? "URL to encode"
                    : qrType === "url"
                      ? "Website URL"
                      : "Website URL (optional)"}
                  {(mode === "simple" ||
                    (mode === "card" && qrType === "url")) && (
                    <span className="text-brand-pink ml-1">*</span>
                  )}
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  required={
                    mode === "simple" || (mode === "card" && qrType === "url")
                  }
                  className={inputCls}
                />
              </div>

              {/* AI Style Preset */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-200 tracking-wide">
                  AI Artwork Style Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full bg-gray-900/80 border border-white/[0.08] rounded-xl px-5 py-3.5 text-white text-[15px] focus:outline-none focus:border-brand-purple/60 focus:ring-1 focus:ring-brand-purple/50 transition-all cursor-pointer appearance-none"
                >
                  {STYLE_PRESETS.map((preset) => (
                    <option key={preset.name} value={preset.name}>
                      {preset.icon} {preset.name}
                    </option>
                  ))}
                  <option value="custom">✍️ Custom Theme Prompt...</option>
                </select>
              </div>

              {/* Theme Prompt */}
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-gray-200 tracking-wide">
                  AI Prompt Theme Details
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => {
                    setTheme(e.target.value);
                    setSelectedPreset("custom");
                  }}
                  placeholder="e.g. neon cyberpunk city at night"
                  required
                  minLength={3}
                  maxLength={300}
                  className={inputCls}
                />
              </div>

              {/* Error display */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    (mode === "simple" && !url) ||
                    (mode === "card" && qrType === "url" && !url) ||
                    (mode === "card" && !name) ||
                    !theme
                  }
                  className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-base transition-all tracking-wide shadow-xl shadow-brand-purple/20 flex items-center justify-center gap-2.5"
                >
                  {loading ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : mode === "card" ? (
                    "✦ Generate Digital ID Card"
                  ) : (
                    "✦ Generate Styled QR Code"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ─── Right Column: Smart Live Preview ─── */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 preview-panel">
          <div className="glass rounded-3xl p-7 sm:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-white/[0.06] pb-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg">
                  {loading ? "⚡" : result && !loading ? "✅" : "👀"}
                </div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {loading
                    ? "Generating..."
                    : result && !loading
                      ? "Result"
                      : "Live Preview"}
                </h3>
              </div>
              {result && !loading && (
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]"
                >
                  ← Back to preview
                </button>
              )}
            </div>

            {/* ── State 1: Loading — Generation in progress ── */}
            {loading && (
              <div className="w-full max-w-[300px] flex flex-col items-center text-center py-12">
                {/* Animated gradient ring */}
                <div className="relative w-24 h-24 mb-8">
                  <svg
                    className="w-full h-full animate-spin"
                    style={{ animationDuration: "2s" }}
                    viewBox="0 0 96 96"
                    fill="none"
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="3"
                    />
                    <path
                      d="M48 6 A42 42 0 0 1 90 48"
                      stroke="url(#spinGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="spinGrad"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                </div>

                {/* Progress steps */}
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-brand-purple/20 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-brand-purple animate-pulse"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-300">
                      Enhancing prompt with MistralAI
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-brand-cyan animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-300">Generating AI artwork</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gray-600" />
                    </div>
                    <span className="text-gray-500">Compositing QR blend</span>
                  </div>
                </div>

                <p className="text-gray-600 text-xs mt-8">
                  This usually takes 5–15 seconds
                </p>
              </div>
            )}

            {/* ── State 2: Result — Show generated output ── */}
            {result && !loading && (
              <div className="w-full flex flex-col items-center">
                <ResultCard
                  result={result}
                  originalUrl={
                    mode === "simple" || qrType === "url" ? url : "Contact Card"
                  }
                  theme={theme}
                />
              </div>
            )}

            {/* ── State 3: Idle — Static preview mockup ── */}
            {!loading && !result && (
              <>
                {mode === "card" ? (
                  /* High-Fidelity 9:16 Mockup Card */
                  <div
                    className={`w-full max-w-[320px] aspect-[9/16] rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                      cardTheme === "light"
                        ? "bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200 text-slate-900 preview-card-shadow-light"
                        : "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-white preview-card-shadow"
                    }`}
                  >
                    {cardTheme === "dark" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5 pointer-events-none" />
                    )}

                    <div className="flex flex-col items-center pt-3 relative z-10">
                      <div
                        className={`w-[160px] h-[160px] rounded-2xl border flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                          cardTheme === "light"
                            ? "bg-white border-slate-200"
                            : "bg-slate-900/60 border-slate-700/60"
                        }`}
                      >
                        <div className="w-[130px] h-[130px] opacity-15 relative flex flex-wrap gap-0.5 p-1">
                          {Array.from({ length: 49 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-4 h-4 rounded-[2px] ${
                                i % 3 === 0 ||
                                i % 7 === 0 ||
                                i < 6 ||
                                (i > 42 && i % 2 === 0)
                                  ? cardTheme === "light"
                                    ? "bg-slate-900"
                                    : "bg-white"
                                  : "opacity-0"
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`absolute text-xs font-mono uppercase tracking-widest font-semibold px-2 py-1 rounded-lg border transition-all ${
                            cardTheme === "light"
                              ? "bg-slate-50 border-slate-300 text-slate-600"
                              : "bg-slate-950 border-slate-800 text-brand-cyan"
                          }`}
                        >
                          QR Space
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold tracking-[0.2em] mt-3.5 uppercase font-sans ${
                          cardTheme === "light"
                            ? "text-amber-800"
                            : "text-amber-500"
                        }`}
                      >
                        AUTHENTIC DIGITAL ID
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-end pt-6 relative z-10">
                      <span
                        className={`text-[9px] font-bold tracking-widest uppercase mb-1.5 ${
                          cardTheme === "light"
                            ? "text-orange-700"
                            : "text-amber-400"
                        }`}
                      >
                        {company || "GLOBAL LEADERSHIP"}
                      </span>
                      <h3
                        className={`text-xl font-bold font-serif tracking-tight leading-none mb-1.5 truncate ${
                          cardTheme === "light"
                            ? "text-slate-900"
                            : "text-white"
                        }`}
                      >
                        {name || "Alexander Sterling"}
                      </h3>
                      <p
                        className={`text-xs italic leading-tight truncate mb-3.5 ${
                          cardTheme === "light"
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        {title || "Managing Director"}
                      </p>
                      <div
                        className={`w-12 h-[1.5px] mb-3.5 ${
                          cardTheme === "light"
                            ? "bg-slate-300"
                            : "bg-slate-800"
                        }`}
                      />
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cardTheme === "light" ? "text-orange-700" : "text-amber-400"}>📍</span>
                          <span className={`truncate ${cardTheme === "light" ? "text-slate-600" : "text-slate-300"}`}>
                            {location || "Mayfair, London"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cardTheme === "light" ? "text-orange-700" : "text-amber-400"}>✉️</span>
                          <span className={`truncate ${cardTheme === "light" ? "text-slate-600" : "text-slate-300"}`}>
                            {email || "sterling@executive.com"}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-full py-3.5 rounded-full flex items-center justify-center gap-2 font-bold text-xs tracking-wider transition-colors ${
                          cardTheme === "light"
                            ? "bg-slate-900 text-white"
                            : "bg-[#042f2e] text-amber-400 border border-[#115e59]"
                        }`}
                      >
                        <span>🪪</span> SAVE CONTACT
                      </div>
                      <p
                        className={`text-[8px] text-center mt-3 tracking-wide ${
                          cardTheme === "light"
                            ? "text-slate-400"
                            : "text-slate-600"
                        }`}
                      >
                        Scan to securely import credentials.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* High-Fidelity Simple Landscape Mockup Card */
                  <div
                    className={`w-full max-w-[420px] aspect-[16/9] rounded-3xl p-5 border flex gap-4 transition-all duration-300 relative overflow-hidden ${
                      cardTheme === "light"
                        ? "bg-gradient-to-b from-slate-50 to-slate-100 border-slate-200 text-slate-900 preview-card-shadow-light"
                        : "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 text-white preview-card-shadow"
                    }`}
                  >
                    {cardTheme === "dark" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5 pointer-events-none" />
                    )}

                    {/* Left Column: Pure Artwork Frame */}
                    <div
                      className={`w-[45%] h-full rounded-2xl border flex flex-col items-center justify-center text-center p-3 relative overflow-hidden transition-all duration-300 ${
                        cardTheme === "light"
                          ? "bg-white border-slate-200/60"
                          : "bg-slate-900/60 border-slate-700/60"
                      }`}
                    >
                      <span className="text-3xl mb-2">🎨</span>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">
                        Pure AI Art
                      </span>
                      <span className={`text-[8px] mt-1 ${cardTheme === "light" ? "text-slate-400" : "text-slate-500"}`}>
                        Unobstructed
                      </span>
                    </div>

                    {/* Center Divider Line */}
                    <div
                      className={`w-[1px] h-full ${
                        cardTheme === "light" ? "bg-slate-200" : "bg-slate-800"
                      }`}
                    />

                    {/* Right Column: QR Space */}
                    <div className="flex-1 flex flex-col items-center justify-center h-full relative z-10">
                      <div
                        className={`w-[130px] h-[130px] rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                          cardTheme === "light"
                            ? "bg-white border-slate-200"
                            : "bg-slate-950 border-slate-800"
                        }`}
                      >
                        <div className="w-full h-full opacity-15 relative flex flex-wrap gap-0.5">
                          {Array.from({ length: 49 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-[1px] ${
                                i % 3 === 0 || i % 7 === 0 || i < 6 || (i > 42 && i % 2 === 0)
                                  ? cardTheme === "light"
                                    ? "bg-slate-900"
                                    : "bg-white"
                                  : "opacity-0"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold tracking-[0.2em] mt-3.5 uppercase font-sans ${
                          cardTheme === "light"
                            ? "text-amber-800"
                            : "text-amber-500"
                        }`}
                      >
                        SCAN STYLED AI QR
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
