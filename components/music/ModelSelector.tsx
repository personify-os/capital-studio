import { cn } from '@/lib/utils'

export type MusicModel = 'chirp-v4' | 'chirp-v3-5' | 'chirp-v3'

const MODELS: { id: MusicModel; badge?: string; name: string; note: string }[] = [
  { id: 'chirp-v4',   badge: 'Latest', name: 'V4',   note: 'Superior musical expression, up to 4 min' },
  { id: 'chirp-v3-5', name: 'V3.5',   note: 'Enhanced quality, up to 8 min' },
  { id: 'chirp-v3',   name: 'V3',     note: 'Broader capabilities, up to 8 min' },
]

export default function ModelSelector({ model, onChange }: { model: MusicModel; onChange: (m: MusicModel) => void }) {
  return (
    <div className="bg-gray-50 rounded-card p-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Model</p>
      <div className="space-y-2">
        {MODELS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              'relative w-full p-3 rounded-lg border-2 text-left transition-all',
              model === m.id
                ? 'border-brand-azure bg-brand-azure/5'
                : 'border-gray-200 hover:border-brand-light',
            )}
          >
            {m.badge && (
              <span className="absolute top-1.5 right-1.5 bg-brand-azure text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {m.badge}
              </span>
            )}
            <p className={cn('text-xs font-semibold', model === m.id ? 'text-brand-azure' : 'text-brand-navy')}>
              {m.name}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
