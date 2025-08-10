/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // Disable static optimization for API routes to prevent build errors
  generateStaticParams: false,
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle Node.js modules that aren't compatible with Edge runtime
      config.externals = [...(config.externals || []), {
        'zcatalyst-sdk-node': 'zcatalyst-sdk-node',
        'jsonwebtoken': 'jsonwebtoken',
        'fs': 'fs',
        'path': 'path',
        'crypto': 'crypto',
      }];
    }
    return config;
  },
}

export default nextConfig