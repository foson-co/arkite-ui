import type { ReactNode } from 'react'
import { useToastStore } from './toast-store'
import type { ToastData } from './Toast'

export type ToastOptions = Partial<Omit<ToastData, 'id' | 'title' | 'variant'>>

function show(title: ReactNode, options?: Partial<Omit<ToastData, 'id' | 'title'>>): string {
  return useToastStore.getState().addToast({
    variant: 'default',
    title,
    duration: 5000,
    ...options,
  })
}

function success(title: ReactNode, options?: ToastOptions): string {
  return show(title, { ...options, variant: 'success' })
}

function error(title: ReactNode, options?: ToastOptions): string {
  return show(title, { ...options, variant: 'destructive' })
}

function warning(title: ReactNode, options?: ToastOptions): string {
  return show(title, { ...options, variant: 'warning' })
}

function info(title: ReactNode, options?: ToastOptions): string {
  return show(title, { ...options, variant: 'info' })
}

function loading(title: ReactNode, options?: ToastOptions): string {
  // Loading toasts show a spinner and stay until dismissed (duration can be overridden).
  return show(title, { duration: 0, ...options, isLoading: true })
}

function dismiss(id: string): void {
  useToastStore.getState().dismissToast(id)
}

function dismissAll(): void {
  useToastStore.getState().dismissAllToasts()
}

// ── fromError ──────────────────────────────────────────────────────

export interface ToastConfig {
  /**
   * App-level error → message parser used by `toast.fromError`. This is where
   * domain knowledge (API envelopes, axios shapes, i18n) belongs — the
   * component library never parses domain errors itself. Must be pure: under
   * SSR every request shares the same registration.
   */
  formatError?: (error: unknown) => ReactNode
}

let toastConfig: ToastConfig = {}

/**
 * One-time app-level wiring for `toast.fromError`. Call once at startup:
 *
 * ```ts
 * import { getErrorMessage } from '@arkite/utils' // or your own parser
 * toast.configure({ formatError: getErrorMessage })
 * ```
 *
 * Module-level by design: the imperative `toast` also runs outside React
 * (event handlers, stores), so configuration cannot live in a provider.
 */
function configure(next: ToastConfig): void {
  toastConfig = { ...toastConfig, ...next }
}

export interface ToastFromErrorOptions extends ToastOptions {
  /** Toast title (e.g. `'儲存失敗'`); the parsed error message becomes the description */
  prefix?: ReactNode
}

/**
 * Derive a human-readable message without inventing copy: the registered
 * `formatError` first; otherwise only zero-knowledge JS-level fallbacks.
 * Returns `undefined` when nothing meaningful can be shown (e.g. a plain
 * object) — never locale strings, so this API stays out of the i18n system.
 */
function deriveErrorMessage(error: unknown): ReactNode | undefined {
  if (toastConfig.formatError) {
    try {
      const formatted = toastConfig.formatError(error)
      if (formatted != null && formatted !== '') return formatted
    } catch {
      // A broken formatter must not turn error display into a second crash —
      // fall through to the zero-knowledge fallbacks.
    }
  }
  if (error instanceof Error && error.message !== '') return error.message
  if (typeof error === 'string' && error !== '') return error
  return undefined
}

/**
 * Error-to-toast shorthand for `catch` blocks:
 *
 * ```ts
 * catch (err) {
 *   toast.fromError(err, { prefix: '儲存失敗' })
 * }
 * ```
 *
 * Renders a destructive toast with `prefix` as the title and the parsed error
 * message as the description. Parsing is app-supplied via
 * `toast.configure({ formatError })`; unconfigured, only `Error#message` /
 * plain strings are used. When no message can be derived, the prefix alone is
 * shown (or `String(error)` if there is no prefix either).
 *
 * Deliberately out of scope (app-layer concerns, keep them there):
 * error reporting/logging hooks (Sentry, console) and burst dedupe.
 */
function fromError(err: unknown, options?: ToastFromErrorOptions): string {
  const { prefix, ...rest } = options ?? {}
  const message = deriveErrorMessage(err)
  if (prefix != null) {
    return error(prefix, message == null ? rest : { description: message, ...rest })
  }
  return error(message ?? String(err), rest)
}

export const toast = {
  show,
  success,
  error,
  warning,
  info,
  loading,
  fromError,
  configure,
  dismiss,
  dismissAll,
}
