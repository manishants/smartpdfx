
import { config } from 'dotenv';
import type {NextConfig} from 'next';

config();

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for canvas module and other Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
      assert: false,
      http: false,
      https: false,
      url: false,
      zlib: false,
    };

    // Completely exclude 'canvas' from both client and server bundles
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push('canvas');
    }

    // Fix for handlebars require.extensions
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
    });

    // Aliases to prevent client-side bundling of certain modules
    config.resolve.alias = {
      ...config.resolve.alias,
      // Block canvas everywhere to avoid native .node resolution during build
      'canvas': false,
      // Also block the nested canvas inside pdfjs-dist
      'pdfjs-dist/node_modules/canvas': false,
      ...(isServer ? {} : {
        'genkit': false,
        '@genkit-ai/googleai': false,
        '@genkit-ai/core': false,
        '@genkit-ai/firebase': false,
        'handlebars': false,
      }),
    };

    return config;
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-src 'self' https://googleads.g.doubleclick.net https://*.google.com",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ]
  },
};

export default nextConfig;
