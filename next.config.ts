import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable dev overlay to prevent nextjs-portal positioning issues
  reactStrictMode: true,
  // Suppress hydration warnings for browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
