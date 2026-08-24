import { Component, type ErrorInfo, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Button } from '../button/Button'
import { useLocale } from '../../locale'

export interface ErrorBoundaryProps {
  /** Content to render */
  children: ReactNode
  /** Custom fallback UI (receives error and reset function) */
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode)
  /** Error callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Additional class name for default fallback */
  className?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

/** React error boundary that catches render errors and displays a fallback UI. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { children, fallback, className } = this.props

    if (!error) return children

    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.reset })
    }

    if (fallback) return fallback

    return <DefaultErrorFallback error={error} reset={this.reset} className={className} />
  }
}

/** Default fallback UI — a function component so it can read the locale context. */
function DefaultErrorFallback({
  error,
  reset,
  className,
}: {
  error: Error
  reset: () => void
  className?: string
}) {
  const locale = useLocale()

  return (
    <div
      className={cn(
        'border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-4 rounded-lg border p-8 text-center',
        className
      )}
      role="alert"
    >
      <AlertTriangleIcon className="text-destructive h-10 w-10" />
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{locale.emptyState.errorTitle}</h3>
        <p className="text-muted-foreground max-w-md text-sm">
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        {locale.emptyState.retryLabel}
      </Button>
    </div>
  )
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
