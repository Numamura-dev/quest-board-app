import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Extract origin (scheme + host) from API base URL for CSP
function getApiOrigin(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url;
  }
}

const apiOrigin = getApiOrigin(apiBaseUrl);
const isDev = process.env.NODE_ENV !== "production";

// 'unsafe-eval' は HMR のため開発環境のみ許可する。
// 'unsafe-inline' は Next.js が注入するインラインスクリプト対応のため残している暫定措置。
// 本番での完全排除は Middleware による nonce 付与が必要（issue #324 で追跡）。
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com"
  : "script-src 'self' 'unsafe-inline' https://apis.google.com";

const ContentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' ${apiOrigin} https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com`,
  "img-src 'self' data: blob:",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
]
  .join("; ")
  .trim();

const nextConfig: NextConfig = {
  transpilePackages: ["@quest-board/types"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
