'use client'

import { useState, useCallback } from 'react'

interface GenerateOptions<TInput, TOutput> {
  endpoint: string
  onSuccess?: (result: TOutput) => void
}

interface GenerateState<TOutput> {
  data:     TOutput | null
  loading:  boolean
  error:    string | null
}

/**
 * Shared generation hook used by all creative modules.
 * Handles loading/error state, JSON parsing, and success callbacks.
 * Each module defines its own TInput/TOutput shapes.
 */
export function useGenerate<TInput, TOutput>({ endpoint, onSuccess }: GenerateOptions<TInput, TOutput>) {
  const [state, setState] = useState<GenerateState<TOutput>>({
    data:    null,
    loading: false,
    error:   null,
  })

  const generate = useCallback(async (input: TInput) => {
    setState({ data: null, loading: true, error: null })
    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(input),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setState((s) => ({ ...s, loading: false, error: err.message ?? 'Generation failed.' }))
        return
      }

      const data: TOutput = await res.json()
      setState({ data, loading: false, error: null })
      onSuccess?.(data)
    } catch {
      setState((s) => ({ ...s, loading: false, error: 'Network error. Please try again.' }))
    }
  }, [endpoint, onSuccess])

  const reset = useCallback(() => setState({ data: null, loading: false, error: null }), [])

  return { ...state, generate, reset }
}
