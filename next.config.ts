/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add headers configuration for cookie handling
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  // Ensure cookies work properly behind proxies
  poweredByHeader: false,
  // Add this to ensure proper hostname handling in Docker
  assetPrefix:
    process.env.NODE_ENV === "production"
      ? "https://presupuesto.elquisco.cl"
      : undefined,
};

module.exports = nextConfig;
