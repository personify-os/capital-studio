'use client'

import { createContext, useContext } from 'react'

interface SelectionCtx {
  selected: (id: string) => boolean
  toggle:   (id: string) => void
}

export const SelectionContext = createContext<SelectionCtx | null>(null)

export function useSelection() {
  return useContext(SelectionContext)
}

// Drop-in checkbox each card/row renders; renders nothing if no provider.
export function SelectCheckbox({ id, className }: { id: string; className?: string }) {
  const sel = useSelection()
  if (!sel) return null
  return (
    <input
      type="checkbox"
      checked={sel.selected(id)}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => { e.stopPropagation(); sel.toggle(id) }}
      aria-label="Select asset"
      className={
        className ??
        'h-4 w-4 rounded border-gray-300 text-brand-azure focus:ring-brand-azure cursor-pointer'
      }
    />
  )
}
