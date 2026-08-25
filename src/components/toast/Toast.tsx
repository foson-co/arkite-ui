import { forwardRef, isValidElement, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { useToastStore } from './toast-store'
import { toast as toastApi, type ToastFromErrorOptions, type ToastOptions } from './toast-api'

export type ToastVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive'
  /** @deprecated use `'destructive'` instead — removed in v1.0 */
  | 'error'

type ResolvedToastVariant = Exclude<ToastVariant, 'error'>
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

export interface ToastData {
  id: string
  title?: ReactNode
  description?: ReactNode
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  /** Show a loading spinner instead of the variant icon. */
  isLoading?: boolean
}

export { useToastStore }

const variantStyles: Record<ResolvedToastVariant, string> = {
  default: 'bg-card border-border',
  success: 'bg-success-soft border-success-border',
  destructive: 'bg-destructive-soft border-destructive-border',
  warning: 'bg-warning-soft border-warning-border',
  info: 'bg-info-soft border-info-border',
}

const variantTextStyles: Record<ResolvedToastVariant, string> = {
  default: 'text-foreground',
  success: 'text-success-soft-foreground',
  destructive: 'text-destructive-soft-foreground',
  warning: 'text-warning-soft-foreground',
  info: 'text-info-soft-foreground',
}

const iconMap: Record<ResolvedToastVariant, typeof Info | null> = {
  default: null,
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const positionStyles: Record<ToastPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

export interface ToastProps extends ToastData {
  onClose: () => void
  className?: string
}

/** Individual toast notification with auto-dismiss and variant styling. */
export function Toast({
  id: _id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
  isLoading,
  onClose,
  className,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  if (variant === 'error') {
    warnDeprecated('Toast', 'variant="error"', 'variant="destructive"')
  }
  const resolvedVariant: ResolvedToastVariant = variant === 'error' ? 'destructive' : variant
  const IconComponent = isLoading ? null : iconMap[resolvedVariant]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(onClose, 200)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200',
        variantStyles[resolvedVariant],
        variantTextStyles[resolvedVariant],
        isExiting ? 'translate-x-2 opacity-0' : 'translate-x-0 opacity-100',
        className
      )}
    >
      {isLoading && (
        <div className="shrink-0">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      {IconComponent && (
        <div className="shrink-0">
          <IconComponent className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 space-y-1">
        {title && <p className="leading-none font-medium">{title}</p>}
        {description && <p className="text-sm opacity-90">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium underline hover:no-underline"
          >
            {action.label}
          </button>
        )}
      </div>
      <button
        onClick={handleClose}
        className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export interface ToastContainerProps {
  position?: ToastPosition
  className?: string
}

/** Fixed-position container that renders active toasts from the toast store. */
export const ToastContainer = forwardRef<HTMLDivElement, ToastContainerProps>(
  function ToastContainer({ position = 'top-right', className }, ref) {
    const { toasts, dismissToast } = useToastStore()

    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-none fixed z-50 flex flex-col gap-2',
          positionStyles[position],
          className
        )}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => dismissToast(toast.id)} />
        ))}
      </div>
    )
  }
)

type ShorthandOptions = ToastOptions | ReactNode

/**
 * Back-compat: `useToast().success(title, description)` (legacy) is treated as
 * `success(title, { description })` with a dev-only deprecation warning.
 */
function resolveShorthandOptions(
  method: string,
  options?: ShorthandOptions
): ToastOptions | undefined {
  if (options == null) return undefined
  if (typeof options === 'object' && !isValidElement(options) && !Array.isArray(options)) {
    return options as ToastOptions
  }
  warnDeprecated('useToast', `${method}(title, description)`, `${method}(title, options)`)
  return { description: options as ReactNode }
}

// Hook for using toasts — thin wrapper over the imperative `toast` API (same store)
export function useToast() {
  const toast = useMemo(() => {
    const t = Object.assign(
      (options: Omit<ToastData, 'id'>) => useToastStore.getState().addToast(options),
      {
        show: (title: ReactNode, options?: ShorthandOptions) =>
          toastApi.show(title, resolveShorthandOptions('show', options)),
        success: (title: ReactNode, options?: ShorthandOptions) =>
          toastApi.success(title, resolveShorthandOptions('success', options)),
        error: (title: ReactNode, options?: ShorthandOptions) =>
          toastApi.error(title, resolveShorthandOptions('error', options)),
        warning: (title: ReactNode, options?: ShorthandOptions) =>
          toastApi.warning(title, resolveShorthandOptions('warning', options)),
        info: (title: ReactNode, options?: ShorthandOptions) =>
          toastApi.info(title, resolveShorthandOptions('info', options)),
        loading: (title: ReactNode, options?: ToastOptions) => toastApi.loading(title, options),
        fromError: (err: unknown, options?: ToastFromErrorOptions) =>
          toastApi.fromError(err, options),
        dismiss: (id: string) => toastApi.dismiss(id),
        dismissAll: () => toastApi.dismissAll(),
        /** @deprecated Use `dismissAll()` instead — removed in v1.0. */
        clear: () => {
          warnDeprecated('useToast', 'clear()', 'dismissAll()')
          toastApi.dismissAll()
        },
      }
    )
    return t
  }, [])

  return toast
}
