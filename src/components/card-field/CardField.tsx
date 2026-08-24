import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

// ---------------------------------------------------------------------------
// CardField
// ---------------------------------------------------------------------------

export interface CardFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field label displayed above the value. */
  label: string
  /** Field value rendered as text. Use `children` for custom rendering. */
  value?: ReactNode
  /** Custom content rendered instead of `value`. */
  children?: ReactNode
}

/**
 * Label-value pair for detail pages.
 *
 * Renders a small muted label above the value. When neither `value` nor
 * `children` is provided, a dash placeholder is shown.
 */
export const CardField = forwardRef<HTMLDivElement, CardFieldProps>(
  ({ className, label, value, children, ...props }, ref) => {
    const content = children ?? value ?? '—'

    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        <p className="text-muted-foreground text-sm">{label}</p>
        <div className="text-foreground text-sm font-medium">{content}</div>
      </div>
    )
  }
)

CardField.displayName = 'CardField'

// ---------------------------------------------------------------------------
// CardGrid
// ---------------------------------------------------------------------------

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns at `sm` breakpoint and above. Defaults to `2`. */
  columns?: 1 | 2 | 3 | 4
}

const columnStyles: Record<1 | 2 | 3 | 4, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
}

/**
 * Responsive grid layout for `CardField` items.
 *
 * Always renders a single column on mobile and expands to the configured
 * number of columns at the `sm` breakpoint.
 */
export const CardGrid = forwardRef<HTMLDivElement, CardGridProps>(
  ({ className, columns = 2, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid grid-cols-1 gap-4', columnStyles[columns], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardGrid.displayName = 'CardGrid'
