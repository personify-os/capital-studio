/**
 * Lightweight in-memory sliding-window rate limiter.
 * Suitable for single-instance deployments (Railway, etc.).
 * For multi-instance scale, swap the store for Upstash Redis.
 */

interface Window {
  count:     number
  resetAt:   number
}

const store = new Map<string, Window>()

// Prune expired entries every 5 minutes to avoid memory growth
setInterval(() => {
  const now = Date.now()
  for (const [key, win] of store) {
    if (now > win.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

/**
 * Check whether the given identifier has exceeded the limit.
 * @param identifier  Unique key — e.g. `ip:1.2.3.4` or `user:abc123`
 * @param limit       Max requests allowed in the window
 * @param windowMs    Window size in milliseconds
 * @returns { allowed: boolean; remaining: number; resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  limit:      number,
  windowMs:   number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const win = store.get(identifier)

  if (!win || now > win.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (win.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: win.resetAt }
  }

  win.count++
  return { allowed: true, remaining: limit - win.count, resetAt: win.resetAt }
}

/** Limits: aligned to enterprise_readiness_v3 Pillar 11 recommendations */
export const LIMITS = {
  AUTH:     { limit: 5,  windowMs: 60_000 },   // 5 / min  — brute-force guard
  GENERATE: { limit: 10, windowMs: 60_000 },   // 10 / min — AI cost guard
  API:      { limit: 60, windowMs: 60_000 },   // 60 / min — general
} as const
