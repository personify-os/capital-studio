'use client'

import { useState, useCallback } from 'react'
import { Mic, AlertCircle, ChevronDown, ChevronUp, Download, Zap, Sparkles } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { TOPIC_TIERS, PURPOSES, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AudioAsset { id: string; url: string }
interface GenerateResponse { asset: AudioAsset }
interface RecentAudio { id: string; s3Url: string; metadata: any; createdAt: string }

// ─── Constants ────────────────────────────────────────────────────────────────

type ScriptDuration = '30' | '60' | '90' | '120'

const SCRIPT_DURATIONS: { value: ScriptDuration; label: string }[] = [
  { value: '30',  label: '30s' },
  { value: '60',  label: '60s' },
  { value: '90',  label: '90s' },
  { value: '120', label: '2 min' },
]

const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  note: 'Professional female, calm & clear' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',    note: 'Professional male, authoritative' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',    note: 'Confident female, strong delivery' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  note: 'Conversational male, warm tone' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli',    note: 'Friendly female, upbeat energy' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AudioClient({ recentAudio: initial }: { recentAudio: RecentAudio[] }) {
  const [script,          setScript]          = useState('')
  const [voiceId,         setVoiceId]         = useState(VOICES[0].id)
  const [brandId,         setBrandId]         = useState<BrandId>('lhcapital')
  const [recentAudio,     setRecentAudio]     = useState(initial)
  const [intentOpen,      setIntentOpen]      = useState(true)
  const [selectedTopics,  setSelectedTopics]  = useState<string[]>([])
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [scriptTopic,     setScriptTopic]     = useState('')
  const [scriptDuration,  setScriptDuration]  = useState<ScriptDuration>('60')
  const [scriptLoading,   setScriptLoading]   = useState(false)
  const [scriptOpen,      setScriptOpen]      = useState(false)

  const { data, loading, error, generate } = useGenerate<object, GenerateResponse>({
    endpoint:  '/api/v1/generate/audio',
    onSuccess: (res) => {
      const voice = VOICES.find((v) => v.id === voiceId)
      setRecentAudio((prev) => [
        { id: res.asset.id, s3Url: res.asset.url, metadata: { text: script.slice(0, 100), voiceName: voice?.name }, createdAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 12))
    },
  })

  const handleGenerate = useCallback(() => {
    if (!script.trim()) return
    const topicLabels  = selectedTopics.map((id) => TOPIC_TIERS.find((t) => t.id === id)?.label ?? id)
    const purposeLabel = PURPOSES.find((p) => p.id === selectedPurpose)?.label ?? selectedPurpose
    const intent       = buildIntentString(topicLabels, purposeLabel, '')
    const fullText     = intent ? `${script.trim()}\n\n[Context: ${intent}]` : script.trim()
    generate({ text: fullText, voiceId, brandId })
  }, [script, voiceId, brandId, selectedTopics, selectedPurpose, generate])

  function toggleTopic(id: string) {
    setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  async function handleGenerateScript() {
    if (!scriptTopic.trim()) return
    setScriptLoading(true)
    try {
      const res  = await fetch('/api/v1/generate/script', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ topic: scriptTopic.trim(), duration: scriptDuration, brandId }),
      })
      const json = await res.json()
      if (json.script) setScript(json.script)
    } finally {
      setScriptLoading(false)
    }
  }

  return (
    <div className="flex bg-app-bg">
      {/* ── Left: controls ─────────────────────────────────────────── */}
      <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
        <div className="space-y-4 pb-4">

          {/* Content Intent */}
          <div className="bg-gray-50 rounded-card p-4">
            <button type="button" onClick={() => setIntentOpen((v) => !v)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Content Intent</span>
                <span className="text-[9px] text-gray-400">— helps AI create targeted content</span>
              </div>
              {intentOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </button>

            {intentOpen && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Topic</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_TIERS.map((cat) => (
                      <button key={cat.id} type="button" onClick={() => toggleTopic(cat.id)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedTopics.includes(cat.id) ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{cat.icon} {cat.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Purpose</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PURPOSES.map((p) => (
                      <button key={p.id} type="button" onClick={() => setSelectedPurpose((v) => v === p.id ? '' : p.id)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedPurpose === p.id ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="bg-gray-50 rounded-card p-4">
            <BrandSelector value={brandId} onChange={setBrandId} />
          </div>

          {/* AI Script Generator */}
          <div className="bg-gray-50 rounded-card p-4">
            <button type="button" onClick={() => setScriptOpen((v) => !v)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-brand-teal" />
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">AI Script Writer</span>
                <span className="text-[9px] text-gray-400">— generate from a topic</span>
              </div>
              {scriptOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </button>

            {scriptOpen && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Topic</label>
                  <input
                    type="text"
                    value={scriptTopic}
                    onChange={(e) => setScriptTopic(e.target.value)}
                    placeholder="e.g. How the SIMRP saves $550 per employee per year"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Target Length</label>
                  <div className="flex gap-1.5">
                    {SCRIPT_DURATIONS.map((d) => (
                      <button key={d.value} type="button" onClick={() => setScriptDuration(d.value)}
                        className={cn('flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors',
                          scriptDuration === d.value ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure'
                        )}>{d.label}</button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!scriptTopic.trim() || scriptLoading}
                  onClick={handleGenerateScript}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-teal text-white text-xs font-semibold hover:bg-brand-navy transition-colors disabled:opacity-50"
                >
                  {scriptLoading ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Writing script…</>
                  ) : (
                    <><Sparkles size={12} />Generate Script</>
                  )}
                </button>
                {script && (
                  <p className="text-[10px] text-brand-teal font-medium">Script generated — edit below as needed</p>
                )}
              </div>
            )}
          </div>

          {/* Script */}
          <div className="bg-gray-50 rounded-card p-4">
            <Textarea
              label="Script"
              placeholder="Enter the text you want read aloud — e.g. 'Did you know that the SIMRP can save your company $550 per employee, per year? With no change to take-home pay...'"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={6}
              maxLength={5000}
              currentLength={script.length}
            />
            <p className="text-[10px] text-gray-400 mt-2">~{Math.ceil(script.split(/\s+/).filter(Boolean).length / 140)} min read · {script.length} chars</p>
          </div>

          {/* Voice */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Voice</p>
            <div className="space-y-1.5">
              {VOICES.map((v) => (
                <button key={v.id} type="button" onClick={() => setVoiceId(v.id)}
                  className={cn('w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all',
                    voiceId === v.id ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-200 hover:border-brand-light'
                  )}
                >
                  <p className={cn('text-xs font-semibold', voiceId === v.id ? 'text-brand-azure' : 'text-brand-navy')}>{v.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{v.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
            <Zap size={11} className="text-brand-teal" />
            <span>{VOICES.find((v) => v.id === voiceId)?.name ?? 'Voice'} · ElevenLabs</span>
          </div>
          <Button className="w-full" size="lg" disabled={!script.trim() || loading} loading={loading} onClick={handleGenerate}>
            Generate Voiceover
          </Button>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: results ─────────────────────────────────────────── */}
      <div className="flex-1 p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-navy">Generating voiceover…</p>
            <p className="text-xs text-gray-400">ElevenLabs is synthesizing your audio</p>
          </div>
        )}

        {!loading && data?.asset && (
          <div className="mb-8 bg-white rounded-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Generated</p>
              <a href={data.asset.url} download className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                <Download size={12} /> Download MP3
              </a>
            </div>
            <audio src={data.asset.url} controls className="w-full" />
          </div>
        )}

        {!loading && !data && recentAudio.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
              <Mic size={26} className="text-brand-orange" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">Your voiceovers appear here</p>
            <p className="text-sm text-gray-400 max-w-xs">Enter a script on the left, pick a voice, and click Generate.</p>
          </div>
        )}

        {recentAudio.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Your Audio Library</p>
            <div className="space-y-3 max-w-2xl">
              {recentAudio.map((a) => (
                <AudioRow key={a.id} audio={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AudioRow({ audio }: { audio: RecentAudio }) {
  const meta = audio.metadata as { text?: string; voiceName?: string } | null
  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-navy truncate">{meta?.text ?? 'Voiceover'}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{meta?.voiceName} · {formatRelativeTime(audio.createdAt)}</p>
        </div>
        <a href={audio.s3Url} download className="text-brand-azure hover:text-brand-navy flex-shrink-0">
          <Download size={14} />
        </a>
      </div>
      <audio src={audio.s3Url} controls className="w-full h-8" style={{ height: '32px' }} />
    </div>
  )
}
