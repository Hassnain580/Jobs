import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove X-Powered-By: Next.js header
  poweredByHeader: false,

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
