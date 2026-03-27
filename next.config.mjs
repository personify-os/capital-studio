/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep Neon's ws dependency in Node.js runtime (server-side only)
    serverComponentsExternalPackages: ['ws', '@neondatabase/serverless'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'fal.media' },
      { protocol: 'https', hostname: '**.fal.ai' },
    ],
  },
}

export default nextConfig
