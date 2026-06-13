import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove X-Powered-By: Next.js header
  poweredByHeader: false,

  // Serve static assets from /_s/ instead of /_next/ — hides Next.js pattern from page source
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_s' : '',

  async rewrites() {
    return [
      // Proxy /_s/* → /_next/* so the server can still find the files
      {
        source: '/_s/:path*',
        destination: '/_next/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Remove server/technology fingerprinting headers
          { key: 'X-Powered-By',        value: '' },
          { key: 'Server',              value: '' },
          // Security headers that also obscure stack
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
