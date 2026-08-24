import {
  useState,
  useRef,
  useMemo,
  useEffect,
  useId,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  icon?: ReactNode
}

export type ComboboxSize = 'sm' | 'md' | 'lg'

export interface ComboboxProps {
  /** Available options */
  options: ComboboxOption[]
  /** Current value (controlled) */
  value?: string | string[]
  /** Initial value for uncontrolled usage */
  defaultValue?: string | string[]
  /** Callback when value changes */
  onChange?: (value: string | string[]) => void
  /** Controlled open state of the dropdown */
  open?: boolean
  /** Initial open state of the dropdown for uncontrolled usage */
  defaultOpen?: boolean
  /** Called when the dropdown opens or closes */
  onOpenChange?: (open: boolean) => void
  /** Placeholder text */
  placeholder?: string
  /** Search placeholder */
  searchPlaceholder?: string
  /** Allow multiple selection */
  multiple?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Empty state message */
  emptyMessage?: string
  /** Async search callback */
  onSearch?: (query: string) => void
  /** Loading state (for async search) */
  loading?: boolean
  /** Custom option renderer */
  renderOption?: (option: ComboboxOption, selected: boolean) => ReactNode
  /** Size variant */
  size?: ComboboxSize
  /** Full width */
  fullWidth?: boolean
  className?: string
}

const triggerSizeStyles: Record<ComboboxSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

const searchSizeStyles: Record<ComboboxSize, string> = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
}

const filterOptions = (options: ComboboxOption[], query: string) => {
  if (!query) return options
  const q = query.toLowerCase()
  return options.filter(
    (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)
  )
}

