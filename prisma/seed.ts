import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = 'info@lhccapital.org'
  const password = process.env.SEED_PASSWORD ?? '$imrp2LHC'
  const name     = 'LH Capital'

  // Ensure tenant exists
  const tenant = await prisma.tenant.upsert({
    where:  { id: 'lhcapital' },
    create: { id: 'lhcapital', name: 'LH Capital' },
    update: {},
  })

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where:  { email },
    create: {
      email,
      name,
      password: hashed,
      tenantId: tenant.id,
      role:     'ADMIN',
    },
    update: {
      password: hashed,
      name,
    },
  })

  console.log(`✓ User ready: ${user.email} (tenant: ${tenant.id})`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
