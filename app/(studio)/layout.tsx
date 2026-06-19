import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { flags } from '@/lib/flags'
import { getDefaultBrandId } from '@/lib/default-brand'
import type { BrandId } from '@/lib/brands'
import { withTenant } from '@/lib/db'
import Sidebar from '@/components/layout/Sidebar'
import { DefaultBrandProvider } from '@/components/shared/DefaultBrandProvider'

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Best-effort: a brand-default preference must never take down the whole studio.
  // getDefaultBrandId already swallows query errors, but a prismaApp *connection*
  // failure rejects $transaction before the callback runs — so guard it here too.
  let defaultBrand: BrandId = 'lhcapital'
  try {
    defaultBrand = await withTenant(session.user.tenantId, (tx) => getDefaultBrandId(tx, session.user.tenantId))
  } catch (err) {
    console.error('[studio/layout] default-brand lookup failed, using fallback:', err)
  }

  const sidebarFlags = {
    videoGeneration: flags.videoGeneration,
    motionVideo:     flags.motionVideo,
    voiceover:       flags.voiceover,
    likenessVideo:   flags.likenessVideo,
    musicGeneration: flags.musicGeneration,
    analytics:       flags.analytics,
    socialScheduler: flags.socialScheduler,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      <Sidebar flags={sidebarFlags} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <DefaultBrandProvider value={defaultBrand}>{children}</DefaultBrandProvider>
        </main>
      </div>
    </div>
  )
}
