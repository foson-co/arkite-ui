import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ArkiteLocale, PartialArkiteLocale } from './types'
import { enUS } from './en'

const LocaleContext = createContext<ArkiteLocale>(enUS)

/**
 * Merge a (possibly partial) locale over the English defaults, one
 * section deep — matching PartialArkiteLocale's shape.
 */
function mergeLocale(override?: PartialArkiteLocale): ArkiteLocale {
  if (!override) return enUS
  const merged = { ...enUS } as Record<string, unknown>
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue
    const base = (enUS as unknown as Record<string, unknown>)[key]
    merged[key] =
      typeof value === 'object' && !Array.isArray(value) ? { ...(base as object), ...value } : value
  }
  return merged as unknown as ArkiteLocale
}

export interface LocaleProviderProps {
  /** Full or partial locale — missing keys fall back to English. */
  locale?: PartialArkiteLocale
  children: ReactNode
}

/**
 * Provides component strings (placeholders, empty states, aria-labels)
 * for the whole subtree. Without a provider everything renders in
 * English; explicit component props always win over locale values.
 *
 * @example
 * ```tsx
 * import { LocaleProvider, zhTW } from '@arkite-ui/core'
 *
 * <LocaleProvider locale={zhTW}>
 *   <App />
 * </LocaleProvider>
 * ```
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const value = useMemo(() => mergeLocale(locale), [locale])
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

/** Read the active locale (English defaults when no provider is mounted). */
export function useLocale(): ArkiteLocale {
  return useContext(LocaleContext)
}
