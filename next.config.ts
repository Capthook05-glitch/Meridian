import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Allow jsdom and readability in server components
  serverExternalPackages: ['jsdom', '@mozilla/readability'],
}

export default nextConfig
