import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Required for PrismaNeon in Node.js (Railway/server) environments
neonConfig.webSocketConstructor = ws

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

// Singleton — prevents multiple instances in dev hot-reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Execute Prisma queries within a tenant-scoped transaction.
 *
 * Sets `app.tenant_id` as a transaction-local session variable so Postgres
 * RLS policies can enforce tenant isolation at the database level — providing
 * defense-in-depth beyond the application-layer `where: { tenantId }` scoping.
 *
 * Use this for all new API routes. Existing routes enforce isolation at the
 * application layer (correct but without RLS backstop). Once all routes are
 * migrated, enable FORCE ROW LEVEL SECURITY on each table to complete Phase 2.
 *
 * @example
 * const assets = await withTenant(session.user.tenantId, (tx) =>
 *   tx.asset.findMany({ where: { tenantId: session.user.tenantId } })
 * )
 */
export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // SET LOCAL scopes the variable to this transaction only — safe with pgbouncer
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`
    return fn(tx)
  })
}
