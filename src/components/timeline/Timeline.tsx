import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'

export type TimelineVariant =
  | 'muted'
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'
  /** @deprecated use `'muted'` instead — removed in v1.0 */
  | 'default'

export interface TimelineItem {
  /** Timestamp or date label */
  date?: string
  /** Event title */
  title: string
  /** Event description */
  description?: ReactNode
  /** Custom icon */
  icon?: ReactNode
  /** Dot color variant (`'default'` is a deprecated alias for `'muted'`) */
  variant?: TimelineVariant
}

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  /** Timeline items */
  items: TimelineItem[]
  /** Size */
  size?: 'sm' | 'md'
}

const variantStyles: Record<string, string> = {
  muted: 'bg-muted-foreground',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  info: 'bg-info',
}

/** Vertical timeline displaying a sequence of events with dots and connecting lines. */
export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ items, size = 'md', className, ...props }, ref) => {
    const dotSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
    const iconSize = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          if (item.variant === 'default') {
            warnDeprecated('Timeline', 'variant="default"', 'variant="muted"')
          }
          const variant = item.variant === 'default' ? 'muted' : (item.variant ?? 'muted')

          return (
            <div key={index} className="flex gap-4">
              {/* Left: dot + line */}
              <div className="flex flex-col items-center">
                {item.icon ? (
                  <div
                    className={cn(
                      'text-primary-foreground flex shrink-0 items-center justify-center rounded-full',
                      iconSize,
                      variantStyles[variant]
                    )}
                  >
                    {item.icon}
                  </div>
                ) : (
                  <div
                    className={cn('mt-1.5 shrink-0 rounded-full', dotSize, variantStyles[variant])}
                  />
                )}
                {!isLast && <div className="bg-border min-h-[16px] w-px flex-1" />}
              </div>

              {/* Right: content */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                {item.date && <p className="text-muted-foreground mb-0.5 text-xs">{item.date}</p>}
                <p
                  className={cn(
                    'leading-tight font-medium',
                    size === 'sm' ? 'text-sm' : 'text-base'
                  )}
                >
                  {item.title}
                </p>
                {item.description && (
                  <div className="text-muted-foreground mt-1 text-sm">{item.description}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)

Timeline.displayName = 'Timeline'
