import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export type NumberInputSize = 'sm' | 'md' | 'lg'

export interface NumberInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'onChange' | 'value' | 'defaultValue' | 'type'
> {
  /** Controlled value */
  value?: number | null
  /** Uncontrolled default value */
  defaultValue?: number
  /** Fires with the numeric value, or null if empty */
  onChange?: (value: number | null) => void
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Increment/decrement step */
  step?: number
  /** Number of decimal places */
  precision?: number
  /** Text prefix (e.g. "$") */
  prefix?: string
  /** Text suffix (e.g. "%", "kg") */
  suffix?: string
  /** Input size */
  size?: NumberInputSize
  /** Error border state */
  error?: boolean
  /** Error message text */
  errorMessage?: string
  /** Show +/- stepper buttons */
  controls?: boolean
  /** Allow negative numbers */
  allowNegative?: boolean
  /** Clamp to min/max on blur */
  clampOnBlur?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Additional class name */
  className?: string
}

const sizeStyles: Record<NumberInputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

const controlSizeStyles: Record<NumberInputSize, string> = {
  sm: 'w-6',
  md: 'w-7',
  lg: 'w-8',
}

const iconSizeStyles: Record<NumberInputSize, number> = {
  sm: 12,
  md: 14,
  lg: 16,
}

function toFixed(value: number, precision: number): number {
  return Number(value.toFixed(precision))
}

/** Numeric input with optional stepper buttons, min/max clamping, and precision formatting. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      min,
      max,
      step = 1,
      precision,
      prefix,
      suffix,
      size = 'md',
      error = false,
      errorMessage,
      controls = true,
      allowNegative = true,
      clampOnBlur = true,
      disabled = false,
      placeholder,
      className,
      onKeyDown,
      onBlur,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = useState<number | null>(defaultValue ?? null)
    const [displayValue, setDisplayValue] = useState<string>(() => {
      const initial = isControlled ? controlledValue : (defaultValue ?? null)
      return initial != null ? String(initial) : ''
    })

    const currentValue = isControlled ? controlledValue : internalValue

    // Sync display when controlled value changes externally
    const prevControlledRef = useRef(controlledValue)
    useEffect(() => {
      if (isControlled && controlledValue !== prevControlledRef.current) {
        prevControlledRef.current = controlledValue
        setDisplayValue(controlledValue != null ? String(controlledValue) : '')
      }
    }, [isControlled, controlledValue])

    const updateValue = useCallback(
      (newValue: number | null) => {
        if (!isControlled) {
          setInternalValue(newValue)
        }
        setDisplayValue(newValue != null ? String(newValue) : '')
        onChange?.(newValue)
      },
      [isControlled, onChange]
    )

    const clamp = useCallback(
      (val: number): number => {
        let result = val
        if (min != null && result < min) result = min
        if (max != null && result > max) result = max
        return result
      },
      [min, max]
    )

    const canIncrement = max == null || (currentValue ?? 0) < max
    const canDecrement = min == null || (currentValue ?? 0) > min

    const increment = useCallback(
      (e?: MouseEvent) => {
        e?.preventDefault()
        if (disabled) return
        const base = currentValue ?? 0
        let next = base + step
        if (max != null && next > max) next = max
        if (precision != null) next = toFixed(next, precision)
        updateValue(next)
      },
      [currentValue, step, max, precision, disabled, updateValue]
    )

    const decrement = useCallback(
      (e?: MouseEvent) => {
        e?.preventDefault()
        if (disabled) return
        const base = currentValue ?? 0
        let next = base - step
        if (min != null && next < min) next = min
        if (!allowNegative && next < 0) next = 0
        if (precision != null) next = toFixed(next, precision)
        updateValue(next)
      },
      [currentValue, step, min, precision, allowNegative, disabled, updateValue]
    )

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value

      // Allow empty
      if (raw === '') {
        setDisplayValue('')
        if (!isControlled) setInternalValue(null)
        onChange?.(null)
        return
      }

      // Allow intermediate states: just a minus sign, or trailing decimal point
      if (raw === '-' && allowNegative) {
        setDisplayValue(raw)
        return
      }
      if (raw.endsWith('.') && !raw.slice(0, -1).includes('.')) {
        setDisplayValue(raw)
        return
      }

      // Validate numeric input
      const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/
      if (!pattern.test(raw)) return

      const parsed = parseFloat(raw)
      if (isNaN(parsed)) return

      setDisplayValue(raw)
      if (!isControlled) setInternalValue(parsed)
      onChange?.(parsed)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e)

      if (displayValue === '' || displayValue === '-') {
        if (displayValue === '-') {
          setDisplayValue('')
          if (!isControlled) setInternalValue(null)
          onChange?.(null)
        }
        return
      }

      let val = parseFloat(displayValue)
      if (isNaN(val)) return

      if (clampOnBlur) {
        val = clamp(val)
      }

      if (!allowNegative && val < 0) {
        val = 0
      }

      if (precision != null) {
        val = toFixed(val, precision)
      }

      setDisplayValue(String(val))
      if (!isControlled) setInternalValue(val)
      onChange?.(val)
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e)
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        increment()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        decrement()
      }
    }

    const iconSize = iconSizeStyles[size]

    return (
      <div className={cn('relative', 'inline-flex flex-col')}>
        <div className="relative inline-flex items-center">
          {prefix && (
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm">
              {prefix}
            </span>
          )}
          <input
            {...props}
            ref={ref}
            type="text"
            inputMode="decimal"
            role="spinbutton"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue ?? undefined}
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              'bg-background flex w-full rounded-md border',
              'placeholder:text-muted-foreground',
              'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-200',
              '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
              sizeStyles[size],
              error ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
              prefix && 'pl-8',
              suffix && 'pr-8',
              controls && !suffix && 'pr-8',
              controls && suffix && 'pr-16',
              className
            )}
          />
          {suffix && (
            <span
              className={cn(
                'text-muted-foreground pointer-events-none absolute inset-y-0 flex items-center text-sm',
                controls ? 'right-8 pr-1' : 'right-0 pr-3'
              )}
            >
              {suffix}
            </span>
          )}
          {controls && (
            <div
              className={cn(
                'border-input absolute inset-y-0 right-0 flex flex-col border-l',
                controlSizeStyles[size],
                disabled && 'opacity-50'
              )}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-label={locale.numberInput.increment}
                disabled={disabled || !canIncrement}
                onClick={increment}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-tr-md',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  'transition-colors duration-150',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
              >
                <ChevronUp size={iconSize} />
              </button>
              <div className="border-input border-t" />
              <button
                type="button"
                tabIndex={-1}
                aria-label={locale.numberInput.decrement}
                disabled={disabled || !canDecrement}
                onClick={decrement}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-br-md',
                  'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                  'transition-colors duration-150',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
              >
                <ChevronDown size={iconSize} />
              </button>
            </div>
          )}
        </div>
        {errorMessage && <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'
