import Topbar from '@/components/layout/Topbar'
import BrandVaultClient from './BrandVaultClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface RawBrand {
  id: string
  type: 'LHC' | 'SIMRP' | 'PERSONAL'
  name: string
  logoUrl: string | null
  config: unknown
  isDefault: boolean
}

export default async function BrandVaultPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const brands = (await prisma.brandProfile.findMany({
    where:   { tenantId: session.user.tenantId },
    orderBy: { createdAt: 'asc' },
    select:  { id: true, type: true, name: true, logoUrl: true, config: true, isDefault: true },
  })) as RawBrand[]

  return (
    <>
      <Topbar title="Brand Vault" description="Manage your brand identities, logos, colors, and knowledge base" />
      <BrandVaultClient brands={brands} />
    </>
  )
}
