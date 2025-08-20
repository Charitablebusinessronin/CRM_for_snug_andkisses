import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [],
  // Configure for production deployment
  compress: true,
  poweredByHeader: false,
  generateEtags: false
};

export default nextConfig;
