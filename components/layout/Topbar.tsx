import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface Props { title: string; description?: string }

export default async function Topbar({ title, description }: Props) {
  const session = await getServerSession(authOptions)

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-semibold text-[#041740]">{title}</h1>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-azure/10 flex items-center justify-center">
          <span className="text-brand-azure font-semibold text-xs">
            {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
          </span>
        </div>
        <span className="text-sm text-gray-600 hidden sm:block">
          {session?.user?.name ?? session?.user?.email}
        </span>
      </div>
    </header>
  )
}
