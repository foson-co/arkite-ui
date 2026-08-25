import { forwardRef, useMemo, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { Select, type SelectOption, type SelectSize } from '../select'
import { useLocale } from '../../locale'

export interface FilterSelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'onChange'
> {
  /** Filter label — shown as prefix in the "all" option (e.g. "狀態: 全部") */
  label?: string
  /** Options list */
  options?: readonly SelectOption[]
  /** Text for the "all" option — pass `false` to hide it. Defaults to the locale's "All" label. */
  allLabel?: string | false
  /** Select size @default "sm" */
  size?: SelectSize
  /** Fires with the selected value (empty string for "all") */
  onChange?: (value: string) => void
}

/**
 * Thin wrapper around `<Select>` tailored for filter toolbars.
 *
 * Adds a built-in "all" option and simplifies `onChange` to return
 * the value string directly instead of a change event.
 */
export const FilterSelect = forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className, label, options = [], allLabel, size = 'sm', onChange, ...props }, ref) => {
    const locale = useLocale()
    const mergedOptions = useMemo(() => {
      if (allLabel === false) return options

      const resolvedAllLabel = allLabel ?? locale.filterSelect.all
      const allText = label ? `${label}: ${resolvedAllLabel}` : resolvedAllLabel
      const allOption: SelectOption = { value: '', label: allText }
      return [allOption, ...options]
    }, [options, allLabel, label, locale])

    // The label prop doubles as the accessible name — filter selects usually
    // render without a visible <label>, which axe rightly flags. But when the
    // consumer wires up their own name (a native <label htmlFor> via `id`, or
    // `aria-labelledby`), an aria-label would silently override it in the
    // accessible-name computation, so back off.
    const hasOwnName = props.id != null || props['aria-labelledby'] != null
    return (
      <Select
        ref={ref}
        size={size}
        options={mergedOptions}
        aria-label={hasOwnName ? undefined : label}
        className={cn('w-auto', className)}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    )
  }
)

FilterSelect.displayName = 'FilterSelect'
