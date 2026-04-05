import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { flags } from '@/lib/flags'
import Sidebar from '@/components/layout/Sidebar'

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const sidebarFlags = {
    videoGeneration: flags.videoGeneration,
    motionVideo:     flags.motionVideo,
    voiceover:       flags.voiceover,
    musicGeneration: flags.musicGeneration,
    analytics:       flags.analytics,
    socialScheduler: flags.socialScheduler,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      <Sidebar flags={sidebarFlags} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
