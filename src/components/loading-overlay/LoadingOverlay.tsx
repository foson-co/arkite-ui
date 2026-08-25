import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Spinner } from '../spinner/Spinner'
import { warnDeprecated } from '../../utils/deprecate'

export interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  /** Show the overlay */
  open?: boolean
  /** @deprecated use `open` instead — removed in v1.0 */
  visible?: boolean
  /** Custom spinner or content */
  children?: ReactNode
  /** Overlay background blur */
  blur?: boolean
  /** Cover the whole viewport (fixed inset-0, high z-index, backdrop blur) instead of the nearest positioned container */
  fullscreen?: boolean
  /** Spinner size */
  size?: 'sm' | 'md' | 'lg'
  /** Loading text below spinner */
  label?: string
}

/** Semi-transparent overlay with a centered spinner. Wrap around any element to indicate loading. */
export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    {
      className,
      open,
      visible,
      blur = false,
      fullscreen = false,
      size = 'md',
      label,
      children,
      ...props
    },
    ref
  ) => {
    if (open === undefined && visible !== undefined) {
      warnDeprecated('LoadingOverlay', 'visible', 'open')
    }
    const isOpen = open ?? visible ?? true
    if (!isOpen) return null

    const content = children || (
      <>
        <Spinner size={size} />
        {label && (
          <p className={cn('text-muted-foreground text-sm', !fullscreen && 'mt-2')}>{label}</p>
        )}
      </>
    )

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center',
          fullscreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10',
          'bg-background/60',
          (blur || fullscreen) && 'backdrop-blur-sm',
          className
        )}
        {...props}
      >
        {fullscreen ? (
          <div className="bg-background flex flex-col items-center gap-3 rounded-lg border px-6 py-5 shadow-lg">
            {content}
          </div>
        ) : (
          content
        )}
      </div>
    )
  }
)

LoadingOverlay.displayName = 'LoadingOverlay'
