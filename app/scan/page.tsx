"use client";

import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

interface ParsedContact {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  email?: string;
  url?: string;
}

export default function ScanPage() {
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [scanMode, setScanMode] = useState<"camera" | "upload">("upload");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [parsedContact, setParsedContact] = useState<ParsedContact | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Load jsQR library from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).jsQR) {
      setLibraryLoaded(true);
    }
  }, []);

  // Parse vCard strings
  const parseVCard = (vcardText: string): ParsedContact | null => {
    if (!vcardText.startsWith("BEGIN:VCARD")) return null;

    const contact: ParsedContact = { name: "Contact" };
    const lines = vcardText.split(/\r?\n/);

    for (const line of lines) {
      if (line.startsWith("FN:")) {
        contact.name = line.substring(3).trim();
      } else if (line.startsWith("TITLE:")) {
        contact.title = line.substring(6).trim();
      } else if (line.startsWith("ORG:")) {
        contact.company = line.substring(4).trim();
      } else if (line.startsWith("EMAIL:")) {
        // Strip out type parameters if present e.g. EMAIL;TYPE=PREF,INTERNET:info@mail.com
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          contact.email = line.substring(colonIndex + 1).trim();
        }
      } else if (line.startsWith("ADR:")) {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          const parts = line.substring(colonIndex + 1).split(";");
          // Extract address components (usually part index 2 is street/city)
          contact.location = parts.filter(Boolean).join(", ").trim();
        }
      } else if (line.startsWith("URL:")) {
        const colonIndex = line.indexOf(":");
        if (colonIndex !== -1) {
          contact.url = line.substring(colonIndex + 1).trim();
        }
      }
    }

    return contact;
  };

  // Handle successful QR decoding
  const handleDecode = (text: string) => {
    setScanResult(text);
    const parsed = parseVCard(text);
    if (parsed) {
      setParsedContact(parsed);
    } else {
      setParsedContact(null);
    }
    stopCamera();
  };

  // Camera Scanning Loop
  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = (window as any).jsQR;

      if (jsQR) {
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          // Draw green border around QR code
          ctx.beginPath();
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#06b6d4";
          ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
          ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
          ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
          ctx.closePath();
          ctx.stroke();

          handleDecode(code.data);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(scanFrame);
  };

  // Start Webcam Camera
  const startCamera = async () => {
    setScanResult(null);
    setParsedContact(null);
    setError(null);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to access camera. Please allow camera permissions or upload an image instead.");
      setIsScanning(false);
    }
  };

  // Stop Webcam Camera
  const stopCamera = () => {
    setIsScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  // Track scanning state
  useEffect(() => {
    if (isScanning) {
      animationFrameId.current = requestAnimationFrame(scanFrame);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isScanning]);

  // Handle uploaded image files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanResult(null);
    setParsedContact(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const jsQR = (window as any).jsQR;

          if (jsQR) {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              handleDecode(code.data);
            } else {
              setError("No QR code found in the image. Make sure the QR code is clearly visible.");
            }
          } else {
            setError("Decoder library not loaded yet. Please wait.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getVCardDownloadUrl = (contact: ParsedContact): string => {
    const params = new URLSearchParams();
    params.set("name", contact.name);
    if (contact.title) params.set("title", contact.title);
    if (contact.company) params.set("company", contact.company);
    if (contact.email) params.set("email", contact.email);
    if (contact.location) params.set("location", contact.location);
    if (contact.url) params.set("url", contact.url);
    return `/api/vcard?${params.toString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Dynamic jsQR Loader */}
      <Script
        src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"
        onLoad={() => setLibraryLoaded(true)}
      />

      <div className="text-center mb-10">
        <h1 className="font-heading text-4xl font-extrabold mb-3">
          QR Code &amp; <span className="gradient-text">Card Scanner</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Scan a printed QR code, digital card, or upload an image to verify links and instantly import contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Scan Controls & Viewfinder (cols: 7) */}
        <div className="md:col-span-7 glass rounded-2xl p-6 space-y-6">
          {/* Mode Selector */}
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => {
                setScanMode("upload");
                stopCamera();
              }}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-medium transition-colors ${
                scanMode === "upload" ? "bg-white/10 text-white font-semibold" : "text-gray-400"
              }`}
            >
              📁 Upload Image
            </button>
            <button
              onClick={() => {
                setScanMode("camera");
                startCamera();
              }}
              className={`flex-1 text-center py-2 rounded-lg text-xs font-medium transition-colors ${
                scanMode === "camera" ? "bg-white/10 text-white font-semibold" : "text-gray-400"
              }`}
            >
              📷 Live Camera
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl p-3 text-xs">
              {error}
            </div>
          )}

          {/* Upload Viewport */}
          {scanMode === "upload" && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 hover:border-brand-purple/50 rounded-2xl p-10 text-center cursor-pointer transition-colors bg-white/5"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <span className="text-4xl mb-3 block">📥</span>
              <p className="text-sm font-semibold text-white mb-1">Click to Upload QR Image</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Supports screenshots, generated card downloads, PNG, JPG, or WebP formats.
              </p>
            </div>
          )}

          {/* Camera Viewport */}
          {scanMode === "camera" && (
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              {!isScanning && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
                  <button
                    onClick={startCamera}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold rounded-xl"
                  >
                    Start Scanning Camera
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Decoding Result Display (cols: 5) */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-heading font-bold text-lg text-white mb-4 flex items-center gap-2">
              <span>📋</span> Scan Results
            </h3>

            {!scanResult ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                <span className="text-2xl mb-2 block">🔍</span>
                Waiting for QR Code scan...
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* Standard text URL */}
                {!parsedContact ? (
                  <div className="space-y-3">
                    <span className="text-xs text-brand-cyan font-bold tracking-widest uppercase">Decoded Link</span>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-300 break-all font-mono">
                      {scanResult}
                    </div>
                    {scanResult.startsWith("http") && (
                      <a
                        href={scanResult}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                      >
                        🌐 Visit Decoded Link
                      </a>
                    )}
                  </div>
                ) : (
                  /* vCard contact detail widget */
                  <div className="space-y-4">
                    <span className="text-xs text-brand-cyan font-bold tracking-widest uppercase block">Parsed Contact</span>
                    
                    {/* Simulated card preview */}
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4.5 text-white shadow-lg space-y-3">
                      <div className="border-b border-slate-800 pb-2">
                        {parsedContact.company && (
                          <span className="text-[9px] font-bold text-amber-400 tracking-wider uppercase block mb-0.5">
                            {parsedContact.company}
                          </span>
                        )}
                        <h4 className="text-lg font-bold font-serif leading-none mb-1 text-white">
                          {parsedContact.name}
                        </h4>
                        {parsedContact.title && (
                          <p className="text-xs text-slate-400 italic">{parsedContact.title}</p>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        {parsedContact.location && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-amber-400 text-sm leading-none">📍</span>
                            <span className="truncate">{parsedContact.location}</span>
                          </div>
                        )}
                        {parsedContact.email && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-amber-400 text-sm leading-none">✉️</span>
                            <span className="truncate">{parsedContact.email}</span>
                          </div>
                        )}
                        {parsedContact.url && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span className="text-amber-400 text-sm leading-none">🌐</span>
                            <a href={parsedContact.url} target="_blank" rel="noopener noreferrer" className="truncate underline text-brand-cyan">
                              {parsedContact.url}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Download Contact Card Button */}
                      <a
                        href={getVCardDownloadUrl(parsedContact)}
                        className="w-full py-2.5 bg-[#042f2e] text-amber-400 border border-[#115e59] hover:bg-[#115e59] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors mt-2"
                      >
                        💾 Import to Device Contacts
                      </a>
                    </div>
                  </div>
                )}

                {/* Scan again action button */}
                <button
                  onClick={() => {
                    setScanResult(null);
                    setParsedContact(null);
                    if (scanMode === "camera") startCamera();
                  }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-semibold rounded-xl text-xs transition-colors border border-white/5"
                >
                  🔄 Scan Another QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
