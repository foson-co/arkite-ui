import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useId,
  type HTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { warnUsage } from '../../utils/deprecate'
import { FilterToolbarContext } from '../filter-bar/FilterBar'
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

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export type DateRangePickerSize = 'sm' | 'md' | 'lg'
export type DateRangePickerVariant = 'input' | 'calendar'

export interface DateRangeValue {
  start: Date | null
  end: Date | null
}

export interface DateRangePickerProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Selected range (controlled). Takes precedence over `startDate`/`endDate`. */
  value?: DateRangeValue
  /** Initial range for uncontrolled usage */
  defaultValue?: DateRangeValue
  /** Called with the full range whenever either date changes */
  onChange?: (range: DateRangeValue) => void
  /** Selected start date */
  startDate?: Date | null
  /** Selected end date */
  endDate?: Date | null
  /** Called when the start date changes */
  onStartChange?: (date: Date | null) => void
  /** Called when the end date changes */
  onEndChange?: (date: Date | null) => void
  /** Called when the clear button is clicked, resetting both dates */
  onClear?: () => void
  /** Controlled open state of the calendar dropdown */
  open?: boolean
  /** Initial open state of the calendar dropdown for uncontrolled usage */
  defaultOpen?: boolean
  /** Called when the calendar dropdown opens or closes */
  onOpenChange?: (open: boolean) => void
  /** Label for the start date input */
  startLabel?: string
  /** Label for the end date input */
  endLabel?: string
  /**
   * Where the field labels go.
   *
   * - `'top'` (default) — stacked above each input. Adds a line above the
   *   control, so in a `FilterBar` it pushes the inputs out of alignment with
   *   the single-line controls beside them.
   * - `'inside'` — the label becomes the input's placeholder, keeping the whole
   *   control on one line. The expected format moves to the input's `title`.
   * - `'none'` — no visible label; the placeholder stays the date format.
   *
   * All three keep the label as the input's accessible name.
   */
  labelPlacement?: 'top' | 'inside' | 'none'
  /** Date display format */
  format?: string
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Disabled state for both inputs */
  disabled?: boolean
  /** Error state for both inputs */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Size variant */
  size?: DateRangePickerSize
  /** Display variant. 'input' shows two text inputs (default). 'calendar' shows a single trigger button with a dual-month calendar popover. */
  variant?: DateRangePickerVariant
}

const inputSizeStyles: Record<DateRangePickerSize, string> = {
  sm: 'h-8 px-3 pr-8 text-xs',
  md: 'h-10 px-3 pr-10 text-sm',
  lg: 'h-12 px-4 pr-12 text-base',
}

const iconSizeStyles: Record<DateRangePickerSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const labelSizeStyles: Record<DateRangePickerSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

const triggerSizeStyles: Record<DateRangePickerSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

type ActiveField = 'start' | 'end' | null

