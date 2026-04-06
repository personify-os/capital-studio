import { redirect } from 'next/navigation'
import { flags } from '@/lib/flags'
import Topbar from '@/components/layout/Topbar'
import LikenessClient from './LikenessClient'

export default function LikenessPage() {
  if (!flags.likenessVideo) redirect('/dashboard')
  return (
    <>
      <Topbar title="Likeness Video" description="AI talking-head videos with HeyGen" />
      <LikenessClient />
    </>
  )
}
