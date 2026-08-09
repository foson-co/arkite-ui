// Replaced statically by bundlers; declared here since the lib tsconfig has no node types.
declare const process: { env: { NODE_ENV?: string } }

const warned = new Set<string>()

/**
 * Dev-only, once-per-key deprecation warning for renamed props.
 * Aliases warned here are removed in v1.0.
 */
export function warnDeprecated(component: string, oldName: string, newName: string) {
  if (process.env.NODE_ENV === 'production') return
  const key = `${component}.${oldName}`
  if (warned.has(key)) return
  warned.add(key)
  console.warn(
    `[arkite-ui] ${component}: \`${oldName}\` is deprecated and will be removed in v1.0 — use \`${newName}\` instead.`
  )
}

/**
 * Clears the once-per-key ledger. Test-only — the dedupe is what keeps a
 * warning from repeating on every render, so each test that asserts on a
 * warning needs a clean slate. Not exported from the package entrypoint.
 */
export function __resetWarnings() {
  warned.clear()
}

/** Dev-only, once-per-key warning for incorrect prop combinations. */
export function warnUsage(component: string, key: string, message: string) {
  if (process.env.NODE_ENV === 'production') return
  const fullKey = `${component}.${key}`
  if (warned.has(fullKey)) return
  warned.add(fullKey)
  console.warn(`[arkite-ui] ${component}: ${message}`)
}
