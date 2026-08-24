import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { Check } from 'lucide-react'

export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Checkbox size */
  size?: CheckboxSize
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
}

const sizeStyles: Record<CheckboxSize, { box: string; icon: string; text: string }> = {
  sm: {
    box: 'h-4 w-4',
    icon: 'h-3 w-3',
    text: 'text-sm',
  },
  md: {
    box: 'h-5 w-5',
    icon: 'h-3.5 w-3.5',
    text: 'text-sm',
  },
  lg: {
    box: 'h-6 w-6',
    icon: 'h-4 w-4',
    text: 'text-base',
  },
}

/** Styled checkbox input with optional label, description, and error state. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
    const checkboxId = id || stableId

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'flex shrink-0 cursor-pointer items-center justify-center rounded border',
              'peer-focus-visible:ring-ring/40 peer-focus-visible:ring-1 peer-focus-visible:ring-offset-0',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              'peer-checked:[&>svg]:opacity-100',
              'transition-colors duration-200',
              styles.box,
              error
                ? 'border-destructive'
                : 'border-input peer-checked:border-primary peer-checked:bg-primary'
            )}
          >
            <Check
              aria-hidden="true"
              className={cn('text-primary-foreground opacity-0 transition-opacity', styles.icon)}
            />
          </label>
        </div>
        {(label || description || errorMessage) && (
          <div className="space-y-1">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'cursor-pointer leading-none font-medium',
                  styles.text,
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
            {errorMessage && <p className="text-destructive text-xs">{errorMessage}</p>}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
