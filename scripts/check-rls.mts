/**
 * RLS smoke-test — verifies Phase 2 tenant isolation end-to-end.
 *
 *   npx tsx scripts/check-rls.mts          # checks the current .env.local
 *
 * What it does (no hardcoded values):
 *   1. Connects the owner client (prisma) and the app client (prismaApp).
 *   2. Detects whether enforcement is actually ON — i.e. prismaApp connects as a
 *      *different* (non-owner) role. If APP_DATABASE_URL is unset, prismaApp
 *      falls back to the owner connection and RLS is NOT enforced; the script
 *      says so loudly and skips the strict scoping asserts.
 *   3. When enforcing, it picks a real tenant via the owner connection (ground
 *      truth, bypasses RLS) and asserts that withTenant() on prismaApp:
 *        - in-tenant  → sees exactly that tenant's Asset count
 *        - wrong/no tenant → sees 0 rows
 *
 * Exit code 0 = pass, 1 = fail. Safe to run against prod (read-only).
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

const { prisma, prismaApp, withTenant } = await import('../lib/db')

const whoami = async (client: typeof prisma) =>
  (await client.$queryRawUnsafe<{ u: string }[]>('SELECT current_user::text AS u'))[0].u

async function main() {
  const ownerRole = await whoami(prisma)
  const appRole   = await whoami(prismaApp)
  const enforcing = appRole !== ownerRole

  console.log(`owner client role: ${ownerRole}`)
  console.log(`app client role:   ${appRole}`)

  if (!enforcing) {
    console.log('\n⚠️  APP_DATABASE_URL is unset (or equals the owner URL).')
    console.log('   prismaApp is using the OWNER connection — RLS is NOT enforced.')
    console.log('   Set APP_DATABASE_URL to the non-owner app_user connection to enforce.')
    process.exit(0) // not a failure — just not enforcing
  }

  // Ground truth from the owner connection (bypasses RLS).
  const tenant = await prisma.tenant.findFirst({ select: { id: true } })
  if (!tenant) { console.log('\n(no tenants in DB — nothing to check)'); process.exit(0) }
  const truth = await prisma.asset.count({ where: { tenantId: tenant.id } })

  // App connection, scoped via withTenant — no explicit where clause, so the
  // count reflects pure RLS scoping.
  const inTenant = await withTenant(tenant.id, (tx) => tx.asset.count())
  const wrong    = await withTenant(`__rls_check_${Date.now()}__`, (tx) => tx.asset.count())

  console.log(`\ntenant ${tenant.id}: owner sees ${truth} assets`)
  console.log(`  app in-tenant (expect ${truth}): ${inTenant}`)
  console.log(`  app wrong-tenant (expect 0):     ${wrong}`)

  const pass = appRole !== ownerRole && inTenant === truth && wrong === 0
  console.log(pass ? '\n✅ RLS ENFORCED & SCOPED CORRECTLY' : '\n❌ RLS CHECK FAILED')
  process.exit(pass ? 0 : 1)
}

main().catch((e) => { console.error('\n❌ THREW:', e?.constructor?.name, '-', e?.message); process.exit(1) })
