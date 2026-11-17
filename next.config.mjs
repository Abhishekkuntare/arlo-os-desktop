/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  experimental: {
    agentUpgrade: "security"
  },
  async rewrites() {
    return [
      {
        source: "/public/assets/:path*",
        destination: "/assets/:path*"
      }
    ];
  },
  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
