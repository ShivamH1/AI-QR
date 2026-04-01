export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-purple/30 to-brand-cyan/30 flex items-center justify-center text-xs font-bold text-white/60">
            Q
          </div>
          <p className="text-gray-500 text-sm">
            Built with Next.js · MistralAI · Stable Diffusion · GSAP
          </p>
        </div>
        <p className="text-gray-600 text-sm">
          QR codes are stored locally on your device
        </p>
      </div>
    </footer>
  );
}
