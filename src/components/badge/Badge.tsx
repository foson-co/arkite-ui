import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline'
  | 'info'
  | 'count'

export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge style variant */
  variant?: BadgeVariant
  /** Badge size */
  size?: BadgeSize
  /** When `children` is a number (or numeric string) greater than `max`, render as `{max}+` (e.g., 150 with max=99 → "99+"). Non-numeric children pass through unchanged. */
  max?: number
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-border text-foreground bg-transparent',
  info: 'bg-info-soft text-info-soft-foreground',
  count: 'bg-muted text-muted-foreground tabular-nums',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-0.5 text-xs leading-tight',
  md: 'px-3 py-1 text-sm leading-snug',
}

/** Small inline label for status, categories, or counts with multiple color variants. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', max, children, ...props }, ref) => {
    const displayed = clampNumericChildren(children, max)
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium transition-colors',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {displayed}
      </span>
    )
  }
)

function clampNumericChildren(children: BadgeProps['children'], max: number | undefined) {
  if (typeof max !== 'number') return children
  const num =
    typeof children === 'number'
      ? children
      : typeof children === 'string' && /^-?\d+$/.test(children)
        ? Number(children)
        : null
  if (num === null || num <= max) return children
  return `${max}+`
}

Badge.displayName = 'Badge'
