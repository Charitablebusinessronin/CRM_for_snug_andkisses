import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: __dirname,
  serverExternalPackages: [],
  // Configure for production deployment
  compress: true,
  poweredByHeader: false,
  generateEtags: false
};

export default nextConfig;
