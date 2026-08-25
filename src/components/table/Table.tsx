import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { warnUsage } from '../../utils/deprecate'
import { ScrollFade, type DataAttributes } from '../scroll-fade/ScrollFade'

// Includes HTML's deprecated `align` values so third-party renderers (e.g.
// markdown td/th mappings) type-check — justify/char simply apply nothing.
type TableAlign = 'left' | 'center' | 'right' | 'justify' | 'char'

const alignStyles: Record<TableAlign, string | false> = {
  left: false,
  center: 'text-center',
  right: 'text-right',
  justify: false,
  char: false,
}

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Table variant */
  variant?: 'default' | 'striped'
  /** Compact table */
  compact?: boolean
  /** Bordered table */
  bordered?: boolean
  /** Row hover feedback @default true — pass `false` for static/print-like tables */
  hoverable?: boolean
  /**
   * Sticky header — stays fixed while scrolling vertically.
   *
   * Needs a height limit on the scroll wrapper to do anything: pass
   * `maxHeight` (or `fillHeight` inside a determinate-height flex chain).
   * Wrapping the table in your own `overflow-auto` box does NOT work — that
   * makes the wrapper the nearest scrollport, and the header sticks to a box
   * that never scrolls vertically, so it scrolls out of view.
   */
  stickyHeader?: boolean
  /**
   * Make the scroll wrapper fill its parent's height (`h-full`).
   * Use this when the table is inside a fixed-height flex container so the
   * horizontal scrollbar pins to the bottom of the viewport even when there
   * are few rows. The parent must provide a determinate height (e.g.
   * `flex-1 min-h-0` inside a `flex flex-col` chain).
   */
  fillHeight?: boolean
  /**
   * Minimum table width (e.g. `960`, `'60rem'`). Below it the wrapper scrolls
   * horizontally instead of squashing every column to its min-content width.
   *
   * **Wide tables need this.** `width: 100%` + auto layout means a table with
   * many columns — or CJK headers, which break between characters — shrinks to
   * min-content first: columns collapse to ~30px and headers stack vertically
   * *before* any scrollbar appears. It is also what makes `stickyLead` /
   * `stickyAction` (and `DataTable`'s `Column.pinned`) reachable at all —
   * frozen columns are meaningless if the table never overflows.
   */
  minWidth?: string | number
  /**
   * Max height of the scroll wrapper (e.g. `'400px'`, `'60vh'`) — the element
   * that owns `overflow`, which is what `stickyHeader` sticks to.
   */
  maxHeight?: string | number
  /**
   * Show fades at the horizontal edges while content is hidden there, as a
   * "this scrolls sideways" affordance.
   * @default true when `minWidth` is set
   */
  scrollFade?: boolean
  /** Class for the scroll wrapper (the element that owns `overflow`) */
  wrapperClassName?: string
  /**
   * Props for the scroll wrapper — most usefully the a11y trio that makes a
   * scroll region keyboard-reachable: `tabIndex={0}`, `role="region"`,
   * `aria-label`.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement> & DataAttributes
}

/**
 * Styled HTML table with support for striping, density, borders, and sticky
 * headers. The style props are exposed as `data-*` attributes consumed by CSS
 * on the child components — attribute PRESENCE activates the selectors, so
 * falsy values must render as `undefined` (never `"false"`).
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      variant = 'default',
      compact,
      bordered,
      hoverable = true,
      stickyHeader,
      fillHeight,
      minWidth,
      maxHeight,
      scrollFade,
      wrapperClassName,
      wrapperProps,
      style,
      ...props
    },
    ref
  ) => {
    // Composition guard: sticky positioning resolves against the nearest
    // scrollport. With no height limit the wrapper never scrolls vertically,
    // so the header has nothing to stick to and rides away with the rows.
    if (stickyHeader && maxHeight == null && !fillHeight) {
      warnUsage(
        'Table',
        'sticky-without-height',
        '`stickyHeader` is set but neither `maxHeight` nor `fillHeight` is — the scroll wrapper has no height limit, so nothing scrolls vertically and the header does not stick. Wrapping the table in your own `overflow-auto` box does not work either; pass `maxHeight` here instead.'
      )
    }

    const table = (
      <table
        ref={ref}
        className={cn(
          // border-separate + border-spacing-0 是 cross-browser sticky thead 必須
          // 預設 border-collapse:collapse 在 Chrome 會讓 sticky 失效
          'w-full caption-bottom border-separate border-spacing-0 text-sm',
          bordered && 'border',
          className
        )}
        style={minWidth != null ? { minWidth, ...style } : style}
        data-variant={variant}
        data-compact={compact || undefined}
        data-hoverable={hoverable || undefined}
        data-sticky-header={stickyHeader || undefined}
        {...props}
      />
    )

    // The wrapper is the single scroll container: it owns overflow AND the
    // height limit, so `position: sticky` inside resolves against a scrollport
    // that actually scrolls. Nesting another overflow box around it silently
    // kills stickyHeader.
    const scrollClass = cn('relative w-full', fillHeight && 'h-full', wrapperClassName)
    const { style: wrapperStyle, ...restWrapperProps } = wrapperProps ?? {}
    // Merged rather than spread-over, so wrapperProps.style can't drop maxHeight.
    const scrollStyle = maxHeight != null ? { maxHeight, ...wrapperStyle } : wrapperStyle

    // Fades default on for wide tables (`minWidth`), which are exactly the ones
    // whose hidden columns need advertising.
    if (scrollFade ?? minWidth != null) {
      return (
        <ScrollFade
          className={cn('w-full', fillHeight && 'h-full')}
          scrollClassName={scrollClass}
          style={scrollStyle}
          data-scroll-container=""
          {...restWrapperProps}
        >
          {table}
        </ScrollFade>
      )
    }

    return (
      <div
        className={cn(scrollClass, 'overflow-auto')}
        style={scrollStyle}
        data-scroll-container=""
        {...restWrapperProps}
      >
        {table}
      </div>
    )
  }
)

Table.displayName = 'Table'

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement>

/** Table header section with optional sticky positioning. */
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn(
        // Separator lives on the cells: the table is border-separate (needed
        // for cross-browser sticky headers) and row/row-group borders don't
        // paint in that model
        '[&_th]:border-b',
        /* Sticky header: activated by parent table[data-sticky-header] */
        '[table[data-sticky-header]_&]:bg-background [table[data-sticky-header]_&]:shadow-sticky-header [table[data-sticky-header]_&]:sticky [table[data-sticky-header]_&]:top-0 [table[data-sticky-header]_&]:z-10',
        className
      )}
      {...props}
    />
  )
)

