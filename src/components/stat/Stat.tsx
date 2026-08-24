import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export type StatTrend = 'up' | 'down' | 'neutral'

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  /** Stat label */
  label: ReactNode
  /** Stat value */
  value: ReactNode
  /** Change value (e.g., "+12%") */
  change?: ReactNode
  /** Trend direction */
  trend?: StatTrend
  /** Helper text */
  helpText?: ReactNode
  /** Icon */
  icon?: ReactNode
  /** Loading state */
  loading?: boolean
}

const trendStyles: Record<StatTrend, string> = {
  up: 'text-success-soft-foreground dark:text-success',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
}

const trendIcons: Record<StatTrend, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
}

/** Displays a key metric with optional trend indicator and help text. */
export const Stat = forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, change, trend, helpText, icon, loading = false, ...props }, ref) => {
    const TrendIcon = trend ? trendIcons[trend] : null

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm font-medium">{label}</span>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="bg-muted h-8 w-24 animate-pulse rounded" />
            <div className="bg-muted h-4 w-16 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>

            {(change || helpText) && (
              <div className="flex items-center gap-2 text-sm">
                {change && trend && TrendIcon && (
                  <span className={cn('flex items-center gap-1', trendStyles[trend])}>
                    <TrendIcon className="h-4 w-4" />
                    {change}
                  </span>
                )}
                {change && !trend && <span className="text-muted-foreground">{change}</span>}
                {helpText && <span className="text-muted-foreground">{helpText}</span>}
              </div>
            )}
          </>
        )}
      </div>
    )
  }
)

Stat.displayName = 'Stat'

// Stat Card variant
export interface StatCardProps extends StatProps {
  /** Card variant */
  variant?: 'default' | 'bordered' | 'filled'
}

/** Stat wrapped in a styled card container. */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-card',
      bordered: 'bg-card border',
      filled: 'bg-muted/50',
    }

    return (
      <div ref={ref} className={cn('rounded-lg p-6', variantStyles[variant], className)}>
        <Stat {...props} />
      </div>
    )
  }
)

StatCard.displayName = 'StatCard'

// Stat Group for multiple stats
export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns */
  columns?: 2 | 3 | 4
}

/** Responsive grid container for laying out multiple Stat components. */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(
  ({ className, columns = 4, children, ...props }, ref) => {
    const columnStyles = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }

    return (
      <div ref={ref} className={cn('grid gap-4', columnStyles[columns], className)} {...props}>
        {children}
      </div>
    )
  }
)

StatGroup.displayName = 'StatGroup'
