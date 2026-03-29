import Topbar from '@/components/layout/Topbar'
import WriterClient from './WriterClient'

export default function WriterPage() {
  return (
    <>
      <Topbar title="Content Writer" description="AI-generated captions, emails, and long-form content" />
      <WriterClient />
    </>
  )
}