TableHeader.displayName = 'TableHeader'

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement>

/** Table body section containing data rows. */
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child_td]:border-b-0', className)} {...props} />
  )
)

TableBody.displayName = 'TableBody'

export type TableFooterProps = HTMLAttributes<HTMLTableSectionElement>

/** Table footer section for summary or aggregate content. */
export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn('bg-muted/50 font-medium [&_td]:border-t', className)}
      {...props}
    />
  )
)

TableFooter.displayName = 'TableFooter'

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Selected state */
  selected?: boolean
}

/** Table row with hover and selected state styling. */
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors',
        // Hover feedback is opt-in via table[data-hoverable] (Table `hoverable`)
        '[table[data-hoverable]_&:hover]:bg-muted/50',
        // Zebra striping via table[data-variant=striped], body rows only
        '[table[data-variant=striped]_tbody_&:nth-child(even)]:bg-muted/30',
        'data-[state=selected]:bg-muted',
        selected && 'bg-muted',
        className
      )}
      data-state={selected ? 'selected' : undefined}
      {...props}
    />
  )
)

TableRow.displayName = 'TableRow'

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Sortable column */
  sortable?: boolean
  /** Sort direction */
  sortDirection?: 'asc' | 'desc' | null
  /** Text alignment @default "left" */
  align?: TableAlign
  /** Sticky action column — pins to the right edge during horizontal scroll */
  stickyAction?: boolean
  /** Sticky lead column — pins to the left edge during horizontal scroll (e.g. a ticker/name column in a wide table) */
  stickyLead?: boolean
}

