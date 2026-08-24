import { forwardRef, type ReactNode, type SVGAttributes } from 'react'
import { cn } from '../../utils/cn'

export type SparklineTrend = 'auto' | 'up' | 'down' | 'neutral'

export interface SparklineProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'width' | 'height' | 'color'
> {
  /** Data points to plot, left to right (null/undefined treated as no data) */
  data: number[] | null | undefined
  /** SVG width in pixels */
  width?: number
  /** SVG height in pixels */
  height?: number
  /** Line stroke width */
  strokeWidth?: number
  /** Explicit stroke color (any CSS color); overrides trend coloring */
  color?: string
  /** Trend coloring — 'auto' compares last vs first value */
  trend?: SparklineTrend
  /**
   * Rendered when there are fewer than 2 data points.
   * `true` draws a dashed neutral line; a ReactNode replaces the output entirely.
   * Without it, empty data renders nothing and a single point renders a dot.
   */
  placeholder?: boolean | ReactNode
}

const trendStyles: Record<Exclude<SparklineTrend, 'auto'>, string> = {
  up: 'text-success',
  down: 'text-destructive',
  neutral: 'text-muted-foreground',
}

function resolveTrend(data: number[], trend: SparklineTrend): Exclude<SparklineTrend, 'auto'> {
  if (trend !== 'auto') return trend
  if (data.length < 2) return 'neutral'
  const first = data[0]
  const last = data[data.length - 1]
  if (last > first) return 'up'
  if (last < first) return 'down'
  return 'neutral'
}

/** Pure SVG polyline mini trend chart, colored by trend direction. */
export const Sparkline = forwardRef<SVGSVGElement, SparklineProps>(
  (
    {
      data,
      width = 80,
      height = 24,
      strokeWidth = 1.5,
      color,
      trend = 'auto',
      placeholder,
      className,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const values = data ?? []

    if (values.length < 2 && placeholder != null && placeholder !== false) {
      if (placeholder !== true) return <>{placeholder}</>
      const pad = strokeWidth
      return (
        <svg
          ref={ref}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden
          className={cn('text-border shrink-0', className)}
          {...props}
        >
          <line
            x1={pad}
            y1={height / 2}
            x2={width - pad}
            y2={height / 2}
            stroke="currentColor"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        </svg>
      )
    }

    if (values.length === 0) return null

    // Inset so the stroke never clips at the edges
    const pad = strokeWidth
    const innerWidth = width - pad * 2
    const innerHeight = height - pad * 2

    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min

    const points = values
      .map((value, index) => {
        // Single point renders as a flat line; equal values center vertically
        const x =
          values.length === 1
            ? pad + innerWidth / 2
            : pad + (innerWidth * index) / (values.length - 1)
        const y = span === 0 ? height / 2 : pad + innerHeight * (1 - (value - min) / span)
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
        className={cn('shrink-0', !color && trendStyles[resolveTrend(values, trend)], className)}
        {...props}
      >
        {values.length === 1 ? (
          <circle cx={width / 2} cy={height / 2} r={strokeWidth} fill={color ?? 'currentColor'} />
        ) : (
          <polyline
            points={points}
            fill="none"
            stroke={color ?? 'currentColor'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </svg>
    )
  }
)

Sparkline.displayName = 'Sparkline'