/**
 * A date range picker with two side-by-side date inputs (start and end),
 * shared calendar dropdowns, and a clear button to reset both values.
 *
 * When `variant="calendar"`, renders a single trigger button that opens
 * a dual-month calendar popover for visual range selection.
 *
 * The start date constrains the end date — the end date cannot be set
 * earlier than the start date.
 */
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      className,
      value,
      defaultValue,
      onChange,
      startDate,
      endDate,
      onStartChange,
      onEndChange,
      onClear,
      open: openProp,
      defaultOpen,
      onOpenChange,
      startLabel,
      endLabel,
      labelPlacement = 'top',
      format = 'yyyy-MM-dd',
      minDate,
      maxDate,
      disabled,
      error,
      errorMessage,
      size = 'md',
      variant = 'input',
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const fieldId = useId()
    // Composition guard: a stacked label makes this control two lines tall, so
    // in a toolbar its inputs sit below the single-line controls beside them.
    const inToolbar = useContext(FilterToolbarContext)
    if (inToolbar && labelPlacement === 'top') {
      warnUsage(
        'DateRangePicker',
        'stacked-label-in-toolbar',
        'rendered inside a FilterBar with `labelPlacement="top"` — the stacked label adds a line, leaving the inputs out of alignment with the single-line controls next to them. Use `labelPlacement="inside"` (label becomes the placeholder) or `"none"`.'
      )
    }
    const resolvedStartLabel = startLabel ?? locale.dateRangePicker.startLabel
    const resolvedEndLabel = endLabel ?? locale.dateRangePicker.endLabel
    const [internalRange, setInternalRange] = useState<DateRangeValue>(
      () => defaultValue ?? { start: null, end: null }
    )
    // `value` (range object) wins over the legacy startDate/endDate pair,
    // which in turn wins over the internal uncontrolled state.
    const currentStart =
      value !== undefined ? value.start : startDate !== undefined ? startDate : internalRange.start
    const currentEnd =
      value !== undefined ? value.end : endDate !== undefined ? endDate : internalRange.end

    const [activeField, setActiveFieldRaw] = useState<ActiveField>(
      defaultOpen && variant !== 'calendar' ? 'start' : null
    )
    const [startInputValue, setStartInputValue] = useState(
      currentStart ? formatDate(currentStart, format) : ''
    )
    const [endInputValue, setEndInputValue] = useState(
      currentEnd ? formatDate(currentEnd, format) : ''
    )
    const [viewDate, setViewDate] = useState(currentStart || currentEnd || new Date())
    const containerRef = useRef<HTMLDivElement>(null)

    // Which field the input-variant dropdown targets; a controlled `open`
    // prop overrides whether the dropdown shows at all.
    const effectiveActiveField: ActiveField =
      openProp === undefined ? activeField : openProp ? (activeField ?? 'start') : null

    const setActiveField = useCallback(
      (field: ActiveField) => {
        setActiveFieldRaw(field)
        const wasOpen = effectiveActiveField !== null
        const willOpen = field !== null
        if (wasOpen !== willOpen) onOpenChange?.(willOpen)
      },
      [effectiveActiveField, onOpenChange]
    )

    // Calendar variant state
    const [internalCalendarOpen, setInternalCalendarOpen] = useState(defaultOpen ?? false)
    const calendarOpen = openProp ?? internalCalendarOpen
    const setCalendarOpen = useCallback(
      (next: boolean) => {
        setInternalCalendarOpen(next)
        if (next !== calendarOpen) onOpenChange?.(next)
      },
      [calendarOpen, onOpenChange]
    )
    const [calendarViewDate, setCalendarViewDate] = useState(currentStart || new Date())
    const [calendarSelectionPhase, setCalendarSelectionPhase] = useState<'start' | 'end'>('start')
    const [calendarPendingStart, setCalendarPendingStart] = useState<Date | null>(null)
    const [calendarHoverDate, setCalendarHoverDate] = useState<Date | null>(null)

    // Sync start input value with the current value
    useEffect(() => {
      if (currentStart) {
        setStartInputValue(formatDate(currentStart, format))
      } else {
        setStartInputValue('')
      }
    }, [currentStart, format])

    // Sync end input value with the current value
    useEffect(() => {
      if (currentEnd) {
        setEndInputValue(formatDate(currentEnd, format))
      } else {
        setEndInputValue('')
      }
    }, [currentEnd, format])

    // Update viewDate when the active field or dates change (input variant)
    useEffect(() => {
      if (effectiveActiveField === 'start' && currentStart) {
        setViewDate(currentStart)
      } else if (effectiveActiveField === 'end' && currentEnd) {
        setViewDate(currentEnd)
      }
    }, [effectiveActiveField, currentStart, currentEnd])

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          if (effectiveActiveField !== null) setActiveField(null)
          if (calendarOpen) setCalendarOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [effectiveActiveField, setActiveField, calendarOpen, setCalendarOpen])

    /**
     * Apply a partial range update: keeps the internal state in sync for
     * uncontrolled usage and fires the legacy per-field callbacks alongside
     * the range-level `onChange`.
     */
    const updateRange = (next: { start?: Date | null; end?: Date | null }) => {
      const nextRange: DateRangeValue = {
        start: next.start !== undefined ? next.start : (currentStart ?? null),
        end: next.end !== undefined ? next.end : (currentEnd ?? null),
      }
      setInternalRange(nextRange)
      if (next.start !== undefined) onStartChange?.(nextRange.start)
      if (next.end !== undefined) onEndChange?.(nextRange.end)
      onChange?.(nextRange)
    }

    const isDateDisabled = useCallback(
      (date: Date, field: ActiveField): boolean => {
        const d = stripTime(date)
        if (minDate && d < stripTime(minDate)) return true
        if (maxDate && d > stripTime(maxDate)) return true
        // End date cannot be before start date
        if (field === 'end' && currentStart && d < stripTime(currentStart)) return true
        return false
      },
      [minDate, maxDate, currentStart]
    )

    // --- Input variant handlers ---

    const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setStartInputValue(val)

      const parsed = parseDate(val, format)
      if (parsed && !isNaN(parsed.getTime()) && !isDateDisabled(parsed, 'start')) {
        // If end date is now before start, clear it
        const clearEnd = currentEnd && stripTime(currentEnd) < stripTime(parsed)
        updateRange(clearEnd ? { start: parsed, end: null } : { start: parsed })
        setViewDate(parsed)
      }
    }

    const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setEndInputValue(val)

      const parsed = parseDate(val, format)
      if (parsed && !isNaN(parsed.getTime()) && !isDateDisabled(parsed, 'end')) {
        updateRange({ end: parsed })
        setViewDate(parsed)
      }
    }

    const handleDateSelect = (day: number) => {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)

      if (effectiveActiveField === 'start') {
        if (!isDateDisabled(newDate, 'start')) {
          // If end date is now before the new start, clear it
          const clearEnd = currentEnd && stripTime(currentEnd) < stripTime(newDate)
          updateRange(clearEnd ? { start: newDate, end: null } : { start: newDate })
          setActiveField('end')
        }
      } else if (effectiveActiveField === 'end') {
        if (!isDateDisabled(newDate, 'end')) {
          updateRange({ end: newDate })
          setActiveField(null)
        }
      }
    }

    const handlePrevMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const handleClear = () => {
      updateRange({ start: null, end: null })
      onClear?.()
    }

    const hasDates = currentStart || currentEnd

    const renderCalendar = () => {
      const year = viewDate.getFullYear()
      const month = viewDate.getMonth()
      const daysInMonth = getDaysInMonth(year, month)
      const firstDay = getFirstDayOfMonth(year, month)
      const today = new Date()

      const days: (number | null)[] = []

      for (let i = 0; i < firstDay; i++) {
        days.push(null)
      }

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
            <span className="text-sm font-medium">
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
              const dateStr = date.toDateString()
              const isDisabledDay = isDateDisabled(date, effectiveActiveField)
              const isStartSelected = currentStart?.toDateString() === dateStr
              const isEndSelected = currentEnd?.toDateString() === dateStr
              const isSelected = isStartSelected || isEndSelected
              const isInRange =
                currentStart &&
                currentEnd &&
                stripTime(date) > stripTime(currentStart) &&
                stripTime(date) < stripTime(currentEnd)
              const isToday = today.toDateString() === dateStr

              return (
                <button
                  key={index}
                  type="button"
                  disabled={isDisabledDay}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    'h-8 w-8 rounded-md text-sm transition-colors',
                    'hover:bg-muted focus:ring-ring focus:ring-2 focus:outline-none',
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                    isInRange && 'bg-primary/10',
                    isToday && !isSelected && 'bg-muted',
                    isDisabledDay && 'cursor-not-allowed opacity-50 hover:bg-transparent'
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
                if (!isDateDisabled(today, effectiveActiveField)) {
                  handleDateSelect(today.getDate())
                  setViewDate(today)
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

    // --- Calendar variant handlers ---

    const isCalendarDateDisabled = useCallback(
      (date: Date): boolean => {
        const d = stripTime(date)
        if (minDate && d < stripTime(minDate)) return true
        if (maxDate && d > stripTime(maxDate)) return true
        // When selecting end date, cannot be before pending start
        if (
          calendarSelectionPhase === 'end' &&
          calendarPendingStart &&
          d < stripTime(calendarPendingStart)
        )
          return true
        return false
      },
      [minDate, maxDate, calendarSelectionPhase, calendarPendingStart]
    )

    const handleCalendarToggle = () => {
      if (disabled) return
      if (!calendarOpen) {
        // Reset selection phase when opening
        setCalendarSelectionPhase('start')
        setCalendarPendingStart(null)
        setCalendarHoverDate(null)
        setCalendarViewDate(currentStart || new Date())
      }
      setCalendarOpen(!calendarOpen)
    }

    const handleCalendarDateSelect = (date: Date) => {
      if (isCalendarDateDisabled(date)) return

      if (calendarSelectionPhase === 'start') {
        setCalendarPendingStart(date)
        // If existing end date is before new start, clear it
        const clearEnd = currentEnd && stripTime(currentEnd) < stripTime(date)
        updateRange(clearEnd ? { start: date, end: null } : { start: date })
        setCalendarSelectionPhase('end')
      } else {
        // End date selection
        updateRange({ end: date })
        setCalendarPendingStart(null)
        setCalendarHoverDate(null)
        setCalendarSelectionPhase('start')
        setCalendarOpen(false)
      }
    }

    const handleCalendarPrevMonth = () => {
      setCalendarViewDate(
        new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1)
      )
    }

    const handleCalendarNextMonth = () => {
      setCalendarViewDate(
        new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1)
      )
    }

    const handleCalendarClear = () => {
      updateRange({ start: null, end: null })
      onClear?.()
      setCalendarPendingStart(null)
      setCalendarHoverDate(null)
      setCalendarSelectionPhase('start')
    }

    const handleCalendarToday = () => {
      const today = new Date()
      const stripped = stripTime(today)
      if (!isCalendarDateDisabled(stripped)) {
        handleCalendarDateSelect(stripped)
        setCalendarViewDate(stripped)
      }
    }

    const renderDualMonthCalendar = () => {
      const leftYear = calendarViewDate.getFullYear()
      const leftMonth = calendarViewDate.getMonth()
      const rightDate = new Date(leftYear, leftMonth + 1, 1)
      const rightYear = rightDate.getFullYear()
      const rightMonth = rightDate.getMonth()

      const renderMonthGrid = (year: number, month: number) => {
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)
        const today = new Date()

        const days: (number | null)[] = []
        for (let i = 0; i < firstDay; i++) {
          days.push(null)
        }
        for (let i = 1; i <= daysInMonth; i++) {
          days.push(i)
        }

        // Determine effective start/end for highlight
        const effectiveStart = calendarPendingStart || currentStart
        const effectiveEnd =
          calendarSelectionPhase === 'end' && calendarHoverDate ? calendarHoverDate : currentEnd

        return (
          <div className="w-64 p-3">
            {/* Month title (no nav arrows, arrows are in the outer header) */}
            <div className="mb-3 flex items-center justify-center">
              <span className="text-sm font-medium">
                {new Date(year, month).toLocaleDateString(locale.dateLocale, {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
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
                const dateStr = date.toDateString()
                const isDisabledDay = isCalendarDateDisabled(date)
                const isStartSelected = currentStart?.toDateString() === dateStr
                const isEndSelected = currentEnd?.toDateString() === dateStr
                const isPendingStart = calendarPendingStart?.toDateString() === dateStr
                const isSelected = isStartSelected || isEndSelected || isPendingStart
                const isToday = today.toDateString() === dateStr

                // Range highlight
                const d = stripTime(date)
                const isInRange =
                  effectiveStart &&
                  effectiveEnd &&
                  d > stripTime(effectiveStart) &&
                  d < stripTime(effectiveEnd)

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={isDisabledDay}
                    onClick={() => handleCalendarDateSelect(date)}
                    onMouseEnter={() => {
                      if (calendarSelectionPhase === 'end') {
                        setCalendarHoverDate(date)
                      }
                    }}
                    className={cn(
                      'h-8 w-8 rounded-md text-sm transition-colors',
                      'hover:bg-muted focus:ring-ring focus:ring-2 focus:outline-none',
                      isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                      isInRange && 'bg-primary/10',
                      isToday && !isSelected && 'bg-muted',
                      isDisabledDay && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        )
      }

      return (
        <div
          className="bg-card absolute top-full left-0 z-50 mt-1 min-w-[540px] rounded-lg border shadow-lg"
          data-testid="calendar-popover"
        >
          {/* Navigation header */}
          <div className="flex items-center justify-between px-3 pt-3">
            <button
              type="button"
              onClick={handleCalendarPrevMonth}
              className="hover:bg-muted rounded p-1"
              aria-label={locale.calendar.previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-muted-foreground text-sm font-medium">
              {calendarSelectionPhase === 'start'
                ? locale.dateRangePicker.selectStart
                : locale.dateRangePicker.selectEnd}
            </span>
            <button
              type="button"
              onClick={handleCalendarNextMonth}
              className="hover:bg-muted rounded p-1"
              aria-label={locale.calendar.nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Two calendars side by side */}
          <div className="flex">
            {renderMonthGrid(leftYear, leftMonth)}
            <div className="bg-border my-3 w-px" />
            {renderMonthGrid(rightYear, rightMonth)}
          </div>

          {/* Footer */}
          <div className="mx-3 flex items-center justify-between border-t px-3 pt-1 pb-3">
            <button
              type="button"
              onClick={handleCalendarToday}
              className="text-primary text-sm hover:underline"
            >
              {locale.datePicker.today}
            </button>
            <button
              type="button"
              onClick={handleCalendarClear}
              className="text-muted-foreground hover:text-foreground text-sm"
              aria-label={locale.dateRangePicker.clearDates}
            >
              {locale.dateRangePicker.clear}
            </button>
          </div>
        </div>
      )
    }

    // --- Calendar variant render ---

    if (variant === 'calendar') {
      const triggerText =
        currentStart && currentEnd
          ? `${formatDate(currentStart, format)} ~ ${formatDate(currentEnd, format)}`
          : currentStart
            ? `${formatDate(currentStart, format)} ~ ...`
            : locale.dateRangePicker.selectRange

      return (
        <div
          ref={(node) => {
            ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref) {
              ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
            }
          }}
          className={cn('relative inline-block', className)}
          {...props}
        >
          <button
            type="button"
            onClick={handleCalendarToggle}
            disabled={disabled}
            data-testid="calendar-trigger"
            className={cn(
              'border-input bg-background inline-flex items-center gap-2 rounded-md border',
              triggerSizeStyles[size],
              'ring-offset-background',
              'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive',
              calendarOpen && 'ring-ring/40 ring-1 ring-offset-0',
              !(currentStart && currentEnd) && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className={iconSizeStyles[size]} />
            <span>{triggerText}</span>
          </button>

          {calendarOpen && renderDualMonthCalendar()}

          {errorMessage && <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>}
        </div>
      )
    }

    // --- Input variant render (original behavior) ---

    const inputVariant = (
      <div
        ref={(node) => {
          // Merge forwarded ref with internal ref
          ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
        }}
        className={cn(
          'relative inline-flex gap-2',
          // items-end aligns the inputs when labels stack above them; without
          // top labels every child is one row, so centre them instead.
          labelPlacement === 'top' ? 'items-end' : 'items-center',
          className
        )}
        {...props}
      >
        {/* Start date field */}
        <div className="flex flex-col gap-1">
          {labelPlacement === 'top' && (
            <label
              htmlFor={`${fieldId}-start`}
              className={cn('text-foreground font-medium', labelSizeStyles[size])}
            >
              {resolvedStartLabel}
            </label>
          )}
          <div className="relative">
            <input
              id={`${fieldId}-start`}
              type="text"
              value={startInputValue}
              onChange={handleStartInputChange}
              onFocus={() => setActiveField('start')}
              placeholder={labelPlacement === 'inside' ? resolvedStartLabel : format.toLowerCase()}
              title={labelPlacement === 'inside' ? format.toLowerCase() : undefined}
              // The visible label only names the input in 'top' mode; the other
              // placements must carry the name themselves.
              aria-label={labelPlacement === 'top' ? undefined : resolvedStartLabel}
              disabled={disabled}
              className={cn(
                'border-input bg-background flex w-full rounded-md border',
                inputSizeStyles[size],
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-destructive focus-visible:ring-destructive',
                effectiveActiveField === 'start' && 'ring-ring/40 ring-1 ring-offset-0'
              )}
            />
            <button
              type="button"
              aria-label={locale.datePicker.openCalendar}
              onClick={() =>
                !disabled && setActiveField(effectiveActiveField === 'start' ? null : 'start')
              }
              className={cn(
                'text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2',
                disabled && 'cursor-not-allowed'
              )}
            >
              <CalendarIcon className={iconSizeStyles[size]} />
            </button>
          </div>
        </div>

        {/* Separator */}
        <div
          className={cn(
            'text-muted-foreground flex shrink-0 items-center',
            size === 'sm' && 'h-8',
            size === 'md' && 'h-10',
            size === 'lg' && 'h-12'
          )}
        >
          <span className="px-1">&mdash;</span>
        </div>

        {/* End date field */}
        <div className="flex flex-col gap-1">
          {labelPlacement === 'top' && (
            <label
              htmlFor={`${fieldId}-end`}
              className={cn('text-foreground font-medium', labelSizeStyles[size])}
            >
              {resolvedEndLabel}
            </label>
          )}
          <div className="relative">
            <input
              id={`${fieldId}-end`}
              type="text"
              value={endInputValue}
              onChange={handleEndInputChange}
              onFocus={() => setActiveField('end')}
              placeholder={labelPlacement === 'inside' ? resolvedEndLabel : format.toLowerCase()}
              title={labelPlacement === 'inside' ? format.toLowerCase() : undefined}
              aria-label={labelPlacement === 'top' ? undefined : resolvedEndLabel}
              disabled={disabled}
              className={cn(
                'border-input bg-background flex w-full rounded-md border',
                inputSizeStyles[size],
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-destructive focus-visible:ring-destructive',
                effectiveActiveField === 'end' && 'ring-ring/40 ring-1 ring-offset-0'
              )}
            />
            <button
              type="button"
              aria-label={locale.datePicker.openCalendar}
              onClick={() =>
                !disabled && setActiveField(effectiveActiveField === 'end' ? null : 'end')
              }
              className={cn(
                'text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2',
                disabled && 'cursor-not-allowed'
              )}
            >
              <CalendarIcon className={iconSizeStyles[size]} />
            </button>
          </div>
        </div>

        {/* Clear button */}
        {hasDates && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'text-muted-foreground hover:text-foreground hover:bg-muted flex shrink-0 items-center justify-center rounded-md transition-colors',
              size === 'sm' && 'h-8 w-8',
              size === 'md' && 'h-10 w-10',
              size === 'lg' && 'h-12 w-12'
            )}
            aria-label={locale.dateRangePicker.clearDates}
          >
            <X className={iconSizeStyles[size]} />
          </button>
        )}

        {/* Calendar dropdown */}
        {effectiveActiveField && (
          <div className="bg-card absolute top-full left-0 z-50 mt-1 rounded-md border shadow-lg">
            {renderCalendar()}
          </div>
        )}
      </div>
    )

    if (!errorMessage) {
      return inputVariant
    }

    return (
      <div className="inline-block">
        {inputVariant}
        <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>
      </div>
    )
  }
)

DateRangePicker.displayName = 'DateRangePicker'
