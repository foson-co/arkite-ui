import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'
import { useLocale } from '../../locale'

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'
  /** @deprecated use `'destructive'` instead — removed in v1.0 */
  | 'error'

type ResolvedProgressVariant = Exclude<ProgressVariant, 'error'>

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number
  /** Maximum value */
  max?: number
  /** Progress size */
  size?: ProgressSize
  /** Progress variant */
  variant?: ProgressVariant
  /** Show percentage label */
  showLabel?: boolean
  /** Indeterminate progress (animated) */
  indeterminate?: boolean
  /** Striped style */
  striped?: boolean
  /** Animated stripes */
  animated?: boolean
  /** Accessible label for the progress bar */
  'aria-label'?: string
}

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const variantStyles: Record<ResolvedProgressVariant, string> = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
}

/** Horizontal progress bar with determinate, indeterminate, and striped modes. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      indeterminate = false,
      striped = false,
      animated = false,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    if (variant === 'error') {
      warnDeprecated('Progress', 'variant="error"', 'variant="destructive"')
    }
    const resolvedVariant: ResolvedProgressVariant = variant === 'error' ? 'destructive' : variant
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div className={cn('w-full', className)}>
        {showLabel && (
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">{locale.progress.label}</span>
            <span className="font-medium">{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={ariaLabel ?? locale.progress.label}
          className={cn('bg-muted w-full overflow-hidden rounded-full', sizeStyles[size])}
          {...props}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              variantStyles[resolvedVariant],
              indeterminate && 'animate-progress-indeterminate',
              striped && 'bg-stripes',
              animated && striped && 'animate-stripes'
            )}
            style={{
              width: indeterminate ? '50%' : `${percentage}%`,
            }}
          />
        </div>
      </div>
    )
  }
)

Progress.displayName = 'Progress'

// Circular Progress
export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number
  /** Maximum value */
  max?: number
  /** Diameter in pixels */
  diameter?: number
  /** @deprecated use `diameter` instead — removed in v1.0 */
  size?: number
  /** Stroke width */
  strokeWidth?: number
  /** Progress variant */
  variant?: ProgressVariant
  /** Show percentage label */
  showLabel?: boolean
  /** Indeterminate progress */
  indeterminate?: boolean
  /** Accessible label for the progress bar */
  'aria-label'?: string
}

/** SVG-based circular progress indicator with optional percentage label. */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      diameter,
      size,
      strokeWidth = 4,
      variant = 'default',
      showLabel = false,
      indeterminate = false,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    if (variant === 'error') {
      warnDeprecated('CircularProgress', 'variant="error"', 'variant="destructive"')
    }
    if (size !== undefined) {
      warnDeprecated('CircularProgress', 'size', 'diameter')
    }
    const resolvedVariant: ResolvedProgressVariant = variant === 'error' ? 'destructive' : variant
    const resolvedDiameter = diameter ?? size ?? 48
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const radius = (resolvedDiameter - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    const strokeColor = {
      default: 'stroke-primary',
      success: 'stroke-success',
      warning: 'stroke-warning',
      destructive: 'stroke-destructive',
    }[resolvedVariant]

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel ?? locale.progress.label}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: resolvedDiameter, height: resolvedDiameter }}
        {...props}
      >
        <svg
          className={cn('-rotate-90 transform', indeterminate && 'animate-spin')}
          width={resolvedDiameter}
          height={resolvedDiameter}
        >
          {/* Background circle */}
          <circle
            className="stroke-muted"
            fill="none"
            strokeWidth={strokeWidth}
            r={radius}
            cx={resolvedDiameter / 2}
            cy={resolvedDiameter / 2}
          />
          {/* Progress circle */}
          <circle
            className={cn('transition-all duration-300', strokeColor)}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            r={radius}
            cx={resolvedDiameter / 2}
            cy={resolvedDiameter / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: indeterminate ? circumference * 0.75 : offset,
            }}
          />
        </svg>
        {showLabel && !indeterminate && (
          <span className="absolute text-xs font-medium">{Math.round(percentage)}%</span>
        )}
      </div>
    )
  }
)

CircularProgress.displayName = 'CircularProgress'
