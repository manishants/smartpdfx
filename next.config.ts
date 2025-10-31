
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
};

export default nextConfig;
