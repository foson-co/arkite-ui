import { Fragment, useState, useMemo, useCallback, useContext, useRef, useEffect, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated, warnUsage } from '../../utils/deprecate'
import { useLocale } from '../../locale'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../table/Table'
import { Button } from '../button/Button'
import { CardSurfaceContext } from '../card/Card'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Check, Minus, Columns3, ListFilter } from 'lucide-react'

export interface Column<T> {
  /** Column key (should match data property) */
  key: string
  /** Column header */
  header: ReactNode
  /** Custom cell renderer */
  cell?: (row: T, index: number) => ReactNode
  /** Enable sorting for this column */
  sortable?: boolean
  /** Column width */
  width?: string | number
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /**
   * Hide column: `true` removes it entirely; `'mobile'` hides it below the
   * `md` breakpoint, `'desktop'` at `md` and up — both via pure CSS
   * (SSR-safe, no JS breakpoint math), aligned with AdminLayout's
   * `hideSidebar="mobile"` convention.
   */
  hidden?: boolean | 'mobile' | 'desktop'
  /** Class for this column's header cell */
  headerClassName?: string
  /** Inline style for this column's header cell (e.g. vertical writing-mode) */
  headerStyle?: CSSProperties
  /** Class for this column's body cells — string, or a function of the row */
  cellClassName?: string | ((row: T, index: number) => string)
  /**
   * Inline style for this column's body cells — for CONTINUOUS values class
   * strings can't express (e.g. heatmap alpha computed from the row:
   * `(row) => ({ background: \`rgb(106 77 255 / ${row.t})\` })`).
   * Discrete/binary styling should prefer `cellClassName`.
   */
  cellStyle?: CSSProperties | ((row: T, index: number) => CSSProperties)
  /** Enable filtering for this column */
  filterable?: boolean
  /** Custom filter options. If not provided, auto-detect unique values from data. */
  filterOptions?: string[]
  /** Custom filter function */
  filterFn?: (row: T, filterValue: string) => boolean
  /**
   * Pin this column during horizontal scroll: `'left'` freezes it at the left
   * edge (e.g. a ticker/name column in a wide table), `'right'` at the right
   * edge (action columns). Note: `'left'` pins at the table's left edge — with
   * `selectable`/expandable enabled, the leading utility columns scroll under
   * the pinned column, so pin the first data column only in plain tables.
   */
  pinned?: 'left' | 'right'
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  key: string
  direction: SortDirection
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
}

