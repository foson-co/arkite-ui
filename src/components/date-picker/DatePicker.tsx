import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  type InputHTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { useGridKeyboard, toDayKey } from '../calendar/use-grid-keyboard'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return format.replace('yyyy', String(year)).replace('MM', month).replace('dd', day)
}

function parseDate(dateStr: string, format: string): Date | null {
  const yearMatch = format.indexOf('yyyy')
  const monthMatch = format.indexOf('MM')
  const dayMatch = format.indexOf('dd')

  if (yearMatch === -1 || monthMatch === -1 || dayMatch === -1) return null

  const year = parseInt(dateStr.slice(yearMatch, yearMatch + 4))
  const month = parseInt(dateStr.slice(monthMatch, monthMatch + 2)) - 1
  const day = parseInt(dateStr.slice(dayMatch, dayMatch + 2))

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null

  return new Date(year, month, day)
}

export type DatePickerSize = 'sm' | 'md' | 'lg'

export interface DatePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'size'
> {
  /** Selected date */
  value?: Date | null
  /** Initial date for uncontrolled usage */
  defaultValue?: Date
  /** On date change */
  onChange?: (date: Date | null) => void
  /** Controlled open state of the calendar popup */
  open?: boolean
  /** Initial open state of the calendar popup for uncontrolled usage */
  defaultOpen?: boolean
  /** Called when the calendar popup opens or closes */
  onOpenChange?: (open: boolean) => void
  /** Date format */
  format?: string
  /** Minimum date */
  minDate?: Date
  /** Maximum date */
  maxDate?: Date
  /** Disabled dates */
  disabledDates?: Date[]
  /** Show clear button */
  clearable?: boolean
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Size variant */
  size?: DatePickerSize
}

const inputSizeStyles: Record<DatePickerSize, string> = {
  sm: 'h-8 px-3 pr-8 text-xs',
  md: 'h-10 px-3 pr-10 text-sm',
  lg: 'h-12 px-4 pr-12 text-base',
}

const iconSizeStyles: Record<DatePickerSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const clearPositionStyles: Record<DatePickerSize, string> = {
  sm: 'right-8 top-4',
  md: 'right-9 top-5',
  lg: 'right-10 top-6',
}

const clearablePaddingStyles: Record<DatePickerSize, string> = {
  sm: 'pr-12',
  md: 'pr-14',
  lg: 'pr-16',
}

