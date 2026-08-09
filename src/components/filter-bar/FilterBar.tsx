import { createContext, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

/**
 * Marks the single-line toolbar row. Controls that can render taller than one
 * line (a stacked field label) read this to warn that they will break the
 * row's alignment — context rather than DOM inspection, so it survives
 * wrappers and portals.
 */
export const FilterToolbarContext = createContext(false)

/* ─── FilterBar (root) ─── */

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Responsive layout shell for data page toolbars.
 *
 * Provides a consistent Search | Filters | Actions pattern
 * that stacks on mobile and flows horizontally on desktop.
 *
 * **In context:** [CRUD List Page](https://ui.foson.co/storybook/?path=/docs/recipes-crud-list-page--docs)
 *
 * @example
 * ```tsx
 * <FilterBar>
 *   <FilterBarSearch placeholder="Search orders..." value={q} onChange={setQ} />
 *   <FilterBarFilters>
 *     <Select ... />
 *     <DatePicker ... />
 *   </FilterBarFilters>
 *   <FilterBarActions>
 *     <Button>Export</Button>
 *   </FilterBarActions>
 * </FilterBar>
 * ```
 */
export const FilterBar = forwardRef<HTMLDivElement, FilterBarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

FilterBar.displayName = 'FilterBar'

/* ─── FilterBarSearch ─── */

export interface FilterBarSearchProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Search placeholder */
  placeholder?: string
  /** Current search value */
  value?: string
  /** Search change handler */
  onChange?: (value: string) => void
}

/**
 * Left slot — search input with magnifying glass icon.
 */
export const FilterBarSearch = forwardRef<HTMLDivElement, FilterBarSearchProps>(
  ({ className, placeholder, value, onChange, ...props }, ref) => {
    const locale = useLocale()
    const resolvedPlaceholder = placeholder ?? locale.filterBar.searchPlaceholder
    return (
      <div ref={ref} className={cn('relative w-full sm:max-w-xs', className)} {...props}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          <path
            d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          name="search"
          autoComplete="off"
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label={resolvedPlaceholder}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-0',
            '[&::-webkit-search-cancel-button]:hidden'
          )}
        />
      </div>
    )
  }
)

FilterBarSearch.displayName = 'FilterBarSearch'

/* ─── FilterBarFilters ─── */

export interface FilterBarFiltersProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Center slot — wraps filter controls (Select, DatePicker, Combobox, etc.)
 */
export const FilterBarFilters = forwardRef<HTMLDivElement, FilterBarFiltersProps>(
  ({ className, children, ...props }, ref) => (
    <FilterToolbarContext.Provider value={true}>
    <div
      ref={ref}
      className={cn(
        // min-w-0 so labelled groups can shrink and wrap rather than pushing
        // the bar wider than its container.
        'flex min-w-0 flex-wrap items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
    </FilterToolbarContext.Provider>
  )
)

FilterBarFilters.displayName = 'FilterBarFilters'

/* ─── FilterBarGroup ─── */

export interface FilterBarGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Visible label for the group (e.g. "Period", "時間範圍"). When it is a
   * plain string it also becomes the group's accessible name.
   */
  label: ReactNode
  children: ReactNode
}

/**
 * A labelled cluster of filter controls — the "Period: [1d][7d][30d]" shape
 * that preset toggles need and a `Select` does not.
 *
 * `FilterSelect`'s `label` only prefixes its "all" option ("Status: All"),
 * which works for dropdowns but leaves preset groups with nowhere to put a
 * visible label. Without this, callers hand-roll a label span plus a flex row
 * — and the hand-rolled version reliably ships without `flex-wrap`, so the
 * group refuses to shrink and pushes the page sideways on narrow viewports.
 *
 * Wraps at both levels and carries `min-w-0`, so a long group folds onto the
 * next line instead of forcing a horizontal scrollbar.
 *
 * @example
 * ```tsx
 * <FilterBarFilters>
 *   <FilterBarGroup label="Period">
 *     <SegmentedControl size="sm" options={PERIODS} value={period} onChange={setPeriod} />
 *   </FilterBarGroup>
 * </FilterBarFilters>
 * ```
 */
export const FilterBarGroup = forwardRef<HTMLDivElement, FilterBarGroupProps>(
  ({ className, label, children, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-label={typeof label === 'string' ? label : undefined}
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-2',
        // Trailing inset so adjacent groups read as separate clusters: the
        // parent's 8px gap plus this 8px doubles the space *between* groups
        // while the label↔control gap inside one stays 8px. Kept here rather
        // than as a wider gap on FilterBarFilters so bars of plain selects
        // keep their existing rhythm.
        'pe-2 last:pe-0',
        className
      )}
      {...props}
    >
      <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-1">{children}</div>
    </div>
  )
)

FilterBarGroup.displayName = 'FilterBarGroup'

/* ─── FilterBarActions ─── */

export interface FilterBarActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Right slot — action buttons (Export, Add, etc.)
 */
export const FilterBarActions = forwardRef<HTMLDivElement, FilterBarActionsProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 sm:ml-auto', className)}
      {...props}
    >
      {children}
    </div>
  )
)

FilterBarActions.displayName = 'FilterBarActions'
