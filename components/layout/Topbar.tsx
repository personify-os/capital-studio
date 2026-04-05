import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import TopbarUserMenu from './TopbarUserMenu'

interface Props { title: string; description?: string }

export default async function Topbar({ title, description }: Props) {
  const session = await getServerSession(authOptions)
  const name  = session?.user?.name  ?? ''
  const email = session?.user?.email ?? ''

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-semibold text-brand-navy">{title}</h1>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <TopbarUserMenu name={name} email={email} />
    </header>
  )
}
