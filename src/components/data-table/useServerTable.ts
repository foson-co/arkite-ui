import { useCallback, useMemo, useState } from 'react'
import type { SortState } from './DataTable'

export interface ServerTableQuery {
  /** Current page, 1-based */
  page: number
  /** Rows per page */
  pageSize: number
  /** Active sort, `null` for none */
  sort: SortState | null
  /** Active column filters (column key → selected values) */
  filters: Record<string, string[]>
}

export interface UseServerTableOptions {
  /** Initial page, 1-based @default 1 */
  initialPage?: number
  /** Initial rows per page @default 10 */
  initialPageSize?: number
  /** Initial sort @default null */
  initialSort?: SortState | null
  /** Initial column filters @default {} */
  initialFilters?: Record<string, string[]>
}

export interface UseServerTableResult {
  /** Current query state — feed this to your fetcher */
  query: ServerTableQuery
  /**
   * Stable serialization of `query` — use as the dependency of the effect
   * (or SWR/React Query key) that fetches the page.
   */
  queryKey: string
  /**
   * Controlled-state props for `<DataTable>` server mode. Spread them and add
   * your own `data` + `totalRows`:
   *
   * ```tsx
   * <DataTable data={page.items} totalRows={page.total} {...table.props} />
   * ```
   */
  props: {
    page: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
    sortState: SortState | null
    onSortChange: (sort: SortState | null) => void
    filters: Record<string, string[]>
    onFilterChange: (filters: Record<string, string[]>) => void
  }
  setPage: (page: number) => void
  /** Also resets to page 1 (the old page number is meaningless at a new size) */
  setPageSize: (pageSize: number) => void
  /** Also resets to page 1 */
  setSort: (sort: SortState | null) => void
  /** Also resets to page 1 */
  setFilters: (filters: Record<string, string[]>) => void
  /** Back to the initial query */
  reset: () => void
}

/**
 * State helper for `<DataTable>` server-side mode (`totalRows`).
 *
 * Pure client state — no fetching. It owns the six controlled props server
 * mode needs (`page`/`onPageChange`, `onPageSizeChange`, `sortState`/
 * `onSortChange`, `filters`/`onFilterChange`) and exposes them pre-wired via
 * `props`, so the consumer only supplies `data` and `totalRows`:
 *
 * ```tsx
 * const table = useServerTable({ initialPageSize: 20 })
 * useEffect(() => {
 *   fetchUsers(table.query).then(setPage)
 * }, [table.queryKey])
 * return <DataTable columns={columns} data={page.items} totalRows={page.total} {...table.props} />
 * ```
 *
 * Sort and filter changes reset the page to 1 — page N of a differently
 * sorted or filtered result set is a different page N.
 */
export function useServerTable(options: UseServerTableOptions = {}): UseServerTableResult {
  const { initialPage = 1, initialPageSize = 10, initialSort = null, initialFilters } = options

  const initialQuery = useMemo<ServerTableQuery>(
    () => ({
      page: initialPage,
      pageSize: initialPageSize,
      sort: initialSort,
      filters: initialFilters ?? {},
    }),
    // Initial values are read once — later option changes don't clobber live state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  const [query, setQuery] = useState<ServerTableQuery>(initialQuery)

  const setPage = useCallback((page: number) => {
    setQuery((prev) => (prev.page === page ? prev : { ...prev, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setQuery((prev) => (prev.pageSize === pageSize ? prev : { ...prev, pageSize, page: 1 }))
  }, [])

  const setSort = useCallback((sort: SortState | null) => {
    setQuery((prev) => ({ ...prev, sort, page: 1 }))
  }, [])

  const setFilters = useCallback((filters: Record<string, string[]>) => {
    setQuery((prev) => ({ ...prev, filters, page: 1 }))
  }, [])

  const reset = useCallback(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const queryKey = useMemo(() => {
    const filterKeys = Object.keys(query.filters).sort()
    return JSON.stringify({
      page: query.page,
      pageSize: query.pageSize,
      sort: query.sort,
      filters: filterKeys.map((k) => [k, query.filters[k]]),
    })
  }, [query])

  const props = useMemo(
    () => ({
      page: query.page,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
      sortState: query.sort,
      onSortChange: setSort,
      filters: query.filters,
      onFilterChange: setFilters,
    }),
    [query, setPage, setPageSize, setSort, setFilters]
  )

  return { query, queryKey, props, setPage, setPageSize, setSort, setFilters, reset }
}
