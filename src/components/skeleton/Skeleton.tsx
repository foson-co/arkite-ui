import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant */
  variant?: 'default' | 'circular' | 'rounded' | 'text'
  /** Animation style */
  animation?: 'pulse' | 'wave' | 'none'
  /** Width */
  width?: string | number
  /** Height */
  height?: string | number
}

/** Animated loading placeholder with pulse or wave animation. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, variant = 'default', animation = 'pulse', width, height, style, ...props },
    ref
  ) => {
    const variantStyles = {
      default: 'rounded-md',
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      text: 'rounded h-4',
    }

    const animationStyles = {
      pulse: 'animate-pulse',
      wave: 'animate-skeleton-wave',
      none: '',
    }

    return (
      <div
        ref={ref}
        className={cn('bg-muted', variantStyles[variant], animationStyles[animation], className)}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          ...style,
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// Pre-built skeleton patterns
export interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  /** Number of lines */
  lines?: number
  /** Line spacing */
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingStyles = {
  sm: 'space-y-1',
  md: 'space-y-2',
  lg: 'space-y-3',
}

/** Renders multiple skeleton lines to simulate a block of text. */
export const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, spacing = 'md', className, ...props }, ref) => (
    <div ref={ref} className={cn(spacingStyles[spacing], className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          style={{
            width: i === lines - 1 ? '60%' : '100%',
          }}
          {...props}
        />
      ))}
    </div>
  )
)

SkeletonText.displayName = 'SkeletonText'

export interface SkeletonAvatarProps extends Omit<SkeletonProps, 'variant'> {
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const avatarSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
}

/** Circular skeleton placeholder for avatar loading states. */
export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="circular"
      className={cn(avatarSizes[size], className)}
      {...props}
    />
  )
)

SkeletonAvatar.displayName = 'SkeletonAvatar'

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Show image placeholder */
  showImage?: boolean
  /** Show avatar */
  showAvatar?: boolean
  /** Number of text lines */
  lines?: number
}

/** Card-shaped skeleton with optional image, avatar, and text placeholders. */
export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ showImage = true, showAvatar = false, lines = 3, className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-card space-y-4 rounded-lg border p-4', className)} {...props}>
      {showImage && <Skeleton className="h-32 w-full" variant="rounded" />}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <SkeletonAvatar />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      )}
      <SkeletonText lines={lines} />
    </div>
  )
)

SkeletonCard.displayName = 'SkeletonCard'

export interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of rows */
  rows?: number
  /** Number of columns */
  columns?: number
  /**
   * Per-column widths (px number or any CSS width). Match them to the real
   * table's columns so the layout doesn't jump when content swaps in;
   * unspecified columns stay fluid (`flex-1`).
   */
  columnWidths?: (string | number | undefined)[]
}

/** Table-shaped skeleton with configurable rows and columns. */
export const SkeletonTable = forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ rows = 5, columns = 4, columnWidths, className, ...props }, ref) => {
    const count = columnWidths?.length ?? columns
    const cellProps = (i: number) =>
      columnWidths?.[i] != null
        ? { className: 'shrink-0', style: { width: columnWidths[i] } }
        : { className: 'flex-1' }
    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {/* Header */}
        <div className="flex gap-4">
          {Array.from({ length: count }).map((_, i) => {
            const p = cellProps(i)
            return <Skeleton key={i} className={cn('h-4', p.className)} style={p.style} />
          })}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: count }).map((_, colIndex) => {
              const p = cellProps(colIndex)
              return <Skeleton key={colIndex} className={cn('h-8', p.className)} style={p.style} />
            })}
          </div>
        ))}
      </div>
    )
  }
)

SkeletonTable.displayName = 'SkeletonTable'
