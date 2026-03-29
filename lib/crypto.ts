/**
 * AES-256-GCM token encryption for SocialAccount.accessToken at rest.
 *
 * Set TOKEN_ENCRYPTION_KEY to a 64-character hex string (32 bytes) in .env.local.
 * Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * If the key is absent the functions passthrough plaintext (safe for local dev).
 * In production the key MUST be set — Railway will reject starts without it if
 * you add TOKEN_ENCRYPTION_KEY to the required env-var list.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer | null {
  const hex = process.env.TOKEN_ENCRYPTION_KEY
  if (!hex) return null
  if (hex.length !== 64) throw new Error('TOKEN_ENCRYPTION_KEY must be 64 hex chars (32 bytes)')
  return Buffer.from(hex, 'hex')
}

/**
 * Encrypts plaintext → "iv:authTag:ciphertext" (all hex-encoded).
 * Returns plaintext unchanged when TOKEN_ENCRYPTION_KEY is not set.
 */
export function encryptToken(plaintext: string): string {
  const key = getKey()
  if (!key) return plaintext // dev passthrough

  const iv     = randomBytes(12) // 96-bit nonce for GCM
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const enc    = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag    = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`
}

/**
 * Decrypts a value produced by encryptToken.
 * Falls back to returning the value as-is for legacy plaintext rows or when
 * TOKEN_ENCRYPTION_KEY is absent.
 */
export function decryptToken(value: string): string {
  const key = getKey()
  if (!key) return value // dev passthrough

  const parts = value.split(':')
  if (parts.length !== 3) return value // not encrypted — legacy plaintext row

  const [ivHex, tagHex, dataHex] = parts
  try {
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
    const dec = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()])
    return dec.toString('utf8')
  } catch {
    return value // auth tag mismatch — return raw; caller will fail loudly
  }
}