/** Table header cell with optional sort indicators and sticky positioning. */
export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      sortable,
      sortDirection,
      align = 'left',
      stickyAction,
      stickyLead,
      children,
      ...props
    },
    ref
  ) => (
    <th
      ref={ref}
      className={cn(
        'text-muted-foreground h-10 px-4 text-left align-middle font-medium',
        '[table[data-compact]_&]:h-8 [table[data-compact]_&]:px-3',
        '[&:has([role=checkbox])]:pr-0',
        alignStyles[align],
        sortable && 'hover:text-foreground cursor-pointer select-none',
        stickyAction && 'bg-background shadow-sticky-left sticky right-0',
        stickyLead && 'bg-background shadow-sticky-right sticky left-0',
        className
      )}
      data-sticky-action={stickyAction || undefined}
      data-sticky-lead={stickyLead || undefined}
      {...props}
    >
      {sortable ? (
        <div className="flex items-center gap-1">
          {children}
          <span className="text-xs">
            {sortDirection === 'asc' && '\u2191'}
            {sortDirection === 'desc' && '\u2193'}
            {!sortDirection && '\u2195'}
          </span>
        </div>
      ) : (
        children
      )}
    </th>
  )
)

TableHead.displayName = 'TableHead'

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Text alignment @default "left" */
  align?: TableAlign
  /** Numeric cell — right-aligned with tabular figures so digit columns line up */
  numeric?: boolean
  /** Sticky action column — pins to the right edge during horizontal scroll */
  stickyAction?: boolean
  /** Sticky lead column — pins to the left edge during horizontal scroll (e.g. a ticker/name column in a wide table) */
  stickyLead?: boolean
}

/** Table data cell with optional alignment, numeric formatting, and sticky columns. */
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', numeric, stickyAction, stickyLead, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        // Row separator lives here — tr borders don't paint under border-separate
        'border-b p-4 align-middle [&:has([role=checkbox])]:pr-0',
        '[table[data-compact]_&]:px-3 [table[data-compact]_&]:py-2',
        alignStyles[align],
        numeric && 'text-right tabular-nums',
        stickyAction && 'bg-background shadow-sticky-left sticky right-0',
        stickyLead && 'bg-background shadow-sticky-right sticky left-0',
        className
      )}
      data-sticky-action={stickyAction || undefined}
      data-sticky-lead={stickyLead || undefined}
      {...props}
    />
  )
)

TableCell.displayName = 'TableCell'

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement>

/** Table caption displayed below the table. */
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('text-muted-foreground mt-4 text-sm', className)} {...props} />
  )
)

TableCaption.displayName = 'TableCaption'

/**
 * Auto colSpan: count the header cells of the enclosing table once mounted.
 * An explicit colSpan skips measuring (use it when columns change at runtime).
 */
function useAutoColSpan(explicit?: number) {
  const ref = useRef<HTMLTableCellElement>(null)
  const [measured, setMeasured] = useState(1)
  useLayoutEffect(() => {
    if (explicit != null) return
    const table = ref.current?.closest('table')
    const headerRow = table?.querySelector('thead tr')
    const count = headerRow?.children.length ?? 0
    if (count > 0) setMeasured(count)
  }, [explicit])
  return { ref, colSpan: explicit ?? measured }
}

export interface TableEmptyProps {
  /** Span — measured from the header row when omitted */
  colSpan?: number
  /** Custom empty content — defaults to the locale's empty message */
  children?: ReactNode
  className?: string
}

/** Full-width empty-state row for the Table family (colSpan handled for you). */
export function TableEmpty({ colSpan, children, className }: TableEmptyProps) {
  const locale = useLocale()
  const auto = useAutoColSpan(colSpan)
  return (
    <TableRow>
      <TableCell
        ref={auto.ref}
        colSpan={auto.colSpan}
        className={cn('text-muted-foreground h-24 text-center', className)}
      >
        {children ?? locale.dataTable.emptyMessage}
      </TableCell>
    </TableRow>
  )
}

export interface TableLoadingProps {
  /** Span — measured from the header row when omitted */
  colSpan?: number
  /** Custom label — defaults to the locale's loading message */
  children?: ReactNode
  className?: string
}

/** Full-width loading row for the Table family (colSpan handled for you). */
export function TableLoading({ colSpan, children, className }: TableLoadingProps) {
  const locale = useLocale()
  const auto = useAutoColSpan(colSpan)
  return (
    <TableRow>
      <TableCell
        ref={auto.ref}
        colSpan={auto.colSpan}
        className={cn('h-24 text-center', className)}
      >
        <div className="flex items-center justify-center gap-2">
          <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="text-muted-foreground">{children ?? locale.dataTable.loading}</span>
        </div>
      </TableCell>
    </TableRow>
  )
}
