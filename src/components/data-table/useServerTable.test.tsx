import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { useState } from 'react'
import { DataTable, type Column } from './DataTable'
import { useServerTable } from './useServerTable'

describe('useServerTable', () => {
  it('starts from the defaults', () => {
    const { result } = renderHook(() => useServerTable())
    expect(result.current.query).toEqual({ page: 1, pageSize: 10, sort: null, filters: {} })
  })

  it('honors initial options', () => {
    const { result } = renderHook(() =>
      useServerTable({
        initialPage: 3,
        initialPageSize: 50,
        initialSort: { key: 'name', direction: 'asc' },
        initialFilters: { role: ['admin'] },
      })
    )
    expect(result.current.query).toEqual({
      page: 3,
      pageSize: 50,
      sort: { key: 'name', direction: 'asc' },
      filters: { role: ['admin'] },
    })
  })

  it('setPage updates only the page', () => {
    const { result } = renderHook(() => useServerTable())
    act(() => result.current.setPage(4))
    expect(result.current.query.page).toBe(4)
    expect(result.current.query.pageSize).toBe(10)
  })

  it('setPageSize, setSort and setFilters reset to page 1', () => {
    const { result } = renderHook(() => useServerTable({ initialPage: 5 }))

    act(() => result.current.setPageSize(50))
    expect(result.current.query).toMatchObject({ page: 1, pageSize: 50 })

    act(() => result.current.setPage(5))
    act(() => result.current.setSort({ key: 'age', direction: 'desc' }))
    expect(result.current.query).toMatchObject({ page: 1, sort: { key: 'age', direction: 'desc' } })

    act(() => result.current.setPage(5))
    act(() => result.current.setFilters({ role: ['admin'] }))
    expect(result.current.query).toMatchObject({ page: 1, filters: { role: ['admin'] } })
  })

  it('reset returns to the initial query', () => {
    const { result } = renderHook(() => useServerTable({ initialPageSize: 20 }))
    act(() => {
      result.current.setPage(3)
      result.current.setFilters({ role: ['admin'] })
    })
    act(() => result.current.reset())
    expect(result.current.query).toEqual({ page: 1, pageSize: 20, sort: null, filters: {} })
  })

  it('queryKey is insensitive to filter key insertion order', () => {
    const { result: a } = renderHook(() => useServerTable())
    const { result: b } = renderHook(() => useServerTable())
    act(() => a.current.setFilters({ role: ['admin'], status: ['active'] }))
    act(() => b.current.setFilters({ status: ['active'], role: ['admin'] }))
    expect(a.current.queryKey).toBe(b.current.queryKey)
  })

  it('queryKey changes when the query changes', () => {
    const { result } = renderHook(() => useServerTable())
    const before = result.current.queryKey
    act(() => result.current.setPage(2))
    expect(result.current.queryKey).not.toBe(before)
  })

  // ─── Integration with DataTable server mode ───

  interface Row {
    id: number
    name: string
  }

  const columns: Column<Row>[] = [{ key: 'name', header: 'Name', sortable: true }]

  function ServerTableHarness() {
    const table = useServerTable()
    // A fake "server": 25 rows total, slice per query (sync, for the test)
    const [rows] = useState<Row[]>(() =>
      Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }))
    )
    const start = (table.query.page - 1) * table.query.pageSize
    const pageRows = rows.slice(start, start + table.query.pageSize)
    return (
      <DataTable
        columns={columns}
        data={pageRows}
        getRowKey={(r) => r.id}
        totalRows={rows.length}
        {...table.props}
      />
    )
  }

  it('wires DataTable server mode end-to-end: paging fetches the next slice', async () => {
    const user = userEvent.setup()
    render(<ServerTableHarness />)
    expect(screen.getByText('User 1')).toBeInTheDocument()
    expect(screen.getByText(/1-10 of 25/)).toBeInTheDocument()

    await user.click(screen.getByLabelText('Next page'))
    expect(screen.getByText('User 11')).toBeInTheDocument()
    expect(screen.queryByText(/^User 1$/)).not.toBeInTheDocument()
    expect(screen.getByText(/11-20 of 25/)).toBeInTheDocument()
  })

  it('wires the rows-per-page selector (onPageSizeChange provided by the hook)', async () => {
    const user = userEvent.setup()
    render(<ServerTableHarness />)
    await user.selectOptions(screen.getByLabelText('Rows per page:'), '20')
    expect(screen.getByText(/1-20 of 25/)).toBeInTheDocument()
    expect(screen.getByText('User 20')).toBeInTheDocument()
  })

  it('sorting through DataTable resets to page 1', async () => {
    const user = userEvent.setup()
    render(<ServerTableHarness />)
    await user.click(screen.getByLabelText('Next page'))
    expect(screen.getByText(/11-20 of 25/)).toBeInTheDocument()
    await user.click(screen.getByLabelText('Sort by Name'))
    expect(screen.getByText(/1-10 of 25/)).toBeInTheDocument()
  })
})
