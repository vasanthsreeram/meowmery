/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'xjalkzlmsvkpkmmealxt.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Add strict mode to help catch hydration issues
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure onDemandEntries
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  }
};

module.exports = nextConfig; 