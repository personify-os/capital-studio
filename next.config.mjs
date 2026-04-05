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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
        ],
      },
    ]
  },
}

export default nextConfig
