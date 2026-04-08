"use client";

import { useState } from "react";

interface DownloadButtonProps {
  imageData: string; // base64 data URI
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function DownloadButton({
  imageData,
  filename = "ai-qr",
  className = "",
  children,
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const cleaned = filename
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .replace(/__+/g, "_")
        .replace(/^_|_$/g, "");
      const baseName = cleaned || "ai-qr";

      // Detect extension from MIME type in data URI header
      const mimeMatch = imageData.match(/^data:([^;]+);/);
      const mime = mimeMatch?.[1] ?? "image/png";
      const ext = mime === "image/jpeg" || mime === "image/jpg" ? "jpg" : "png";
      const finalFilename = `${baseName}.${ext}`;

      // fetch() natively handles data URIs and produces a correctly-typed Blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm ${className}`}
    >
      {children ? children : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {downloading ? "Downloading…" : "Download"}
        </>
      )}
    </button>
  );
}
