import type { NextConfig } from "next";
const apiOrigin = (process.env.SALONBOOK_API_ORIGIN ?? "http://localhost:4000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  ...(process.platform === "win32" ? { experimental: { cpus: 1, parallelServerCompiles: false, parallelServerBuildTraces: false } } : {}),
  // Keep Windows development/build output separate from any open Next dev process.
  distDir: process.env.NEXT_DIST_DIR ?? (process.platform === "win32" ? ".next-windows" : ".next"),
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
};
export default nextConfig;

