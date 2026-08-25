import { forwardRef, useState, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type SegmentedControlSize = 'sm' | 'md' | 'lg'

export interface SegmentedControlOption<T extends string = string> {
  value: T
  label: string
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string = string> extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Options to display */
  options: SegmentedControlOption<T>[]
  /** Currently selected value (controlled) */
  value?: T
  /** Initial value for uncontrolled usage */
  defaultValue?: T
  /** Change handler */
  onChange?: (value: T) => void
  /** Size variant @default "md" */
  size?: SegmentedControlSize
  /** Full width — segments share space equally */
  fullWidth?: boolean
  /** Disable all segments */
  disabled?: boolean
}

const sizeStyles: Record<SegmentedControlSize, { wrapper: string; button: string }> = {
  sm: { wrapper: 'h-8 p-0.5 text-xs', button: 'px-2.5 h-[calc(100%-4px)]' },
  md: { wrapper: 'h-9 p-1 text-sm', button: 'px-3 h-[calc(100%-8px)]' },
  lg: { wrapper: 'h-10 p-1 text-sm', button: 'px-4 h-[calc(100%-8px)]' },
}

/**
 * Mutually exclusive option selector displayed as a horizontal pill bar.
 *
 * Use for 2–5 options where all choices should be visible at once.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      size = 'md',
      fullWidth = false,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const styles = sizeStyles[size]
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue)
    const currentValue = isControlled ? value : internalValue

    return (
      <div
        ref={ref}
        role="radiogroup"
        className={cn(
          'border-input bg-muted inline-flex items-center gap-0.5 rounded-md border',
          styles.wrapper,
          fullWidth && 'w-full',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        {options.map((option) => {
          const isActive = currentValue === option.value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled || option.disabled}
              onClick={() => {
                if (!isControlled) setInternalValue(option.value)
                onChange?.(option.value)
              }}
              className={cn(
                'inline-flex items-center justify-center rounded-sm font-medium transition-colors',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
                'disabled:pointer-events-none disabled:opacity-50',
                styles.button,
                fullWidth && 'flex-1',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }
) as <T extends string = string>(
  props: SegmentedControlProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement
;(SegmentedControl as { displayName?: string }).displayName = 'SegmentedControl'
