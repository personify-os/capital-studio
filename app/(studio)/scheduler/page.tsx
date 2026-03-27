import Topbar from '@/components/layout/Topbar'

// Social Scheduler — Phase 2
// OAuth connections and post scheduling will be built here.
// Platforms: Facebook, Instagram, X, LinkedIn, YouTube, TikTok, Threads, Substack, Medium

export default function SchedulerPage() {
  return (
    <>
      <Topbar title="Social Scheduler" description="Connect your accounts and schedule posts" />
      <div className="p-6 max-w-4xl">
        <div className="bg-white rounded-card shadow-card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#041740]/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#041740]">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-[#041740] mb-2">Social Scheduler — Coming Next</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Connect Facebook, Instagram, X, LinkedIn, YouTube, TikTok, Threads, Substack, and Medium via OAuth.
            Schedule posts directly from your Content Library.
          </p>
        </div>
      </div>
    </>
  )
}
