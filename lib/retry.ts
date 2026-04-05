/**
 * Exponential backoff retry wrapper for external API calls.
 * Retries on any error by default; pass `retryOn` to limit to specific errors
 * (e.g. transient 429 / 503, not auth errors).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    retries?:     number
    baseDelayMs?: number
    retryOn?:     (err: unknown) => boolean
  } = {},
): Promise<T> {
  const { retries = 2, baseDelayMs = 1000, retryOn } = options
  let lastErr: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt === retries) break
      if (retryOn && !retryOn(err)) break
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt))
    }
  }

  throw lastErr
}

/** Returns true for errors that are likely transient (rate limits, server errors). */
export function isTransient(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    return msg.includes('429') || msg.includes('503') || msg.includes('502')
      || msg.includes('rate limit') || msg.includes('timeout') || msg.includes('econnreset')
  }
  return false
}
