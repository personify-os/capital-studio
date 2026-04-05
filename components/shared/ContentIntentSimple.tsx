import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TOPIC_TIERS, PURPOSES, CTA_OPTIONS } from '@/lib/content-intent'

interface Props {
  open:            boolean
  onOpenChange:    (v: boolean) => void
  selectedTopics:  string[]
  onToggleTopic:   (id: string) => void
  selectedPurpose: string
  onPurposeChange: (id: string) => void
  selectedCta:     string
  onCtaChange:     (id: string) => void
}

const pillBase = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-all'
const pillOn   = 'bg-brand-azure text-white border-brand-azure'
const pillOff  = 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'

export default function ContentIntentSimple({
  open, onOpenChange, selectedTopics, onToggleTopic,
  selectedPurpose, onPurposeChange, selectedCta, onCtaChange,
}: Props) {
  return (
    <div className="bg-gray-50 rounded-card p-4">
      <button type="button" onClick={() => onOpenChange(!open)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Content Intent</span>
          <span className="text-[9px] text-gray-400">— helps AI create targeted content</span>
        </div>
        {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_TIERS.filter((cat) => cat.id !== 'personal-brand').map((cat) => (
                <button key={cat.id} type="button" onClick={() => onToggleTopic(cat.id)}
                  className={cn(pillBase, selectedTopics.includes(cat.id) ? pillOn : pillOff)}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Purpose</p>
            <div className="flex flex-wrap gap-1.5">
              {PURPOSES.map((p) => (
                <button key={p.id} type="button" onClick={() => onPurposeChange(selectedPurpose === p.id ? '' : p.id)}
                  className={cn(pillBase, selectedPurpose === p.id ? pillOn : pillOff)}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Call to Action <span className="normal-case font-normal text-gray-400">(optional)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {CTA_OPTIONS.map((c) => (
                <button key={c.id} type="button" onClick={() => onCtaChange(selectedCta === c.id ? '' : c.id)}
                  className={cn(pillBase, selectedCta === c.id ? pillOn : pillOff)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
