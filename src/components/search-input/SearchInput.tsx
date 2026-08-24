import { forwardRef, useState, useRef, useEffect, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { Search, X, Loader2 } from 'lucide-react'
import { useLocale } from '../../locale'

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: 'sm' | 'md' | 'lg'
  /** Loading state */
  loading?: boolean
  /** Show clear button */
  clearable?: boolean
  /** On clear callback */
  onClear?: () => void
  /** Debounce delay in ms */
  debounce?: number
  /** On debounced change */
  onDebouncedChange?: (value: string) => void
}

const sizeStyles = {
  sm: 'h-9 text-sm pl-8 pr-8',
  md: 'h-10 text-sm pl-10 pr-10',
  lg: 'h-12 text-base pl-12 pr-12',
}

const iconSizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const iconPositionStyles = {
  sm: 'left-2.5',
  md: 'left-3',
  lg: 'left-3.5',
}

const clearPositionStyles = {
  sm: 'right-2',
  md: 'right-2.5',
  lg: 'right-3',
}

/** Search text input with icon, clear button, and optional debounced change. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      size = 'md',
      loading = false,
      clearable = true,
      onClear,
      debounce,
      onDebouncedChange,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const currentValue = value !== undefined ? value : internalValue
    const showClear = clearable && currentValue && !loading

    // Handle debounced change
    useEffect(() => {
      if (debounce && onDebouncedChange) {
        debounceTimerRef.current = setTimeout(() => {
          onDebouncedChange(String(currentValue))
        }, debounce)

        return () => {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
          }
        }
      }
    }, [currentValue, debounce, onDebouncedChange])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value)
      onChange?.(e)
    }

    const handleClear = () => {
      setInternalValue('')
      onClear?.()

      // Create a synthetic event for controlled components
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <div className="relative">
        {/* Search icon */}
        <div
          className={cn(
            'text-muted-foreground pointer-events-none absolute top-1/2 -translate-y-1/2',
            iconPositionStyles[size]
          )}
        >
          <Search className={iconSizeStyles[size]} />
        </div>

        {/* Input */}
        <input
          ref={ref}
          type="search"
          name="search"
          autoComplete="off"
          value={currentValue}
          onChange={handleChange}
          className={cn(
            'border-input bg-background w-full rounded-md border',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-search-cancel-button]:hidden',
            sizeStyles[size],
            className
          )}
          {...props}
        />

        {/* Clear button or loading spinner */}
        <div className={cn('absolute top-1/2 -translate-y-1/2', clearPositionStyles[size])}>
          {loading ? (
            <Loader2 className={cn(iconSizeStyles[size], 'text-muted-foreground animate-spin')} />
          ) : showClear ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
            >
              <X className={iconSizeStyles[size]} />
              <span className="sr-only">{locale.searchInput.clear}</span>
            </button>
          ) : null}
        </div>
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
