import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// SECURITY: locked-down-by-default CSP. 'unsafe-inline' is kept for
// script/style only because that's what Next.js's hydration payload and
// our Tailwind/inline `style={{}}` usage require without wiring a
// per-request nonce through every page (which would also force every route,
// including the static auth pages, into dynamic rendering — see
// SECURITY.md for the trade-off). Every other directive is scoped to the
// exact external hosts this app actually talks to.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.supabase.co https://*.tile.openstreetmap.org https://unpkg.com;
  font-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://nominatim.openstreetmap.org;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
