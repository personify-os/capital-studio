import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { flags } from '@/lib/flags'
import { getDefaultBrandId } from '@/lib/default-brand'
import { withTenant } from '@/lib/db'
import Sidebar from '@/components/layout/Sidebar'
import { DefaultBrandProvider } from '@/components/shared/DefaultBrandProvider'

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const defaultBrand = await withTenant(session.user.tenantId, (tx) => getDefaultBrandId(tx, session.user.tenantId))

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
