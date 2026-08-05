import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Keep development assets separate so a production build cannot invalidate HMR or CSS files.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next"
};

export default nextConfig;
