import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Required for PrismaNeon in Node.js (Railway/server) environments
neonConfig.webSocketConstructor = ws

function makeClient(connectionString: string) {
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })
}

// Singletons — prevent multiple instances in dev hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; prismaApp?: PrismaClient }

/**
 * Owner connection — BYPASSES Row Level Security.
 * Use ONLY for paths that legitimately operate outside a single tenant:
 *   - auth (looks up the user by email before any tenant is known)
 *   - the cron publisher (queries scheduled posts across all tenants)
 *   - seed + migrations
 * Everything tenant-scoped must go through `withTenant()` instead.
 */
export const prisma = globalForPrisma.prisma ?? makeClient(process.env.DATABASE_URL!)

/**
 * Application connection used by `withTenant()`. In production this should be a
 * NON-OWNER Postgres role (`app_user`) so RLS policies enforce tenant isolation.
 * Falls back to the owner connection when APP_DATABASE_URL is unset — so the
 * codebase works (without RLS enforcement) until the cutover flips this on.
 */
const appUrl = process.env.APP_DATABASE_URL || process.env.DATABASE_URL!
export const prismaApp = globalForPrisma.prismaApp ?? makeClient(appUrl)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaApp = prismaApp
}

/**
 * Run tenant-scoped queries with RLS enforcement.
 *
 * Opens a transaction on the app connection and sets `app.tenant_id` as a
 * transaction-local variable. The Phase-1 RLS policies
 * (`tenantId = current_setting('app.tenant_id', true)`) then scope every query
 * inside to that tenant — at the database level, as defense-in-depth beyond the
 * application-layer `where: { tenantId }` filtering.
 *
 * Wrap ALL of a request's tenant-scoped DB work in a SINGLE withTenant call
 * (one transaction per request), passing the `tx` client to any helper that
 * queries the DB. Keep the explicit `where: { tenantId }` filters too.
 *
 * @example
 * const assets = await withTenant(session.user.tenantId, (tx) =>
 *   tx.asset.findMany({ where: { tenantId: session.user.tenantId } })
 * )
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prismaApp.$transaction(async (tx) => {
    // SET LOCAL scopes the variable to this transaction only — safe with pgbouncer
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`
    return fn(tx)
  })
}
