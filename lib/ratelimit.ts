/**
 * Sliding-window rate limiter backed by Upstash Redis.
 * Falls back to in-memory when UPSTASH_REDIS_REST_URL is not set (local dev).
 * prefix: 'capital-studio' namespaces keys so a shared Redis DB won't
 * cross-contaminate with other apps (Capital Ledger, etc.).
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis }     from '@upstash/redis'

// ── Limits: aligned to enterprise_readiness_v4 Pillar 11 ─────────────────────
export const LIMITS = {
  AUTH:     { limit: 5,  windowMs: 60_000 },   // 5 / min  — brute-force guard
  GENERATE: { limit: 10, windowMs: 60_000 },   // 10 / min — AI cost guard
  API:      { limit: 60, windowMs: 60_000 },   // 60 / min — general
} as const

// ── In-memory fallback (dev only) ─────────────────────────────────────────────
interface Window { count: number; resetAt: number }
const memStore = new Map<string, Window>()
setInterval(() => {
  const now = Date.now()
  for (const [key, win] of memStore) {
    if (now > win.resetAt) memStore.delete(key)
  }
}, 5 * 60 * 1000)

function memCheck(id: string, limit: number, windowMs: number) {
  const now = Date.now()
  const win = memStore.get(id)
  if (!win || now > win.resetAt) {
    memStore.set(id, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }
  if (win.count >= limit) return { allowed: false, remaining: 0, resetAt: win.resetAt }
  win.count++
  return { allowed: true, remaining: limit - win.count, resetAt: win.resetAt }
}

// ── Upstash limiters ──────────────────────────────────────────────────────────
function makeLimiter(requests: number, window: `${number} ${'s' | 'm' | 'h'}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  return new Ratelimit({
    redis:   Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix:  'capital-studio',
    analytics: true,
  })
}

const authLimiter     = makeLimiter(5,  '60 s')
const generateLimiter = makeLimiter(10, '60 s')
const apiLimiter      = makeLimiter(60, '60 s')

function limiterFor(limit: number, windowMs: number) {
  if (limit === LIMITS.AUTH.limit     && windowMs === LIMITS.AUTH.windowMs)     return authLimiter
  if (limit === LIMITS.GENERATE.limit && windowMs === LIMITS.GENERATE.windowMs) return generateLimiter
  return apiLimiter
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function checkRateLimit(
  identifier: string,
  limit:      number,
  windowMs:   number,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const rl = limiterFor(limit, windowMs)
  if (!rl) return memCheck(identifier, limit, windowMs)

  const { success, remaining, reset } = await rl.limit(identifier)
  return { allowed: success, remaining, resetAt: reset }
}