/** Date input with an inline calendar dropdown for selecting dates. */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      format = 'yyyy-MM-dd',
      minDate,
      maxDate,
      disabledDates = [],
      clearable = true,
      error,
      errorMessage,
      disabled,
      size = 'md',
      placeholder,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const isValueControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<Date | null>(defaultValue ?? null)
    const currentValue = isValueControlled ? (value ?? null) : internalValue
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
    const isOpen = openProp ?? internalOpen
    const [inputValue, setInputValue] = useState(
      currentValue ? formatDate(currentValue, format) : ''
    )
    const [viewDate, setViewDate] = useState(currentValue || new Date())
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)
    // Set when we programmatically return focus to the input (Escape/select),
    // so the focus handler does not immediately reopen the popup.
    const skipOpenOnFocusRef = useRef(false)
    const monthLabelId = useId()

    const { focusDay, handleDayKeyDown } = useGridKeyboard({
      containerRef,
      currentMonth: viewDate,
      onNavigateToMonth: setViewDate,
    })

    const setOpen = useCallback(
      (next: boolean) => {
        setInternalOpen(next)
        if (next !== isOpen) onOpenChange?.(next)
      },
      [isOpen, onOpenChange]
    )

    const setValue = (date: Date | null) => {
      if (!isValueControlled) setInternalValue(date)
      onChange?.(date)
    }

    // Sync input value with the current value
    useEffect(() => {
      if (currentValue) {
        setInputValue(formatDate(currentValue, format))
        setViewDate(currentValue)
      } else {
        setInputValue('')
      }
    }, [currentValue, format])

    // Close on Escape without selecting, returning focus to the input
    useEffect(() => {
      if (!isOpen) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return
        setOpen(false)
        if (document.activeElement !== inputRef.current) {
          skipOpenOnFocusRef.current = true
          inputRef.current?.focus()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [isOpen, setOpen])

    // Close on click outside
    useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, setOpen])

    const isDateDisabled = (date: Date): boolean => {
      if (minDate && date < minDate) return true
      if (maxDate && date > maxDate) return true
      return disabledDates.some((d) => d.toDateString() === date.toDateString())
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setInputValue(val)

      const parsed = parseDate(val, format)
      if (parsed && !isNaN(parsed.getTime()) && !isDateDisabled(parsed)) {
        setValue(parsed)
        setViewDate(parsed)
      }
    }

    const closeAndFocusInput = () => {
      setOpen(false)
      if (document.activeElement !== inputRef.current) {
        skipOpenOnFocusRef.current = true
        inputRef.current?.focus()
      }
    }

    const handleDateSelect = (day: number) => {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
      if (!isDateDisabled(newDate)) {
        setValue(newDate)
        closeAndFocusInput()
      }
    }

    const handleClear = () => {
      setValue(null)
    }

    const handlePrevMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const renderCalendar = () => {
      const year = viewDate.getFullYear()
      const month = viewDate.getMonth()
      const daysInMonth = getDaysInMonth(year, month)
      const firstDay = getFirstDayOfMonth(year, month)
      const today = new Date()

      const days: (number | null)[] = []

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        days.push(null)
      }

      // Days of month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
      }

      return (
        <div className="w-64 p-3">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label={locale.calendar.previousMonth}
              className="hover:bg-muted rounded p-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span id={monthLabelId} className="text-sm font-medium">
              {new Date(year, month).toLocaleDateString(locale.dateLocale, {
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label={locale.calendar.nextMonth}
              className="hover:bg-muted rounded p-1"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day names */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {locale.calendar.weekdaysShort.map((day) => (
              <div
                key={day}
                className="text-muted-foreground flex h-8 items-center justify-center text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-8" />
              }

              const date = new Date(year, month, day)
              const isDisabled = isDateDisabled(date)
              const isSelected = currentValue?.toDateString() === date.toDateString()
              const isToday = today.toDateString() === date.toDateString()

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isDisabled}
                  data-day={toDayKey(date)}
                  onClick={() => handleDateSelect(day)}
                  onKeyDown={(event) => handleDayKeyDown(event, date)}
                  className={cn(
                    'h-8 w-8 rounded-md text-sm transition-colors',
                    'hover:bg-muted focus:ring-ring focus:ring-2 focus:outline-none',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                    isToday && !isSelected && 'bg-muted',
                    isDisabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Today button */}
          <div className="mt-3 border-t pt-3">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                if (!isDateDisabled(today)) {
                  setValue(today)
                  closeAndFocusInput()
                }
              }}
              className="text-primary w-full text-sm hover:underline"
            >
              {locale.datePicker.today}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        <div className="relative">
          <input
            ref={(node) => {
              inputRef.current = node
              if (typeof ref === 'function') ref(node)
              else if (ref) ref.current = node
            }}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => {
              if (skipOpenOnFocusRef.current) {
                skipOpenOnFocusRef.current = false
                return
              }
              setOpen(true)
            }}
            placeholder={placeholder ?? locale.datePicker.placeholder}
            disabled={disabled}
            className={cn(
              'border-input bg-background flex w-full rounded-md border',
              inputSizeStyles[size],
              clearable && currentValue && !disabled && clearablePaddingStyles[size],
              'ring-offset-background placeholder:text-muted-foreground',
              'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive'
            )}
            {...props}
          />
          <button
            type="button"
            aria-label={locale.datePicker.openCalendar}
            onClick={() => {
              if (disabled) return
              if (isOpen) {
                setOpen(false)
              } else {
                // APG: opening the dialog moves focus to the selected day
                // (or today when nothing is selected).
                setOpen(true)
                focusDay(currentValue ?? new Date())
              }
            }}
            className={cn(
              'text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2',
              disabled && 'cursor-not-allowed'
            )}
          >
            <CalendarIcon className={iconSizeStyles[size]} />
          </button>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            role="dialog"
            aria-labelledby={monthLabelId}
            className="bg-card absolute z-50 mt-1 rounded-md border shadow-lg"
          >
            {renderCalendar()}
          </div>
        )}

        {/* Clear button — rendered after the dropdown so the popup keeps its
            tab position right after the calendar trigger */}
        {clearable && currentValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={locale.datePicker.clearDate}
            className={cn(
              'text-muted-foreground hover:text-foreground absolute -translate-y-1/2 focus:outline-none',
              clearPositionStyles[size]
            )}
          >
            <X className={iconSizeStyles[size]} />
          </button>
        )}

        {errorMessage && <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'
