import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets CI and local verification build away from a running dev cache.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
