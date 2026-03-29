import { getToken }        from 'next-auth/jwt'
import { NextResponse }    from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, LIMITS } from '@/lib/ratelimit'

// ── Helpers ──────────────────────────────────────────────────────────────────

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

function tooManyRequests(resetAt: number) {
  return new NextResponse('Too Many Requests', {
    status: 429,
    headers: {
      'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
      'X-RateLimit-Reset': String(resetAt),
    },
  })
}

// ── Middleware ────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Rate-limit auth endpoint (brute-force guard) ──────────────────────────
  if (pathname.startsWith('/api/auth')) {
    const ip = clientIp(req)
    const { allowed, resetAt } = checkRateLimit(`auth:${ip}`, LIMITS.AUTH.limit, LIMITS.AUTH.windowMs)
    if (!allowed) return tooManyRequests(resetAt)
    return NextResponse.next()
  }

  // ── Rate-limit AI generation endpoints ───────────────────────────────────
  if (pathname.startsWith('/api/v1/generate')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const id    = token?.id ?? clientIp(req)
    const { allowed, resetAt } = checkRateLimit(`gen:${id}`, LIMITS.GENERATE.limit, LIMITS.GENERATE.windowMs)
    if (!allowed) return tooManyRequests(resetAt)
    return NextResponse.next()
  }

  // ── Protect all studio routes — redirect to login if unauthenticated ──────
  if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/images')    ||
      pathname.startsWith('/videos')    ||
      pathname.startsWith('/motion')    ||
      pathname.startsWith('/audio')     ||
      pathname.startsWith('/music')     ||
      pathname.startsWith('/graphics')  ||
      pathname.startsWith('/writer')    ||
      pathname.startsWith('/scheduler') ||
      pathname.startsWith('/brand-vault') ||
      pathname.startsWith('/library')   ||
      pathname.startsWith('/analytics')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/v1/generate/:path*',
    '/dashboard/:path*',
    '/images/:path*',
    '/videos/:path*',
    '/motion/:path*',
    '/audio/:path*',
    '/music/:path*',
    '/graphics/:path*',
    '/writer/:path*',
    '/scheduler/:path*',
    '/brand-vault/:path*',
    '/library/:path*',
    '/analytics/:path*',
  ],
}
