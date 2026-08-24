import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type RadioSize = 'sm' | 'md' | 'lg'

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Radio size */
  size?: RadioSize
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
}

const sizeStyles: Record<RadioSize, { outer: string; inner: string; text: string }> = {
  sm: {
    outer: 'h-4 w-4',
    inner: 'h-2 w-2',
    text: 'text-sm',
  },
  md: {
    outer: 'h-5 w-5',
    inner: 'h-2.5 w-2.5',
    text: 'text-sm',
  },
  lg: {
    outer: 'h-6 w-6',
    inner: 'h-3 w-3',
    text: 'text-base',
  },
}

/** Single radio button input with optional label and description. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
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
    const radioId = id || stableId

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center">
          <input
            type="radio"
            ref={ref}
            id={radioId}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={radioId}
            className={cn(
              'flex shrink-0 cursor-pointer items-center justify-center rounded-full border',
              'peer-focus-visible:ring-ring/40 peer-focus-visible:ring-1 peer-focus-visible:ring-offset-0',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              'transition-colors duration-200',
              'peer-checked:[&>div]:scale-100',
              styles.outer,
              error ? 'border-destructive' : 'border-input peer-checked:border-primary'
            )}
          >
            <div
              className={cn('bg-primary scale-0 rounded-full transition-transform', styles.inner)}
            />
          </label>
        </div>
        {(label || description || errorMessage) && (
          <div className="space-y-1">
            {label && (
              <label
                htmlFor={radioId}
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

Radio.displayName = 'Radio'

// Radio Group component
export interface RadioGroupProps {
  /** Group name */
  name: string
  /** Options */
  options: Array<{
    value: string
    label: string
    description?: string
    disabled?: boolean
  }>
  /** Current value */
  value?: string
  /** Default value */
  defaultValue?: string
  /** On change handler */
  onChange?: (value: string) => void
  /** Radio size */
  size?: RadioSize
  /** Orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Disabled state */
  disabled?: boolean
  /** Class name */
  className?: string
}

/** Group of radio buttons rendered from an options array. */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      defaultValue,
      onChange,
      size = 'md',
      orientation = 'vertical',
      error = false,
      errorMessage,
      disabled = false,
      className,
    },
    ref
  ) => {
    const group = (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row gap-6',
          className
        )}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            size={size}
            error={error}
            disabled={disabled || option.disabled}
            checked={value !== undefined ? value === option.value : undefined}
            defaultChecked={defaultValue === option.value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        ))}
      </div>
    )

    if (!errorMessage) {
      return group
    }

    return (
      <div>
        {group}
        <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
