'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Video, Download, Calendar, CheckCircle, XCircle } from 'lucide-react'
import LikenessControls from '@/components/likeness/LikenessControls'
import type { BrandId } from '@/lib/brands'
import type { HeyGenAvatar, HeyGenVoice, AspectRatio } from '@/services/likeness'

interface Job { assetId: string; videoId: string }
type PollStatus = 'pending' | 'processing' | 'waiting' | 'completed' | 'failed'

export default function LikenessClient() {
  const router = useRouter()

  // Asset lists
  const [avatars,       setAvatars]       = useState<HeyGenAvatar[]>([])
  const [voices,        setVoices]        = useState<HeyGenVoice[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)

  // Controls state
  const [avatarId,    setAvatarId]    = useState('')
  const [voiceId,     setVoiceId]     = useState('')
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
  const [script,      setScript]      = useState('')
  const [brandId,     setBrandId]     = useState<BrandId>('lhcapital')

  // Generation state
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [job,         setJob]         = useState<Job | null>(null)
  const [pollStatus,  setPollStatus]  = useState<PollStatus | null>(null)
  const [resultUrl,   setResultUrl]   = useState<string | null>(null)
  const [pollError,   setPollError]   = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load avatars + voices
  useEffect(() => {
    fetch('/api/v1/generate/likeness/avatars')
      .then((r) => r.json())
      .then((d) => { setAvatars(d.avatars ?? []); setVoices(d.voices ?? []) })
      .catch(() => {})
      .finally(() => setLoadingAssets(false))
  }, [])

  // Pre-fill script if arriving from Writer ("audioDraft" key with script)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('livenessDraft')
      if (!raw) return
      localStorage.removeItem('livenessDraft')
      const draft = JSON.parse(raw) as { script?: string }
      if (draft.script) setScript(draft.script.slice(0, 5000))
    } catch { /* ignore */ }
  }, [])

  // Polling
  const startPolling = useCallback((j: Job) => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/v1/generate/likeness/status?assetId=${j.assetId}&videoId=${j.videoId}`)
        const data = await res.json()
        setPollStatus(data.status)
        if (data.status === 'completed') {
          setResultUrl(data.url)
          clearInterval(pollRef.current!)
        } else if (data.status === 'failed') {
          setPollError(data.error ?? 'Generation failed')
          clearInterval(pollRef.current!)
        }
      } catch {
        // transient network error — keep polling
      }
    }, 5000)
  }, [])

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  async function handleGenerate() {
    setSubmitting(true); setSubmitError(null); setJob(null)
    setResultUrl(null);  setPollStatus(null);  setPollError(null)
    try {
      const res  = await fetch('/api/v1/generate/likeness', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ script, avatarId, voiceId, aspectRatio, brandId }),
      })
      const data = await res.json()
      if (!res.ok) { setSubmitError(data.message ?? 'Submission failed'); return }
      const j: Job = { assetId: data.assetId, videoId: data.videoId }
      setJob(j); setPollStatus('pending')
      startPolling(j)
    } catch {
      setSubmitError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const canGenerate = !!avatarId && !!voiceId && script.trim().length > 0

  return (
    <div className="flex bg-app-bg">
      <LikenessControls
        avatars={avatars} voices={voices} loadingAssets={loadingAssets}
        avatarId={avatarId}       onAvatarId={setAvatarId}
        voiceId={voiceId}         onVoiceId={setVoiceId}
        aspectRatio={aspectRatio} onAspectRatio={setAspectRatio}
        script={script}           onScript={setScript}
        brandId={brandId}         onBrandId={setBrandId}
        canGenerate={canGenerate} loading={submitting}
        error={submitError}       onGenerate={handleGenerate}
      />

      <div className="flex-1 p-6 overflow-y-auto">

        {/* Polling status */}
        {job && !resultUrl && !pollError && (
          <div className="mb-6 bg-white rounded-card shadow-card p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-10 h-10 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="font-semibold text-brand-navy">Rendering your video…</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Status: <span className="capitalize font-medium">{pollStatus ?? 'pending'}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">HeyGen typically takes 2–5 minutes. This page polls automatically.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {pollError && (
          <div className="mb-6 bg-white rounded-card shadow-card p-5 flex items-start gap-3">
            <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Generation failed</p>
              <p className="text-xs text-gray-500 mt-0.5">{pollError}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {resultUrl && (
          <div className="mb-6 bg-white rounded-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Generated</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { localStorage.setItem('schedulerDraft', JSON.stringify({ caption: script.trim() })); router.push('/scheduler') }}
                  className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline"
                >
                  <Calendar size={12} /> Schedule
                </button>
                <a href={resultUrl} download target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                  <Download size={12} /> Download
                </a>
              </div>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video src={resultUrl} controls className="w-full rounded-lg max-h-[480px] bg-black" />
          </div>
        )}

        {/* Empty state */}
        {!job && !resultUrl && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-azure/10 flex items-center justify-center mb-4">
              <Video size={26} className="text-brand-azure" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">Your likeness video appears here</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Select an avatar, choose a voice, write a script, and generate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