export interface DataTableProps<T> {
  /** Table data */
  data: T[]
  /**
   * Column definitions. `NoInfer` makes TypeScript infer `T` from `data`
   * alone, so inline `columns` literals get fully typed `cell`/`cellClassName`
   * callbacks without annotating `<DataTable<Row> …>`.
   */
  columns: Column<NoInfer<T>>[]
  /** Show the pagination footer (rows-per-page + range + pager) @default true */
  pagination?: boolean
  /** Compact density — tighter cell padding for data-dense admin tables @default false */
  compact?: boolean
  /** Page size options */
  pageSizeOptions?: number[]
  /** Default page size */
  defaultPageSize?: number
  /** Row key extractor */
  getRowKey?: (row: T, index: number) => string | number
  /** Loading state */
  loading?: boolean
  /** Empty state content */
  emptyContent?: ReactNode
  /** On row click */
  onRowClick?: (row: T, index: number) => void
  /**
   * Class for body rows — string, or a function of the row for conditional
   * styling (e.g. dim disabled rows: `(r) => r.active ? '' : 'opacity-60'`)
   */
  rowClassName?: string | ((row: T, index: number) => string)
  /** Selected rows (controlled) */
  selectedRows?: Set<string | number>
  /** Default selected rows (uncontrolled) */
  defaultSelectedRows?: Set<string | number>
  /** On selection change — receives the complete next selection */
  onSelectionChange?: (selected: Set<string | number>) => void
  /**
   * Incremental companion to `onSelectionChange`: fires once per row whose
   * selection actually changed. Handy when existing code speaks
   * `toggle(id)`-style events instead of whole-set state.
   */
  onRowSelect?: (row: T, selected: boolean) => void
  /** Per-row selectability — unselectable rows render a disabled checkbox and are skipped by select-all */
  isRowSelectable?: (row: T, index: number) => boolean
  /** Enable row selection */
  selectable?: boolean
  /** Row hover feedback (passed to the underlying Table) @default true */
  hoverable?: boolean
  /**
   * Enable expandable rows; provide the row content via `renderExpandedRow`.
   *
   * Passing a function `(row, index) => ReactNode` here is deprecated and will
   * be removed in v1.0 — move the renderer to `renderExpandedRow` instead.
   */
  expandable?: boolean | ((row: T, index: number) => ReactNode)
  /** Expanded row content renderer (enables expandable rows unless `expandable` is `false`) */
  renderExpandedRow?: (row: T, index: number) => ReactNode
  /** Show column visibility toggle */
  columnToggle?: boolean
  /** Stick table header to top when scrolling. Requires `maxHeight` (or `fillHeight`) to have any effect. */
  stickyHeader?: boolean
  /** Max height for the scrollable table area (e.g. '400px', '60vh'). Required for stickyHeader to work. */
  maxHeight?: string | number
  /**
   * Minimum table width (e.g. `960`, `'60rem'`) — below it the table scrolls
   * horizontally instead of squashing columns to min-content.
   *
   * **Wide tables need this, and `Column.pinned` is inert without it.** With
   * `width: 100%` + auto layout the browser shrinks columns to min-content
   * before it overflows, so a many-column (or CJK-header) table collapses to
   * ~30px columns and multi-line headers while never handing you a usable
   * scroll. `Column.width` is only a hint to the layout algorithm, not a
   * guarantee — `minWidth` is the floor that makes it stick.
   */
  minWidth?: string | number
  /**
   * Show fades at the horizontal edges while columns are hidden there.
   * @default true when `minWidth` is set
   */
  scrollFade?: boolean
  /**
   * Draw the table's own bordered, rounded surface. Pass `false` when the
   * table sits inside a surface that already has a frame (a `Card` carrying a
   * `CardHeader`), so the two borders don't stack into a double frame.
   * @default true
   */
  bordered?: boolean
  /**
   * Make the table scroll wrapper fill its parent's height (`h-full`).
   * Use when the DataTable is inside a fixed-height flex container so the
   * horizontal scrollbar pins to the bottom of the viewport even when there
   * are few rows. The parent must provide a determinate height.
   */
  fillHeight?: boolean
  /** Sort state (controlled). Pass `null` for "no sort". */
  sortState?: SortState | null
  /** Callback when sort changes (for controlled usage) */
  onSortChange?: (sort: SortState | null) => void
  /** Column filters (controlled) */
  filters?: Record<string, string[]>
  /** Callback when filters change (for controlled usage) */
  onFilterChange?: (filters: Record<string, string[]>) => void
  /** Current page, 1-based (controlled) */
  page?: number
  /** Callback when page changes (1-based) */
  onPageChange?: (page: number) => void
  /**
   * Callback when the rows-per-page selector changes. In server-side mode
   * (`totalRows`) the selector only renders when this is provided, so the
   * consumer can refetch with the new page size.
   */
  onPageSizeChange?: (pageSize: number) => void
  /**
   * Total row count across all pages (server-side mode). When set, `data` is
   * treated as the already-fetched current page: the table skips client-side
   * filtering, sorting, and slicing, and the pagination footer derives page
   * count and range info from this total instead of `data.length`.
   *
   * Server-side mode expects the controlled `page` prop (the table cannot
   * slice `data`, so an internal page would drift from what is shown), and
   * `onPageSizeChange` if you keep the rows-per-page selector. Column filters
   * only render when `filters`/`onFilterChange` are controlled AND the column
   * provides `filterOptions` (options derived from the current page would be
   * incomplete). Do the actual filtering/sorting/slicing on the server.
   */
  totalRows?: number
  /** Additional class name */
  className?: string
}

/* ─── Selection Checkbox ─── */

type CheckState = 'checked' | 'indeterminate' | 'unchecked'

function SelectionCheckbox({
  state,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: {
  state: CheckState
  onChange: () => void
  disabled?: boolean
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'indeterminate' ? 'mixed' : state === 'checked'}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:ring-offset-0',
        'disabled:cursor-not-allowed disabled:opacity-50',
        state !== 'unchecked'
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background'
      )}
    >
      {state === 'checked' && <Check className="h-3 w-3" />}
      {state === 'indeterminate' && <Minus className="h-3 w-3" />}
    </button>
  )
}

