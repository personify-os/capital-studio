import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep Neon's ws dependency in Node.js runtime (server-side only)
    serverComponentsExternalPackages: ['ws', '@neondatabase/serverless', 'pdf-parse'],
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

export default withSentryConfig(nextConfig, {
  org:     process.env.SENTRY_ORG     ?? 'personify-os',
  project: process.env.SENTRY_PROJECT ?? 'capital-studio',
  silent: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  tunnelRoute: undefined,
  disableLogger: true,
})
