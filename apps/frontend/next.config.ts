import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@quest-board/types"],
  async headers() {
    return [
      {
        // Immutable static assets with content hash in filename (_next/static/*)
        // These can be cached indefinitely because the filename changes on content update
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Public directory assets (images, fonts, favicon etc.)
        source: "/:path*.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
