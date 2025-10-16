
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
    if (!isServer) {
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
    }

    // Ignore canvas module completely for client-side builds
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('canvas');
      // Exclude genkit and AI-related modules from client-side builds
      config.externals.push('genkit');
      config.externals.push('@genkit-ai/googleai');
      config.externals.push('@genkit-ai/core');
      config.externals.push('@genkit-ai/firebase');
      config.externals.push('handlebars');
    }

    // Fix for handlebars require.extensions
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'handlebars-loader',
    });

    // Ignore genkit-related modules in client builds
    config.resolve.alias = {
      ...config.resolve.alias,
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
