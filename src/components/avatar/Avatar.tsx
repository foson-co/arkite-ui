import { forwardRef, useState, type HTMLAttributes, type ImgHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { StatusDot, type StatusType, type StatusDotSize } from '../status-dot/StatusDot'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type AvatarVariant = 'circle' | 'rounded' | 'square'

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Avatar size */
  size?: AvatarSize
  /** Avatar shape variant */
  variant?: AvatarVariant
  /** Fallback initials when image fails to load */
  fallback?: string
  /** Alt text for the image */
  alt?: string
  /** Status indicator */
  status?: StatusType
}

const sizeStyles: Record<
  AvatarSize,
  { container: string; text: string; statusDot: StatusDotSize }
> = {
  xs: { container: 'h-6 w-6', text: 'text-xs', statusDot: 'xs' },
  sm: { container: 'h-8 w-8', text: 'text-xs', statusDot: 'sm' },
  md: { container: 'h-10 w-10', text: 'text-sm', statusDot: 'md' },
  lg: { container: 'h-12 w-12', text: 'text-base', statusDot: 'md' },
  xl: { container: 'h-16 w-16', text: 'text-lg', statusDot: 'lg' },
  '2xl': { container: 'h-20 w-20', text: 'text-xl', statusDot: 'lg' },
}

const variantStyles: Record<AvatarVariant, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-lg',
  square: 'rounded-none',
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Displays a user avatar image with fallback initials and an optional status indicator. */
export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = 'md', variant = 'circle', fallback, alt, src, status, ...props }, ref) => {
    const [imageError, setImageError] = useState(false)
    const styles = sizeStyles[size]
    const showFallback = !src || imageError

    const containerClasses = cn(
      'relative inline-flex items-center justify-center overflow-hidden bg-muted',
      styles.container,
      variantStyles[variant],
      className
    )

    return (
      <div className={containerClasses}>
        {showFallback ? (
          <span className={cn('text-muted-foreground font-medium select-none', styles.text)}>
            {fallback ? getInitials(fallback) : alt ? getInitials(alt) : '?'}
          </span>
        ) : (
          <img
            ref={ref}
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
            {...props}
          />
        )}
        {status && (
          <StatusDot
            status={status}
            size={styles.statusDot}
            className="ring-background absolute right-0 bottom-0 ring-2"
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to show */
  max?: number
  /** Children avatars */
  children: React.ReactNode
  /** Size for all avatars */
  size?: AvatarSize
  /** Spacing between avatars (negative for overlap) */
  spacing?: 'tight' | 'normal' | 'loose'
  /** Additional class name */
  className?: string
}

const spacingStyles: Record<NonNullable<AvatarGroupProps['spacing']>, string> = {
  tight: '-space-x-3',
  normal: '-space-x-2',
  loose: '-space-x-1',
}

/** Renders a stack of overlapping avatars with a "+N" overflow indicator. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max = 5, children, size = 'md', spacing = 'normal', className, ...rest }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children]
    const visibleChildren = childrenArray.slice(0, max)
    const remainingCount = childrenArray.length - max

    return (
      <div
        ref={ref}
        className={cn('flex items-center', spacingStyles[spacing], className)}
        {...rest}
      >
        {visibleChildren}
        {remainingCount > 0 && (
          <div
            className={cn(
              'bg-muted ring-background inline-flex items-center justify-center ring-2',
              sizeStyles[size].container,
              sizeStyles[size].text,
              'text-muted-foreground rounded-full font-medium'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = 'AvatarGroup'
