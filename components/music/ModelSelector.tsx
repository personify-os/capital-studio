import { cn } from '@/lib/utils'

export type MusicProvider = 'minimax' | 'suno'

const PROVIDERS: { id: MusicProvider; badge?: string; name: string; note: string; disabled?: boolean }[] = [
  { id: 'minimax', badge: 'Recommended', name: 'MiniMax Music v2', note: 'High-quality vocals or instrumental, on fal' },
  { id: 'suno',    badge: 'Needs setup',  name: 'Suno',            note: 'Requires a Suno API key — coming soon', disabled: true },
]

export default function ModelSelector({ model, onChange }: { model: MusicProvider; onChange: (m: MusicProvider) => void }) {
  return (
    <div className="bg-gray-50 rounded-card p-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Provider</p>
      <div className="space-y-2">
        {PROVIDERS.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={m.disabled}
            onClick={() => onChange(m.id)}
            className={cn(
              'relative w-full p-3 rounded-lg border-2 text-left transition-all',
              m.disabled
                ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                : model === m.id
                  ? 'border-brand-azure bg-brand-azure/5'
                  : 'border-gray-200 hover:border-brand-light',
            )}
          >
            {m.badge && (
              <span className={cn(
                'absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                m.disabled ? 'bg-gray-300 text-white' : 'bg-brand-azure text-white',
              )}>
                {m.badge}
              </span>
            )}
            <p className={cn('text-xs font-semibold', !m.disabled && model === m.id ? 'text-brand-azure' : 'text-brand-navy')}>
              {m.name}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
