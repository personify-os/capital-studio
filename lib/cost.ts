/**
 * Estimated cost per generation call — used to populate asset metadata.cost
 * for display in the Analytics page.
 * Values are approximate USD estimates as of 2026-Q1.
 */

type ModelCost = { perCall: number }

const MODEL_COSTS: Record<string, ModelCost> = {
  // Image models (per generation)
  'flux-pro':             { perCall: 0.055 },
  'flux-schnell':         { perCall: 0.003 },
  'fal-flux':             { perCall: 0.003 },  // Flux Schnell via fal.ai
  'flux-dev':             { perCall: 0.025 },
  'flux-realism':         { perCall: 0.035 },
  'ideogram-v3':          { perCall: 0.08  },
  'recraft-v3':           { perCall: 0.04  },
  'imagen-4':             { perCall: 0.04  },
  'dall-e-3':             { perCall: 0.04  },
  'seedream-v3':          { perCall: 0.03  },
  'realistic-vision':     { perCall: 0.015 },
  'nano-banana-2':        { perCall: 0.035 },
  'nano-banana-pro':      { perCall: 0.055 },
  'gemini-flash':         { perCall: 0.03  },
  'gemini-flash-pro':     { perCall: 0.05  },

  // Motion (image-to-video via Kling)
  'kling-motion':         { perCall: 0.22  },

  // Video models (per generation)
  'kling-3.0':            { perCall: 0.28  },
  'kling-2.1':            { perCall: 0.22  },
  'veo-3':                { perCall: 0.50  },
  'minimax':              { perCall: 0.18  },
  'hunyuan':              { perCall: 0.12  },
  'wan':                  { perCall: 0.08  },

  // Audio/Voice
  'eleven-multilingual-v2': { perCall: 0.03 },
  'eleven-turbo-v2':       { perCall: 0.01 },

  // Music
  'chirp-v4':             { perCall: 0.10  },
  'chirp-v3-5':           { perCall: 0.08  },
  'chirp-v3':             { perCall: 0.06  },

  // Likeness Video (HeyGen — per minute of video)
  'heygen-avatar':          { perCall: 0.10  },

  // Text (Claude — per graphic/caption call, rough estimate)
  'claude-sonnet-4-6':    { perCall: 0.02  },
  'claude-haiku-4-5-20251001': { perCall: 0.005 },
}

export function estimateCost(model: string): number {
  return MODEL_COSTS[model]?.perCall ?? 0
}
