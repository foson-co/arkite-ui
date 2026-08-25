import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select size */
  size?: SelectSize
  /** Placeholder text */
  placeholder?: string
  /** Options list */
  options?: readonly SelectOption[]
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Left icon */
  leftIcon?: ReactNode
  /** Full width */
  fullWidth?: boolean
}

const sizeStyles: Record<SelectSize, string> = {
  sm: 'h-8 px-3 pr-8 text-xs',
  md: 'h-10 px-3 pr-10 text-sm',
  lg: 'h-12 px-4 pr-12 text-base',
}

const iconSizeStyles: Record<SelectSize, string> = {
  sm: 'right-2 h-3 w-3',
  md: 'right-3 h-4 w-4',
  lg: 'right-4 h-5 w-5',
}

/** Native select dropdown with icon, error state, and placeholder support. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      size = 'md',
      placeholder,
      options = [],
      error = false,
      errorMessage,
      leftIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative', fullWidth ? 'w-full' : 'w-fit')}>
        <div className="relative">
          {leftIcon && (
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              'bg-background flex w-full appearance-none rounded-md border',
              'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-200',
              sizeStyles[size],
              error ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
              leftIcon && 'pl-10',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
            {children}
          </select>
          <ChevronDown
            className={cn(
              'text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2',
              iconSizeStyles[size]
            )}
          />
        </div>
        {errorMessage && <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
