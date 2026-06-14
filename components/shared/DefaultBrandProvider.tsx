'use client'

import { createContext, useContext } from 'react'
import type { BrandId } from '@/lib/brands'

const DefaultBrandContext = createContext<BrandId>('lhcapital')

export function DefaultBrandProvider({ value, children }: { value: BrandId; children: React.ReactNode }) {
  return <DefaultBrandContext.Provider value={value}>{children}</DefaultBrandContext.Provider>
}

/** The tenant's default brand, used to pre-select the brand in generation modules. */
export function useDefaultBrand(): BrandId {
  return useContext(DefaultBrandContext)
}
