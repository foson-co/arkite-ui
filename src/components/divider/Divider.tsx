import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Divider orientation */
  orientation?: DividerOrientation
  /** Label text */
  label?: string
  /** Label position (only for horizontal) */
  labelPosition?: 'left' | 'center' | 'right'
}

/** Visual separator supporting horizontal and vertical orientations with an optional label. */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', label, labelPosition = 'center', ...props }, ref) => {
    if (orientation === 'vertical') {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="vertical"
          className={cn('bg-border h-full w-px', className)}
          {...props}
        />
      )
    }

    if (label) {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={cn(
            'flex items-center',
            labelPosition === 'left' && 'justify-start',
            labelPosition === 'center' && 'justify-center',
            labelPosition === 'right' && 'justify-end',
            className
          )}
          {...props}
        >
          {labelPosition !== 'left' && (
            <div className={cn('bg-border h-px flex-1', labelPosition === 'center' && 'mr-4')} />
          )}
          <span className="text-muted-foreground text-xs">{label}</span>
          {labelPosition !== 'right' && (
            <div className={cn('bg-border h-px flex-1', labelPosition === 'center' && 'ml-4')} />
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cn('bg-border h-px w-full', className)}
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'
