import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js/Vercel from bundling sharp into the serverless function.
  // sharp uses dlopen() to load libvips at runtime — bundlers can't detect this
  // dependency statically, so the .so file gets stripped from the bundle.
  // Marking it external forces Vercel to deploy the full node_modules/sharp tree.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