const responsiveHiddenClass = (hidden?: boolean | 'mobile' | 'desktop') =>
  hidden === 'mobile' ? 'max-md:hidden' : hidden === 'desktop' ? 'md:hidden' : undefined

/** Feature-rich data table with sorting, pagination, and custom cell rendering. */
export function DataTable<T>({
  data,
  columns,
  pagination = true,
  compact = false,
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  getRowKey = (_row, index) => index,
  loading = false,
  emptyContent,
  onRowClick,
  rowClassName,
  selectable = false,
  hoverable = true,
  onRowSelect,
  isRowSelectable,
  selectedRows,
  defaultSelectedRows,
  onSelectionChange,
  expandable,
  renderExpandedRow,
  columnToggle = false,
  stickyHeader = false,
  maxHeight,
  minWidth,
  scrollFade,
  bordered = true,
  fillHeight = false,
  sortState: controlledSortState,
  onSortChange,
  filters: controlledFilters,
  onFilterChange,
  page: controlledPage,
  onPageChange,
  onPageSizeChange,
  totalRows,
  className,
}: DataTableProps<T>) {
  const locale = useLocale()

  // Composition guard: DataTable already draws a bordered, rounded surface, so
  // nesting it in a Card stacks two frames. Detected via context rather than
  // DOM inspection — see CardSurfaceContext.
  const insideCard = useContext(CardSurfaceContext)
  if (insideCard && bordered) {
    warnUsage(
      'DataTable',
      'nested-in-card',
      'rendered inside a Card while drawing its own border — the two frames stack. Pass `bordered={false}` (and give the Card `padding="none"` with `CardContent className="p-0"`), or drop the Card: DataTable is already a complete surface.'
    )
  }

  // Deprecated `expandable={(row, index) => ...}` — treated as `renderExpandedRow`
  if (typeof expandable === 'function' && renderExpandedRow == null) {
    warnDeprecated('DataTable', 'expandable(fn)', 'renderExpandedRow')
  }
  const expandedRowRenderer =
    renderExpandedRow ?? (typeof expandable === 'function' ? expandable : undefined)
  const isExpandable = expandable !== false && expandedRowRenderer != null

  const isSortControlled = controlledSortState !== undefined
  const [uncontrolledSortState, setUncontrolledSortState] = useState<SortState | null>(null)
  const sortState = isSortControlled ? controlledSortState : uncontrolledSortState
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<Set<string>>(new Set())
  const [columnToggleOpen, setColumnToggleOpen] = useState(false)
  const columnToggleRef = useRef<HTMLDivElement>(null)
  const isFiltersControlled = controlledFilters !== undefined
  const [uncontrolledFilters, setUncontrolledFilters] = useState<Record<string, string[]>>({})
  const filters = isFiltersControlled ? controlledFilters : uncontrolledFilters
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null)
  const filterDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isPageControlled = controlledPage !== undefined
  // Server-side mode: `data` is the already-processed current page
  const isServerMode = totalRows !== undefined
  if (isServerMode && pagination && !isPageControlled) {
    warnUsage(
      'DataTable',
      'server-uncontrolled-page',
      'server-side mode (`totalRows`) without a controlled `page` prop — the table cannot slice `data`, so the pager and range info will not match the rendered rows unless you refetch in `onPageChange` and pass `page` back.'
    )
  }
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const pageIndex = isPageControlled ? Math.max(0, controlledPage - 1) : paginationState.pageIndex
  const pageSize = paginationState.pageSize

  // Close column toggle dropdown on outside click
  useEffect(() => {
    if (!columnToggleOpen) return
    const handleClick = (e: MouseEvent) => {
      if (columnToggleRef.current && !columnToggleRef.current.contains(e.target as Node)) {
        setColumnToggleOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [columnToggleOpen])

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!openFilterKey) return
    const handleClick = (e: MouseEvent) => {
      const ref = filterDropdownRefs.current[openFilterKey]
      if (ref && !ref.contains(e.target as Node)) {
        setOpenFilterKey(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openFilterKey])

  // Filter visible columns
  const visibleColumns = useMemo(
    // `'mobile'`/`'desktop'` stay in the render and hide via CSS classes
    () => columns.filter((col) => col.hidden !== true && !hiddenColumnKeys.has(col.key)),
    [columns, hiddenColumnKeys]
  )

  // Toggleable columns (non-hidden by definition)
  const toggleableColumns = useMemo(
    () => columns.filter((col) => col.hidden !== true),
    [columns]
  )

  // ─── Filter helpers ───
  const getFilterOptions = useCallback(
    (column: Column<T>): string[] => {
      if (column.filterOptions) return column.filterOptions
      const unique = new Set<string>()
      data.forEach((row) => {
        const value = (row as Record<string, unknown>)[column.key]
        if (value !== null && value !== undefined) {
          unique.add(String(value))
        }
      })
      return Array.from(unique).sort()
    },
    [data]
  )

  // In server mode filtering happens on the server: only render the filter UI
  // when the consumer controls filters (and can react to changes) AND provides
  // the full option list — options derived from the current page are incomplete,
  // and an uncontrolled filter would do nothing but reset the page.
  const canRenderFilter = useCallback(
    (column: Column<T>): boolean =>
      Boolean(column.filterable) &&
      (!isServerMode || (isFiltersControlled && onFilterChange != null && column.filterOptions != null)),
    [isServerMode, isFiltersControlled, onFilterChange]
  )

  const resetToFirstPage = useCallback(() => {
    if (!isPageControlled) {
      setPaginationState((prev) => ({ ...prev, pageIndex: 0 }))
    } else if (pageIndex !== 0) {
      onPageChange?.(1)
    }
  }, [isPageControlled, pageIndex, onPageChange])

  const applyFilters = useCallback(
    (updated: Record<string, string[]>) => {
      if (!isFiltersControlled) setUncontrolledFilters(updated)
      onFilterChange?.(updated)
      resetToFirstPage()
    },
    [isFiltersControlled, onFilterChange, resetToFirstPage]
  )

  const toggleFilterValue = useCallback(
    (columnKey: string, value: string) => {
      const current = filters[columnKey] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      const updated = { ...filters }
      if (next.length === 0) {
        delete updated[columnKey]
      } else {
        updated[columnKey] = next
      }
      applyFilters(updated)
    },
    [filters, applyFilters]
  )

  const clearColumnFilter = useCallback(
    (columnKey: string) => {
      const updated = { ...filters }
      delete updated[columnKey]
      applyFilters(updated)
    },
    [filters, applyFilters]
  )

  // Filter data
  const filteredData = useMemo(() => {
    if (isServerMode) return data
    const activeFilters = Object.entries(filters).filter(([, values]) => values.length > 0)
    if (activeFilters.length === 0) return data

    return data.filter((row) =>
      activeFilters.every(([columnKey, filterValues]) => {
        const column = columns.find((c) => c.key === columnKey)
        if (column?.filterFn) {
          return filterValues.some((fv) => column.filterFn!(row, fv))
        }
        const cellValue = String((row as Record<string, unknown>)[columnKey] ?? '')
        return filterValues.includes(cellValue)
      })
    )
  }, [data, filters, columns, isServerMode])

  const hasActiveFilters = Object.keys(filters).length > 0

  // Sort data
  const sortedData = useMemo(() => {
    if (isServerMode || !sortState || !sortState.direction) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[sortState.key]
      const bValue = (b as Record<string, unknown>)[sortState.key]

      if (aValue === bValue) return 0
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = aValue < bValue ? -1 : 1
      return sortState.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredData, sortState, isServerMode])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination || isServerMode) return sortedData

    const start = pageIndex * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, pagination, isServerMode, pageIndex, pageSize])

  // Pagination info
  const totalRowCount = totalRows ?? sortedData.length
  const totalPages = Math.ceil(totalRowCount / pageSize)
  const canPreviousPage = pageIndex > 0
  const canNextPage = pageIndex < totalPages - 1

  const handleSort = (key: string) => {
    let next: SortState | null
    if (sortState?.key !== key) {
      next = { key, direction: 'asc' }
    } else if (sortState.direction === 'asc') {
      next = { key, direction: 'desc' }
    } else {
      next = null
    }
    if (!isSortControlled) setUncontrolledSortState(next)
    onSortChange?.(next)
  }

  const goToPage = (nextPageIndex: number) => {
    const clamped = Math.max(0, Math.min(nextPageIndex, totalPages - 1))
    if (!isPageControlled) {
      setPaginationState((prev) => ({ ...prev, pageIndex: clamped }))
    }
    onPageChange?.(clamped + 1)
  }

  const setPageSize = (nextPageSize: number) => {
    setPaginationState({ pageIndex: 0, pageSize: nextPageSize })
    resetToFirstPage()
    onPageSizeChange?.(nextPageSize)
  }

  // ─── Selection helpers ───
  const isSelectionControlled = selectedRows !== undefined
  const [uncontrolledSelectedRows, setUncontrolledSelectedRows] = useState<Set<string | number>>(
    () => new Set(defaultSelectedRows)
  )
  const selection = isSelectionControlled ? selectedRows : uncontrolledSelectedRows

  const updateSelection = useCallback(
    (next: Set<string | number>) => {
      if (!isSelectionControlled) setUncontrolledSelectedRows(next)
      onSelectionChange?.(next)
    },
    [isSelectionControlled, onSelectionChange]
  )

  const pageRows = useMemo(
    () =>
      paginatedData.map((row, i) => {
        const index = pageIndex * pageSize + i
        return {
          row,
          key: getRowKey(row, index),
          selectableRow: isRowSelectable ? isRowSelectable(row, index) : true,
        }
      }),
    [paginatedData, getRowKey, pageIndex, pageSize, isRowSelectable]
  )
  const allPageKeys = useMemo(
    () => pageRows.filter((r) => r.selectableRow).map((r) => r.key),
    [pageRows]
  )

  const headerCheckState: CheckState = useMemo(() => {
    if (!selectable || allPageKeys.length === 0) return 'unchecked'
    const selectedOnPage = allPageKeys.filter((k) => selection.has(k)).length
    if (selectedOnPage === 0) return 'unchecked'
    if (selectedOnPage === allPageKeys.length) return 'checked'
    return 'indeterminate'
  }, [selectable, allPageKeys, selection])

  const toggleAll = useCallback(() => {
    const next = new Set(selection)
    const adding = headerCheckState !== 'checked'
    for (const { row, key, selectableRow } of pageRows) {
      if (!selectableRow) continue
      const had = next.has(key)
      if (adding && !had) {
        next.add(key)
        onRowSelect?.(row, true)
      } else if (!adding && had) {
        next.delete(key)
        onRowSelect?.(row, false)
      }
    }
    updateSelection(next)
  }, [updateSelection, selection, headerCheckState, pageRows, onRowSelect])

  const toggleRow = useCallback(
    (key: string | number, row: T) => {
      const next = new Set(selection)
      const selectedNow = !next.has(key)
      if (selectedNow) {
        next.add(key)
      } else {
        next.delete(key)
      }
      onRowSelect?.(row, selectedNow)
      updateSelection(next)
    },
    [updateSelection, selection, onRowSelect]
  )

  // ─── Expand helpers ───
  const toggleExpand = useCallback((key: string | number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // ─── Column toggle helpers ───
  const toggleColumnVisibility = useCallback((key: string) => {
    setHiddenColumnKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // Total colSpan for full-width rows
  const totalColSpan = visibleColumns.length + (selectable ? 1 : 0) + (isExpandable ? 1 : 0)

  const getSortIcon = (key: string) => {
    if (sortState?.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    if (sortState.direction === 'asc') {
      return <ArrowUp className="h-4 w-4" />
    }
    return <ArrowDown className="h-4 w-4" />
  }

  const getCellValue = (row: T, column: Column<T>, index: number): ReactNode => {
    if (column.cell) {
      return column.cell(row, index)
    }
    const value = (row as Record<string, unknown>)[column.key]
    if (value === null || value === undefined) return '-'
    return String(value)
  }

  return (
    <div
      className={cn(
        bordered && 'rounded-md border',
        fillHeight && 'flex h-full flex-col',
        className
      )}
    >
      {columnToggle && (
        <div className="flex items-center justify-end border-b px-4 py-2">
          <div
            ref={columnToggleRef}
            className="relative"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setColumnToggleOpen(false)
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setColumnToggleOpen((o) => !o)}
              className="h-8 gap-1.5"
              aria-label={locale.dataTable.toggleColumns}
            >
              <Columns3 className="h-4 w-4" />
              {locale.dataTable.columns}
            </Button>
            {columnToggleOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border bg-popover p-1 shadow-md">
                {toggleableColumns.map((col) => {
                  const isVisible = !hiddenColumnKeys.has(col.key)
                  return (
                    <button
                      key={col.key}
                      type="button"
                      onClick={() => toggleColumnVisibility(col.key)}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className={cn(
                        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                        isVisible ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                      )}>
                        {isVisible && <Check className="h-3 w-3" />}
                      </span>
                      {typeof col.header === 'string' ? col.header : col.key}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* fillHeight 模式：middle 只當 flex 容器，scroll 交給 Table 的 wrapper。
          其他模式不需要中間層——maxHeight 直接給 Table 的 wrapper，讓「有
          overflow 的元素」和「有高度上限的元素」是同一個，sticky thead 才
          咬得住（兩層 overflow 嵌套會讓 sticky 完全失效）。 */}
      <div className={cn(fillHeight && 'flex-1 min-h-0')}>
      <Table
        stickyHeader={stickyHeader}
        fillHeight={fillHeight}
        hoverable={hoverable}
        compact={compact}
        minWidth={minWidth}
        maxHeight={fillHeight ? undefined : maxHeight}
        scrollFade={scrollFade}
        wrapperProps={stickyHeader ? { 'data-testid': 'sticky-scroll-container' } : undefined}
      >
        <TableHeader>
          <TableRow>
            {isExpandable && (
              <TableHead style={{ width: 40 }} className="px-2">
                <span className="sr-only">{locale.dataTable.expand}</span>
              </TableHead>
            )}
            {selectable && (
              <TableHead style={{ width: 40 }} className="px-3">
                <SelectionCheckbox
                  state={headerCheckState}
                  onChange={toggleAll}
                  aria-label={locale.dataTable.selectAllRows}
                />
              </TableHead>
            )}
            {visibleColumns.map((column) => {
              const isFilterActive = (filters[column.key]?.length ?? 0) > 0
              const isFilterOpen = openFilterKey === column.key
              return (
              <TableHead
                key={column.key}
                stickyLead={column.pinned === 'left'}
                stickyAction={column.pinned === 'right'}
                aria-sort={
                  column.sortable && sortState?.key === column.key && sortState.direction
                    ? sortState.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                style={{ width: column.width, ...column.headerStyle }}
                className={cn(
                  // Pinned headers are position:sticky — `relative` would
                  // override it (the filter dropdown anchors fine either way)
                  !column.pinned && 'relative',
                  responsiveHiddenClass(column.hidden),
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.headerClassName
                )}
              >
                <div className="inline-flex items-center gap-1">
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      aria-label={typeof column.header === 'string' ? locale.dataTable.sortBy(column.header) : locale.dataTable.sortColumn}
                    >
                      {column.header}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                  {canRenderFilter(column) && (
                    <div
                      ref={(el) => { filterDropdownRefs.current[column.key] = el }}
                      className="relative inline-block"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setOpenFilterKey(null)
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenFilterKey(isFilterOpen ? null : column.key)
                        }}
                        aria-label={locale.dataTable.filterBy(typeof column.header === 'string' ? column.header : column.key)}
                        className={cn(
                          'inline-flex h-5 w-5 items-center justify-center rounded-sm hover:bg-accent',
                          isFilterActive ? 'text-primary' : 'opacity-50'
                        )}
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                      </button>
                      {isFilterOpen && (
                        <div data-testid={`filter-dropdown-${column.key}`} className="absolute left-0 top-full z-20 mt-1 min-w-[10rem] rounded-md border bg-popover p-1 shadow-md">
                          {getFilterOptions(column).map((option) => {
                            const isSelected = filters[column.key]?.includes(option) ?? false
                            return (
                              <button
                                key={option}
                                type="button"
                                role="checkbox"
                                aria-checked={filters[column.key]?.includes(option) ?? false}
                                aria-label={option}
                                onClick={() => toggleFilterValue(column.key, option)}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                <span className={cn(
                                  'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                                )}>
                                  {isSelected && <Check className="h-3 w-3" />}
                                </span>
                                {option}
                              </button>
                            )
                          })}
                          {isFilterActive && (
                            <button
                              type="button"
                              onClick={() => clearColumnFilter(column.key)}
                              className="mt-1 flex w-full items-center justify-center rounded-sm border-t px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              {locale.dataTable.clearFilter}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={totalColSpan}
                className="h-24 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-muted-foreground">{locale.dataTable.loading}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={totalColSpan}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyContent || locale.dataTable.emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, pageLocalIndex) => {
              const globalIndex = pagination
                ? pageIndex * pageSize + pageLocalIndex
                : pageLocalIndex
              const rowKey = getRowKey(row, globalIndex)
              const isSelected = selectable && selection.has(rowKey)
              const isExpanded = isExpandable && expandedRows.has(rowKey)
              return (
              <Fragment key={rowKey}>
              <TableRow
                onClick={onRowClick ? () => onRowClick(row, globalIndex) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        // Only when the row itself is focused — Enter/Space on
                        // inner buttons must not double as row activation.
                        if (e.target !== e.currentTarget) return
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick(row, globalIndex)
                        }
                      }
                    : undefined
                }
                className={cn(
                  onRowClick && 'cursor-pointer',
                  isSelected && 'bg-primary/5',
                  typeof rowClassName === 'function'
                    ? rowClassName(row, globalIndex)
                    : rowClassName
                )}
                data-selected={isSelected || undefined}
              >
                {isExpandable && (
                  <TableCell className="px-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(rowKey)
                      }}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-sm hover:bg-accent"
                      aria-label={isExpanded ? locale.dataTable.collapseRow : locale.dataTable.expandRow}
                    >
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                    </button>
                  </TableCell>
                )}
                {selectable && (
                  <TableCell className="px-3">
                    <SelectionCheckbox
                      state={isSelected ? 'checked' : 'unchecked'}
                      onChange={() => toggleRow(rowKey, row)}
                      disabled={isRowSelectable ? !isRowSelectable(row, globalIndex) : false}
                      aria-label={locale.dataTable.selectRow(rowKey)}
                    />
                  </TableCell>
                )}
                {visibleColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    stickyLead={column.pinned === 'left'}
                    stickyAction={column.pinned === 'right'}
                    style={
                      typeof column.cellStyle === 'function'
                        ? column.cellStyle(row, globalIndex)
                        : column.cellStyle
                    }
                    className={cn(
                      responsiveHiddenClass(column.hidden),
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      typeof column.cellClassName === 'function'
                        ? column.cellClassName(row, globalIndex)
                        : column.cellClassName
                    )}
                  >
                    {getCellValue(row, column, globalIndex)}
                  </TableCell>
                ))}
              </TableRow>
              {isExpanded && (
                <TableRow>
                  <TableCell colSpan={totalColSpan} className="bg-muted/30 p-4">
                    {expandedRowRenderer?.(row, globalIndex)}
                  </TableCell>
                </TableRow>
              )}
              </Fragment>
              )
            })
          )}
        </TableBody>
      </Table>
      </div>

      {pagination && totalRowCount > 0 && (!isServerMode || data.length > 0) && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasActiveFilters && !isServerMode && (
              <span data-testid="filter-count">
                {locale.dataTable.showing(filteredData.length, data.length)}
              </span>
            )}
            {/* Server mode can't re-slice locally — without a callback the
                selector would change the footer math but not the rows. */}
            {(!isServerMode || onPageSizeChange != null) && (
              <>
                <span>{locale.pagination.rowsPerPage}</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label={locale.pagination.rowsPerPage}
                  className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring/40 focus:ring-offset-0 cursor-pointer"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {locale.pagination.rangeInfo(
                pageIndex * pageSize + 1,
                Math.min((pageIndex + 1) * pageSize, totalRowCount),
                totalRowCount
              )}
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(0)}
                  disabled={!canPreviousPage}
                  className="h-8 w-8"
                  aria-label={locale.pagination.firstPage}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(pageIndex - 1)}
                  disabled={!canPreviousPage}
                  className="h-8 w-8"
                  aria-label={locale.pagination.previousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex h-8 min-w-[4rem] items-center justify-center text-sm">
                  {pageIndex + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(pageIndex + 1)}
                  disabled={!canNextPage}
                  className="h-8 w-8"
                  aria-label={locale.pagination.nextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(totalPages - 1)}
                  disabled={!canNextPage}
                  className="h-8 w-8"
                  aria-label={locale.pagination.lastPage}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
