import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ]
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true,

  // Optimize images if you add any
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  webpack: (config, { isServer, dev, nextRuntime }) => {
    // Client-only Node fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
        os: false,
        dns: false,
      };
    }

    // Prevent server OTEL from leaking to client / edge
    if (!isServer || nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        [path.resolve(__dirname, 'lib/otel/server.ts')]: false,
      };
    }

    // Silence OTEL dynamic-require warning (client only)
    if (!isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings ?? []),
        (warning: any) =>
          typeof warning.message === 'string' &&
          warning.message.includes(
            'require function is used in a way in which dependencies cannot be statically extracted'
          ) &&
          warning.module?.resource?.includes('@opentelemetry'),
      ];
    }

    // Prod client optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }

    return config;
  },
};

export default nextConfig;