/** Searchable select dropdown with single or multi-select, async search, and custom option rendering. */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      placeholder,
      searchPlaceholder,
      multiple = false,
      disabled = false,
      error = false,
      errorMessage,
      emptyMessage,
      onSearch,
      loading = false,
      renderOption,
      size = 'md',
      fullWidth = false,
      className,
    },
    ref
  ) => {
    const locale = useLocale()
    const baseId = useId()
    const listboxId = `${baseId}-listbox`
    const valueId = `${baseId}-value`
    const isValueControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<string | string[] | undefined>(defaultValue)
    const currentValue = isValueControlled ? value : internalValue
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
    const open = openProp ?? internalOpen
    const [search, setSearch] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)

    const setOpen = (nextOpen: boolean) => {
      setInternalOpen(nextOpen)
      if (nextOpen !== open) onOpenChange?.(nextOpen)
    }

    const selectedValues = useMemo(() => {
      if (!currentValue) return new Set<string>()
      return new Set(Array.isArray(currentValue) ? currentValue : [currentValue])
    }, [currentValue])

    const filtered = useMemo(() => {
      if (onSearch) return options // async search handles filtering
      return filterOptions(options, search)
    }, [options, search, onSearch])

    const showOptions = !loading && filtered.length > 0
    const highlightedOption: ComboboxOption | undefined = filtered[highlightedIndex]

    useEffect(() => {
      if (highlightedIndex < 0) return
      document
        .getElementById(`${baseId}-option-${highlightedIndex}`)
        ?.scrollIntoView?.({ block: 'nearest' })
    }, [highlightedIndex, baseId])

    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (nextOpen) {
        setHighlightedIndex(filtered.findIndex((o) => !o.disabled && selectedValues.has(o.value)))
      }
    }

    const moveHighlight = (direction: 1 | -1) => {
      if (filtered.length === 0) return
      setHighlightedIndex((current) => {
        let next = current === -1 && direction === -1 ? filtered.length - 1 : current + direction
        while (next >= 0 && next < filtered.length && filtered[next].disabled) {
          next += direction
        }
        if (next < 0 || next >= filtered.length) return current
        return next
      })
    }

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const next = new Set(selectedValues)
        if (next.has(optionValue)) {
          next.delete(optionValue)
        } else {
          next.add(optionValue)
        }
        const nextValues = Array.from(next)
        if (!isValueControlled) setInternalValue(nextValues)
        onChange?.(nextValues)
      } else {
        if (!isValueControlled) setInternalValue(optionValue)
        onChange?.(optionValue)
        setOpen(false)
        setSearch('')
      }
    }

    const handleSearchChange = (q: string) => {
      setSearch(q)
      onSearch?.(q)
      const next = onSearch ? options : filterOptions(options, q)
      setHighlightedIndex(next.findIndex((o) => !o.disabled))
    }

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        moveHighlight(1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        moveHighlight(-1)
      } else if (event.key === 'Enter') {
        if (highlightedOption && !highlightedOption.disabled) {
          event.preventDefault()
          handleSelect(highlightedOption.value)
        }
      }
    }

    const displayLabel = useMemo(() => {
      if (selectedValues.size === 0) return null
      if (multiple) {
        const labels = options.filter((o) => selectedValues.has(o.value)).map((o) => o.label)
        return labels.length > 0 ? labels : null
      }
      const selected = options.find((o) => selectedValues.has(o.value))
      return selected ? [selected.label] : null
    }, [selectedValues, options, multiple])

    const combobox = (
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            disabled={disabled}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open && showOptions ? listboxId : undefined}
            aria-labelledby={valueId}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown' && !open) {
                event.preventDefault()
                handleOpenChange(true)
              }
            }}
            className={cn(
              'bg-background flex items-center justify-between rounded-md border py-2',
              fullWidth ? 'w-full' : 'w-fit',
              triggerSizeStyles[size],
              'ring-offset-background focus:ring-ring/40 focus:ring-1 focus:ring-offset-0 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:ring-destructive',
              !error && 'border-input',
              className
            )}
          >
            <span id={valueId} className="flex flex-1 flex-wrap gap-1 truncate">
              {displayLabel ? (
                multiple ? (
                  displayLabel.map((label) => (
                    <span
                      key={label}
                      className="bg-secondary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span>{displayLabel[0]}</span>
                )
              ) : (
                <span className="text-muted-foreground">
                  {placeholder ?? locale.combobox.placeholder}
                </span>
              )}
            </span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
            >
              <path
                d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.64245 3.00605 7.35753 3.00605 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className={cn(
              'bg-card z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border p-0 shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
            )}
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              inputRef.current?.focus()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Tab') {
                handleOpenChange(false)
              }
            }}
          >
            {/* Search input */}
            <div className="flex items-center border-b px-3">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                className="mr-2 h-4 w-4 shrink-0 opacity-50"
              >
                <path
                  d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-controls={showOptions ? listboxId : undefined}
                aria-activedescendant={
                  highlightedOption ? `${baseId}-option-${highlightedIndex}` : undefined
                }
                aria-autocomplete="list"
                placeholder={searchPlaceholder ?? locale.combobox.searchPlaceholder}
                className={cn(
                  'placeholder:text-muted-foreground flex w-full bg-transparent py-3 outline-none',
                  searchSizeStyles[size]
                )}
              />
            </div>

            {/* Options list */}
            <div
              id={showOptions ? listboxId : undefined}
              role={showOptions ? 'listbox' : undefined}
              aria-multiselectable={showOptions && multiple ? true : undefined}
              className="max-h-60 overflow-y-auto p-1"
            >
              {loading ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  {locale.combobox.loading}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
                  {emptyMessage ?? locale.combobox.emptyMessage}
                </div>
              ) : (
                filtered.map((option, index) => {
                  const isSelected = selectedValues.has(option.value)
                  const isHighlighted = index === highlightedIndex
                  return (
                    <button
                      key={option.value}
                      id={`${baseId}-option-${index}`}
                      role="option"
                      aria-selected={isHighlighted}
                      tabIndex={-1}
                      disabled={option.disabled}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => {
                        if (!option.disabled) setHighlightedIndex(index)
                      }}
                      className={cn(
                        'relative flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm outline-none select-none',
                        'hover:bg-secondary hover:text-secondary-foreground',
                        'disabled:pointer-events-none disabled:opacity-50',
                        isSelected && 'bg-primary/5',
                        isHighlighted && 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <>
                          <span className="mr-2 flex h-4 w-4 items-center justify-center">
                            {isSelected && (
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                className="h-4 w-4"
                              >
                                <path
                                  d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3354 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.5553 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </span>
                          <div className="flex flex-col">
                            <span className="flex items-center gap-2">
                              {option.icon}
                              {option.label}
                            </span>
                            {option.description && (
                              <span className="text-muted-foreground text-xs">
                                {option.description}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )

    if (!errorMessage) {
      return combobox
    }

    return (
      <div className={fullWidth ? 'w-full' : 'w-fit'}>
        {combobox}
        <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>
      </div>
    )
  }
)

Combobox.displayName = 'Combobox'
