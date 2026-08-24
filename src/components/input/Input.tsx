import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: InputSize
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Left addon (icon or text) */
  leftAddon?: ReactNode
  /** Right addon (icon or text) */
  rightAddon?: ReactNode
  /** Full width */
  fullWidth?: boolean
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

/** Text input field with optional left/right addons and error display. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      error = false,
      errorMessage,
      leftAddon,
      rightAddon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputElement = (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          'bg-background flex w-full rounded-md border',
          'placeholder:text-muted-foreground',
          'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors duration-200',
          // Size
          sizeStyles[size],
          // Error state
          error ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
          // Addon padding
          leftAddon && 'pl-10',
          rightAddon && 'pr-10',
          className
        )}
        {...props}
      />
    )

    if (!leftAddon && !rightAddon && !errorMessage) {
      return inputElement
    }

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <div className="relative">
          {leftAddon && (
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {leftAddon}
            </div>
          )}
          {inputElement}
          {rightAddon && (
            <div className="text-muted-foreground absolute inset-y-0 right-0 flex items-center pr-3">
              {rightAddon}
            </div>
          )}
        </div>
        {errorMessage && <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
