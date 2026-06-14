import Topbar from '@/components/layout/Topbar'
import PlanClient from './PlanClient'

export default function PlanPage() {
  return (
    <>
      <Topbar title="Content Plan" description="Drop a content calendar and generate every post at once" />
      <PlanClient />
    </>
  )
}
