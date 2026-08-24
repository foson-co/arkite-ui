import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type ToggleSize = 'sm' | 'md' | 'lg'

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Toggle size */
  size?: ToggleSize
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
}

const sizeStyles: Record<ToggleSize, { track: string; thumb: string; checkedTranslate: string }> = {
  sm: {
    track: 'h-5 w-9',
    thumb: 'h-4 w-4',
    checkedTranslate: 'group-has-[:checked]:translate-x-4',
  },
  md: {
    track: 'h-6 w-11',
    thumb: 'h-5 w-5',
    checkedTranslate: 'group-has-[:checked]:translate-x-5',
  },
  lg: {
    track: 'h-7 w-14',
    thumb: 'h-6 w-6',
    checkedTranslate: 'group-has-[:checked]:translate-x-7',
  },
}

/** On/off switch input with optional label and description. */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      className,
      size = 'md',
      label,
      description,
      error = false,
      errorMessage,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const styles = sizeStyles[size]
    const stableId = useId()
    const toggleId = id || stableId

    const toggle = (
      <div className="group relative flex items-center">
        <label
          htmlFor={toggleId}
          className={cn(
            'bg-input cursor-pointer rounded-full transition-colors duration-200',
            'has-[:checked]:bg-primary',
            'has-[:focus-visible]:ring-ring/40 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-offset-0',
            'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
            error && 'ring-destructive ring-1',
            styles.track
          )}
        >
          <input
            type="checkbox"
            role="switch"
            ref={ref}
            id={toggleId}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              'bg-background pointer-events-none rounded-full shadow-sm transition-transform duration-200',
              'translate-x-0.5',
              styles.checkedTranslate,
              styles.thumb,
              'mt-0.5'
            )}
          />
        </label>
      </div>
    )

    if (!label && !description && !errorMessage) {
      return <div className={className}>{toggle}</div>
    }

    return (
      <div className={cn('flex items-start gap-3', className)}>
        {toggle}
        <div className="space-y-1">
          {label && (
            <label
              htmlFor={toggleId}
              className={cn(
                'cursor-pointer text-sm leading-none font-medium',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}
          {description && <p className="text-muted-foreground text-xs">{description}</p>}
          {errorMessage && <p className="text-destructive text-xs">{errorMessage}</p>}
        </div>
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'
