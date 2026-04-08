'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import BrandSelector from '@/components/shared/BrandSelector'
import type { BrandId } from '@/lib/brands'
import type { HeyGenAvatar, HeyGenVoice, AspectRatio } from '@/services/likeness'

interface Props {
  avatars:      HeyGenAvatar[]
  voices:       HeyGenVoice[]
  loadingAssets:boolean
  avatarId:     string
  voiceId:      string
  aspectRatio:  AspectRatio
  script:       string
  brandId:      BrandId
  onAvatarId:   (v: string) => void
  onVoiceId:    (v: string) => void
  onAspectRatio:(v: AspectRatio) => void
  onScript:     (v: string) => void
  onBrandId:    (v: BrandId) => void
  canGenerate:  boolean
  loading:      boolean
  error:        string | null
  onGenerate:   () => void
}

const RATIOS: { value: AspectRatio; label: string; sub: string }[] = [
  { value: '16:9', label: '16:9', sub: 'Landscape' },
  { value: '9:16', label: '9:16', sub: 'Portrait'  },
  { value: '1:1',  label: '1:1',  sub: 'Square'    },
]

export default function LikenessControls({
  avatars, voices, loadingAssets,
  avatarId, voiceId, aspectRatio, script, brandId,
  onAvatarId, onVoiceId, onAspectRatio, onScript, onBrandId,
  canGenerate, loading, error, onGenerate,
}: Props) {
  const [avatarSearch,    setAvatarSearch]    = useState('')
  const [voiceSearch,     setVoiceSearch]     = useState('')
  const [avatarsCollapsed, setAvatarsCollapsed] = useState(false)

  const filteredAvatars = avatars.filter((av) =>
    !avatarSearch.trim() || av.avatar_name.toLowerCase().includes(avatarSearch.toLowerCase()),
  )

  const filteredVoices = voices.filter((v) =>
    !voiceSearch.trim() || v.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
    v.language.toLowerCase().includes(voiceSearch.toLowerCase()),
  )

  // Find the selected avatar name for display when collapsed
  const selectedAvatarName = avatars.find((av) => av.avatar_id === avatarId)?.avatar_name

  return (
    <aside className="w-80 flex-shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-gray-100 bg-white flex flex-col">
      <div className="flex-1 p-5 space-y-5">
        <BrandSelector value={brandId} onChange={onBrandId} />

        {/* Avatar selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Avatar</p>
            <button type="button" onClick={() => setAvatarsCollapsed((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-brand-azure transition-colors">
              {avatarsCollapsed ? (
                <><ChevronDown size={11} /> Show{selectedAvatarName ? ` (${selectedAvatarName})` : ''}</>
              ) : (
                <><ChevronUp size={11} /> Collapse</>
              )}
            </button>
          </div>

          {!avatarsCollapsed && (
            <>
              {loadingAssets ? (
                <p className="text-xs text-gray-400">Loading avatars…</p>
              ) : avatars.length === 0 ? (
                <p className="text-xs text-gray-400">No avatars found in your HeyGen account.</p>
              ) : (
                <>
                  {avatars.length > 6 && (
                    <div className="relative mb-2">
                      <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text" value={avatarSearch} onChange={(e) => setAvatarSearch(e.target.value)}
                        placeholder="Search avatars…"
                        className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure"
                      />
                    </div>
                  )}
                  {filteredAvatars.length === 0 ? (
                    <p className="text-xs text-gray-400">No avatars match &ldquo;{avatarSearch}&rdquo;</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {filteredAvatars.map((av) => (
                        <button
                          key={av.avatar_id} type="button" onClick={() => onAvatarId(av.avatar_id)}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                            avatarId === av.avatar_id
                              ? 'border-brand-azure ring-2 ring-brand-azure/20'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          title={av.avatar_name}
                        >
                          {av.preview_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={av.preview_image_url} alt={av.avatar_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 p-1 text-center">
                              {av.avatar_name}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {avatarsCollapsed && selectedAvatarName && (
            <p className="text-xs text-brand-azure font-medium">{selectedAvatarName} selected</p>
          )}
          {avatarsCollapsed && !selectedAvatarName && (
            <p className="text-xs text-gray-400">No avatar selected — expand to choose</p>
          )}
        </div>

        {/* Voice */}
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Voice</p>
          {voices.length > 8 && (
            <div className="relative mb-2">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text" value={voiceSearch} onChange={(e) => setVoiceSearch(e.target.value)}
                placeholder="Search voices or language…"
                className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure"
              />
            </div>
          )}
          <div className="relative">
            <select
              value={voiceId} onChange={(e) => onVoiceId(e.target.value)}
              className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand-azure bg-white"
            >
              <option value="">Select a voice…</option>
              {filteredVoices.map((v) => (
                <option key={v.voice_id} value={v.voice_id}>
                  {v.name} ({v.language} · {v.gender})
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {voiceSearch && filteredVoices.length === 0 && (
            <p className="text-[10px] text-gray-400 mt-1">No voices match &ldquo;{voiceSearch}&rdquo;</p>
          )}
        </div>

        {/* Aspect ratio */}
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Format</p>
          <div className="flex gap-2">
            {RATIOS.map((r) => (
              <button key={r.value} type="button" onClick={() => onAspectRatio(r.value)}
                className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                  aspectRatio === r.value
                    ? 'border-brand-azure bg-brand-azure/5 text-brand-azure'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <p className="text-xs font-semibold">{r.label}</p>
                <p className="text-[9px] text-current opacity-70">{r.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Script */}
        <div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Script</p>
          <textarea
            value={script} onChange={(e) => onScript(e.target.value)}
            placeholder="Enter the script for your avatar to speak…"
            rows={8}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure"
          />
          <p className="text-[10px] text-gray-400 mt-1 text-right">{script.length}/5000</p>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 space-y-2">
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <button type="button" disabled={!canGenerate || loading} onClick={onGenerate}
          className="w-full py-2.5 rounded-lg bg-brand-azure hover:bg-brand-navy disabled:opacity-50 text-white font-semibold text-sm transition-colors">
          {loading ? 'Submitting…' : 'Generate Video'}
        </button>
        <p className="text-[10px] text-gray-400 text-center">HeyGen videos typically take 2–5 minutes to render</p>
      </div>
    </aside>
  )
}
