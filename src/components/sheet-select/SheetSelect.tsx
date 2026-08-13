import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Check, ChevronDown } from 'lucide-react'
import { Drawer } from '../drawer'
import { useLocale } from '../../locale'

export type SheetSelectSize = 'sm' | 'md' | 'lg'

export interface SheetSelectOption {
  value: string
  label: string
  /** Secondary line shown under the label */
  description?: string
  disabled?: boolean
}

export interface SheetSelectProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value' | 'defaultValue' | 'title'
> {
  /** Options list */
  options: readonly SheetSelectOption[]
  /** Selected value */
  value?: string
  /** Initial value for uncontrolled usage */
  defaultValue?: string
  /** Callback when an option is selected */
  onChange?: (value: string) => void
  /** Controlled open state of the sheet */
  open?: boolean
  /** Initial open state of the sheet for uncontrolled usage */
  defaultOpen?: boolean
  /** Called when the sheet opens or closes */
  onOpenChange?: (open: boolean) => void
  /** Placeholder text shown when nothing is selected */
  placeholder?: string
  /** Sheet header title */
  title?: ReactNode
  /** Disable the trigger */
  disabled?: boolean
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Trigger size */
  size?: SheetSelectSize
  /** Custom option renderer */
  renderOption?: (option: SheetSelectOption, selected: boolean) => ReactNode
  /**
   * Class overrides for the parts SheetSelect renders itself. `className`
   * stays on the trigger button; `classNames.sheet` reaches the bottom-sheet
   * panel, which is otherwise unreachable from outside the component — use it
   * instead of higher-specificity global CSS, which breaks silently on any
   * markup change.
   */
  classNames?: {
    trigger?: string
    sheet?: string
  }
}

const sizeStyles: Record<SheetSelectSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

const iconSizeStyles: Record<SheetSelectSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

/**
 * Mobile-friendly select that opens a bottom sheet with large touch targets
 * instead of a dropdown. Built on Drawer.
 */
export const SheetSelect = forwardRef<HTMLButtonElement, SheetSelectProps>(
  (
    {
      className,
      options,
      value,
      defaultValue,
      onChange,
      open: openProp,
      defaultOpen,
      onOpenChange,
      placeholder,
      title,
      disabled = false,
      error = false,
      errorMessage,
      size = 'md',
      renderOption,
      classNames,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const isValueControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
    const currentValue = isValueControlled ? value : internalValue
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
    const open = openProp ?? internalOpen
    const selected = options.find((option) => option.value === currentValue)

    const setOpenState = (next: boolean) => {
      setInternalOpen(next)
      if (next !== open) onOpenChange?.(next)
    }

    const handleSelect = (option: SheetSelectOption) => {
      if (option.disabled) return
      if (!isValueControlled) setInternalValue(option.value)
      onChange?.(option.value)
      setOpenState(false)
    }

    return (
      <>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          onClick={() => setOpenState(true)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            'bg-background flex w-full items-center justify-between gap-2 rounded-md border text-left',
            'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-200',
            sizeStyles[size],
            error ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
            className,
            classNames?.trigger
          )}
          {...props}
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : (placeholder ?? locale.sheetSelect.placeholder)}
          </span>
          <ChevronDown className={cn('text-muted-foreground shrink-0', iconSizeStyles[size])} />
        </button>
        {errorMessage && <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>}

        <Drawer
          open={open}
          onClose={() => setOpenState(false)}
          position="bottom"
          showCloseButton={false}
          className={cn('h-auto max-h-[85dvh] rounded-t-2xl', classNames?.sheet)}
        >
          {/* Grab handle */}
          <div
            className="bg-muted-foreground/30 mx-auto mb-3 h-1.5 w-10 shrink-0 rounded-full"
            aria-hidden="true"
          />
          {title && (
            <div className="text-foreground mb-2 px-1 text-base font-semibold">{title}</div>
          )}
          <div
            role="listbox"
            aria-label={typeof title === 'string' ? title : undefined}
            className="space-y-1"
          >
            {options.map((option) => {
              const isSelected = option.value === currentValue
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left text-sm',
                    isSelected ? 'bg-muted text-foreground font-medium' : 'hover:bg-muted/50',
                    option.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                  )}
                >
                  {renderOption ? (
                    renderOption(option, isSelected)
                  ) : (
                    <span className="min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="text-muted-foreground block truncate text-xs">
                          {option.description}
                        </span>
                      )}
                    </span>
                  )}
                  {isSelected && <Check className="text-primary h-4.5 w-4.5 shrink-0" />}
                </button>
              )
            })}
          </div>
        </Drawer>
      </>
    )
  }
)

SheetSelect.displayName = 'SheetSelect'
