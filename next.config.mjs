import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix multiple lockfiles warning
  outputFileTracingRoot: __dirname,
  // Disable Next.js image optimization on servers without sharp
  images: {
    unoptimized: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Increase body size limit for file uploads (procurement forms with attachments)
  experimental: {
    // This is for App Router server actions
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // For Pages Router API routes, we handle this with formidable's maxFileSize
  // But we need to ensure Next.js doesn't block the request before it reaches our API
  
  // Fix watchpack path issues in dev mode
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
};

export default nextConfig;



