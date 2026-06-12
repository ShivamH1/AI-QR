"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const trigger = ScrollTrigger.create({
      start: "top -80",
      onEnter: () =>
        gsap.to(nav, {
          backdropFilter: "blur(20px)",
          backgroundColor: "rgba(3, 7, 18, 0.88)",
          borderBottomColor: "rgba(255,255,255,0.06)",
          duration: 0.3,
        }),
      onLeaveBack: () =>
        gsap.to(nav, {
          backdropFilter: "blur(0px)",
          backgroundColor: "transparent",
          borderBottomColor: "transparent",
          duration: 0.3,
        }),
    });

    return () => trigger.kill();
  }, []);

  return (
    <nav
      ref={navRef}
      className="navbar fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-colors"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-cyan flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-brand-purple/20">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Top Left Finder Pattern */}
              <rect x="3" y="3" width="6" height="6" rx="1.5" />
              <rect x="5" y="5" width="2" height="2" fill="currentColor" />
              
              {/* Bottom Left Finder Pattern */}
              <rect x="3" y="15" width="6" height="6" rx="1.5" />
              <rect x="5" y="17" width="2" height="2" fill="currentColor" />
              
              {/* Top Right Finder Pattern */}
              <rect x="15" y="3" width="6" height="6" rx="1.5" />
              <rect x="17" y="5" width="2" height="2" fill="currentColor" />
              
              {/* Small styling/pixels representing AI blending */}
              <rect x="15" y="15" width="2" height="2" rx="0.5" fill="currentColor" />
              <rect x="19" y="19" width="2" height="2" rx="0.5" fill="currentColor" />
              <rect x="15" y="19" width="2" height="2" rx="0.5" fill="currentColor" />
              <rect x="19" y="15" width="2" height="2" rx="0.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight gradient-text">
            AI QR
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors relative py-1 ${
              pathname === "/" ? "text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Generate
            {pathname === "/" && (
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full" />
            )}
          </Link>
          <Link
            href="/gallery"
            className={`text-sm font-medium transition-colors relative py-1 ${
              pathname === "/gallery"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Gallery
            {pathname === "/gallery" && (
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-purple to-brand-cyan rounded-full" />
            )}
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors ml-2"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
}
