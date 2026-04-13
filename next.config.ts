import type { NextConfig } from "next";

const BACKEND =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable dev overlay to prevent nextjs-portal positioning issues
  reactStrictMode: true,
  // Suppress hydration warnings for browser extensions
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  async rewrites() {
    return [
      {
        source: "/api/deepsite/projects/:projectId/proxy/:path*",
        destination: `${BACKEND}/api/deepsite/projects/:projectId/proxy/:path*`,
      },
    ];
  },
};

export default nextConfig;
