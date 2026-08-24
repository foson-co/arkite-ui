import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { __resetWarnings } from '../../utils/deprecate'
import { DataTable, type Column } from './DataTable'
import { Card, CardContent } from '../card/Card'

interface TestRow {
  id: number
  name: string
  age: number
}

interface FilterTestRow {
  id: number
  name: string
  role: string
  status: string
}

const columns: Column<TestRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true },
]

const data: TestRow[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows empty content when data is empty', () => {
    render(<DataTable<TestRow> columns={columns} data={[]} emptyContent="No data" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('shows default empty message', () => {
    render(<DataTable<TestRow> columns={columns} data={[]} />)
    expect(screen.getByText('No results found.')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<DataTable<TestRow> columns={columns} data={[]} loading />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('sorts data when column header is clicked', async () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />)

    // Click Age to sort ascending (25, 30, 35)
    await userEvent.click(screen.getByText('Age'))

    // Get all table cells - check the order of age values
    const cells = screen.getAllByRole('cell')
    // cells are: [name, age, name, age, name, age]
    const ageValues = cells.filter((_, i) => i % 2 === 1).map((c) => c.textContent)
    expect(ageValues).toEqual(['25', '30', '35'])

    // Click Age again to sort descending (35, 30, 25)
    await userEvent.click(screen.getByText('Age'))
    const cells2 = screen.getAllByRole('cell')
    const ageValues2 = cells2.filter((_, i) => i % 2 === 1).map((c) => c.textContent)
    expect(ageValues2).toEqual(['35', '30', '25'])
  })

  it('handles row click', async () => {
    const onRowClick = vi.fn()
    render(
      <DataTable columns={columns} data={data} getRowKey={(r) => r.id} onRowClick={onRowClick} />
    )
    await userEvent.click(screen.getByText('Bob'))
    expect(onRowClick).toHaveBeenCalledWith(data[1], expect.any(Number))
  })

  it('hides hidden columns', () => {
    const cols: Column<TestRow>[] = [
      { key: 'name', header: 'Name' },
      { key: 'age', header: 'Age', hidden: true },
    ]
    render(<DataTable columns={cols} data={data} getRowKey={(r) => r.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    // Age header should not be rendered
    expect(screen.queryByRole('columnheader', { name: 'Age' })).not.toBeInTheDocument()
  })

  it('renders custom cell', () => {
    const cols: Column<TestRow>[] = [
      { key: 'name', header: 'Name', cell: (row) => <strong>{row.name}!</strong> },
    ]
    render(<DataTable columns={cols} data={data} getRowKey={(r) => r.id} />)
    expect(screen.getByText('Alice!')).toBeInTheDocument()
  })

  // ─── Selection Tests ───

  it('renders checkboxes when selectable', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set()}
        onSelectionChange={() => {}}
        pagination={false}
      />
    )
    // 1 header checkbox + 3 row checkboxes
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)
  })

  it('does not render checkboxes when not selectable', () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('toggles a single row selection', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set()}
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )
    // Click the second row checkbox (index 1 = "Select row 2")
    await user.click(screen.getByLabelText('Select row 2'))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([2]))
  })

  it('deselects a selected row', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set([2])}
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Select row 2'))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set())
  })

  it('selects all rows on header checkbox click', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set()}
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Select all rows'))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([1, 2, 3]))
  })

  it('deselects all rows when all are selected', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set([1, 2, 3])}
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Select all rows'))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set())
  })

  it('shows indeterminate state when some rows selected', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set([1])}
        onSelectionChange={() => {}}
        pagination={false}
      />
    )
    const headerCheckbox = screen.getByLabelText('Select all rows')
    expect(headerCheckbox).toHaveAttribute('aria-checked', 'mixed')
  })

  it('highlights selected rows', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set([2])}
        onSelectionChange={() => {}}
        pagination={false}
      />
    )
    const rows = screen.getAllByRole('row')
    // rows[0] = header, rows[1] = Alice (id:1), rows[2] = Bob (id:2)
    expect(rows[2]).toHaveAttribute('data-selected', 'true')
    expect(rows[1]).not.toHaveAttribute('data-selected')
  })

  it('paginates data with default page size', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      age: 20 + i,
    }))
    render(
      <DataTable columns={columns} data={largeData} defaultPageSize={10} getRowKey={(r) => r.id} />
    )
    // Should show 10 data rows + 1 header row
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(11)
    // Should show pagination info
    expect(screen.getByText(/1-10 of 25/)).toBeInTheDocument()
  })

  // ─── Expandable Row Tests ───

  it('renders expand buttons when renderExpandedRow is provided', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        renderExpandedRow={(row) => <div>Details for {row.name}</div>}
        pagination={false}
      />
    )
    const expandButtons = screen.getAllByLabelText('Expand row')
    expect(expandButtons).toHaveLength(3)
  })

  it('expands a row when expand button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        expandable
        renderExpandedRow={(row) => <div>Details for {row.name}</div>}
        pagination={false}
      />
    )

    // Initially no expanded content
    expect(screen.queryByText('Details for Alice')).not.toBeInTheDocument()

    // Click expand on the first row
    const expandButtons = screen.getAllByLabelText('Expand row')
    await user.click(expandButtons[0])

    expect(screen.getByText('Details for Alice')).toBeInTheDocument()
    // The button should now say "Collapse row"
    expect(screen.getByLabelText('Collapse row')).toBeInTheDocument()
  })

  it('collapses an expanded row when clicked again', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        renderExpandedRow={(row) => <div>Details for {row.name}</div>}
        pagination={false}
      />
    )

    const expandButtons = screen.getAllByLabelText('Expand row')
    await user.click(expandButtons[0])
    expect(screen.getByText('Details for Alice')).toBeInTheDocument()

    // Click again to collapse
    await user.click(screen.getByLabelText('Collapse row'))
    expect(screen.queryByText('Details for Alice')).not.toBeInTheDocument()
  })

  it('does not render expand buttons when expandable is not provided', () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />)
    expect(screen.queryByLabelText('Expand row')).not.toBeInTheDocument()
  })

  it('expandable={false} disables expansion even with renderExpandedRow', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        expandable={false}
        renderExpandedRow={(row) => <div>Details for {row.name}</div>}
        pagination={false}
      />
    )
    expect(screen.queryByLabelText('Expand row')).not.toBeInTheDocument()
  })

  it('still supports the deprecated expandable(fn) form and warns', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        expandable={(row) => <div>Details for {row.name}</div>}
        pagination={false}
      />
    )

    await user.click(screen.getAllByLabelText('Expand row')[0])
    expect(screen.getByText('Details for Alice')).toBeInTheDocument()
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('`expandable(fn)` is deprecated'))
    warnSpy.mockRestore()
  })

  it('prefers renderExpandedRow over deprecated expandable(fn) when both provided', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        expandable={(row) => <div>Old details for {row.name}</div>}
        renderExpandedRow={(row) => <div>New details for {row.name}</div>}
        pagination={false}
      />
    )

    await user.click(screen.getAllByLabelText('Expand row')[0])
    expect(screen.getByText('New details for Alice')).toBeInTheDocument()
    expect(screen.queryByText('Old details for Alice')).not.toBeInTheDocument()
  })

  // ─── Controlled Sort Tests ───

  it('notifies onSortChange when sorting uncontrolled', async () => {
    const onSortChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        onSortChange={onSortChange}
        pagination={false}
      />
    )
    await userEvent.click(screen.getByText('Age'))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'age', direction: 'asc' })
  })

  it('renders sorted by controlled sortState', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        sortState={{ key: 'age', direction: 'desc' }}
        pagination={false}
      />
    )
    const cells = screen.getAllByRole('cell')
    const ageValues = cells.filter((_, i) => i % 2 === 1).map((c) => c.textContent)
    expect(ageValues).toEqual(['35', '30', '25'])
  })

  it('controlled sortState does not change on click, only fires onSortChange', async () => {
    const onSortChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        sortState={{ key: 'age', direction: 'desc' }}
        onSortChange={onSortChange}
        pagination={false}
      />
    )
    await userEvent.click(screen.getByText('Age'))
    // desc → next step is "no sort"
    expect(onSortChange).toHaveBeenCalledWith(null)
    // Display unchanged (still controlled desc)
    const cells = screen.getAllByRole('cell')
    const ageValues = cells.filter((_, i) => i % 2 === 1).map((c) => c.textContent)
    expect(ageValues).toEqual(['35', '30', '25'])
  })

  it('sortState={null} renders unsorted', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        sortState={null}
        pagination={false}
      />
    )
    const cells = screen.getAllByRole('cell')
    const ageValues = cells.filter((_, i) => i % 2 === 1).map((c) => c.textContent)
    expect(ageValues).toEqual(['30', '25', '35'])
  })

  // ─── Controlled Filter Tests ───

  it('renders filtered by controlled filters', () => {
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        filters={{ role: ['Admin'] }}
        pagination={false}
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Eve')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('controlled filters do not change on toggle, only fire onFilterChange', async () => {
    const user = userEvent.setup()
    const onFilterChange = vi.fn()
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        filters={{ role: ['Admin'] }}
        onFilterChange={onFilterChange}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Filter Role'))
    await user.click(within(screen.getByTestId('filter-dropdown-role')).getByText('Editor'))

    expect(onFilterChange).toHaveBeenCalledWith({ role: ['Admin', 'Editor'] })
    // Display unchanged — still only Admin rows
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  // ─── Controlled Page Tests ───

  const pagedData = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + i,
  }))

  it('notifies onPageChange (1-based) when paging uncontrolled', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={pagedData}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        onPageChange={onPageChange}
      />
    )
    await user.click(screen.getByLabelText('Next page'))
    expect(onPageChange).toHaveBeenCalledWith(2)
    // Uncontrolled — page advanced
    expect(screen.getByText(/11-20 of 25/)).toBeInTheDocument()
  })

  it('renders controlled page (1-based)', () => {
    render(
      <DataTable
        columns={columns}
        data={pagedData}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={2}
        onPageChange={() => {}}
      />
    )
    expect(screen.getByText(/11-20 of 25/)).toBeInTheDocument()
    expect(screen.getByText('User 11')).toBeInTheDocument()
    expect(screen.queryByText('User 1')).not.toBeInTheDocument()
  })

  it('controlled page does not change on click, only fires onPageChange', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={pagedData}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={2}
        onPageChange={onPageChange}
      />
    )
    await user.click(screen.getByLabelText('Next page'))
    expect(onPageChange).toHaveBeenCalledWith(3)
    // Display unchanged (still controlled page 2)
    expect(screen.getByText(/11-20 of 25/)).toBeInTheDocument()
  })

  // ─── Server-Side Mode Tests (totalRows) ───

  // One server page (rows 21-30 of 47) — deliberately NOT sorted the way a
  // client-side sort of this slice would order them.
  const serverPage: TestRow[] = Array.from({ length: 10 }, (_, i) => ({
    id: 21 + i,
    name: `User ${21 + i}`,
    age: 60 - i,
  }))

  it('totalRows renders data as-is without client-side slicing', () => {
    render(
      <DataTable
        columns={columns}
        data={serverPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={3}
        onPageChange={() => {}}
        totalRows={47}
      />
    )
    // All 10 given rows render even though page=3 (no slice(20, 30) on them)
    expect(screen.getByText('User 21')).toBeInTheDocument()
    expect(screen.getByText('User 30')).toBeInTheDocument()
    // Range info and page count derive from totalRows, not data.length
    expect(screen.getByText(/21-30 of 47/)).toBeInTheDocument()
    expect(screen.getByText('3 / 5')).toBeInTheDocument()
  })

  it('totalRows skips client-side sorting (server already sorted)', () => {
    render(
      <DataTable
        columns={columns}
        data={serverPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={3}
        onPageChange={() => {}}
        sortState={{ key: 'age', direction: 'asc' }}
        onSortChange={() => {}}
        totalRows={47}
      />
    )
    // Server order preserved: ages descend in the given slice even though
    // sortState says asc — the table must not re-sort server data
    const rows = screen.getAllByRole('row').slice(1) // skip header
    expect(within(rows[0]).getByText('User 21')).toBeInTheDocument()
    expect(within(rows[9]).getByText('User 30')).toBeInTheDocument()
  })

  it('totalRows enables paging past the fetched rows', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={serverPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={3}
        onPageChange={onPageChange}
        totalRows={47}
      />
    )
    // With only 10 rows client-side, next page must still be reachable
    await user.click(screen.getByLabelText('Next page'))
    expect(onPageChange).toHaveBeenCalledWith(4)
    await user.click(screen.getByLabelText('Last page'))
    expect(onPageChange).toHaveBeenCalledWith(5)
  })

  it('totalRows shows a shorter last page correctly', () => {
    const lastPage = Array.from({ length: 7 }, (_, i) => ({
      id: 41 + i,
      name: `User ${41 + i}`,
      age: 20 + i,
    }))
    render(
      <DataTable
        columns={columns}
        data={lastPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={5}
        onPageChange={() => {}}
        totalRows={47}
      />
    )
    expect(screen.getByText(/41-47 of 47/)).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('totalRows hides the rows-per-page selector unless onPageSizeChange is provided', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={serverPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={3}
        onPageChange={() => {}}
        totalRows={47}
      />
    )
    // Without a callback the selector could only change the footer math, not
    // the rows — so it must not render
    expect(screen.queryByLabelText('Rows per page:')).not.toBeInTheDocument()

    const onPageSizeChange = vi.fn()
    rerender(
      <DataTable
        columns={columns}
        data={serverPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={3}
        onPageChange={() => {}}
        onPageSizeChange={onPageSizeChange}
        totalRows={47}
      />
    )
    await user.selectOptions(screen.getByLabelText('Rows per page:'), '50')
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })

  it('totalRows hides the pagination footer while data is empty (loading)', () => {
    render(
      <DataTable<TestRow>
        columns={columns}
        data={[]}
        getRowKey={(r) => r.id}
        loading
        defaultPageSize={10}
        page={1}
        onPageChange={() => {}}
        totalRows={47}
      />
    )
    // No rows rendered → no "1-10 of 47" claim
    expect(screen.queryByText(/1-10 of 47/)).not.toBeInTheDocument()
  })

  it('totalRows only renders column filters when controlled and filterOptions provided', () => {
    const filterableColumns: Column<TestRow>[] = [
      { key: 'name', header: 'Name', filterable: true },
      { key: 'age', header: 'Age' },
    ]
    const { rerender } = render(
      <DataTable
        columns={filterableColumns}
        data={serverPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={3}
        onPageChange={() => {}}
        totalRows={47}
      />
    )
    // Uncontrolled filter in server mode would do nothing but reset the page
    expect(screen.queryByLabelText('Filter Name')).not.toBeInTheDocument()

    rerender(
      <DataTable
        columns={[
          { key: 'name', header: 'Name', filterable: true, filterOptions: ['User 1', 'User 21'] },
          { key: 'age', header: 'Age' },
        ]}
        data={serverPage}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        page={3}
        onPageChange={() => {}}
        filters={{}}
        onFilterChange={() => {}}
        totalRows={47}
      />
    )
    expect(screen.getByLabelText('Filter Name')).toBeInTheDocument()
  })

  it('totalRows without a controlled page warns in dev', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      render(
        <DataTable
          columns={columns}
          data={serverPage}
          getRowKey={(r) => r.id}
          defaultPageSize={10}
          totalRows={47}
        />
      )
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('controlled `page`'))
    } finally {
      warnSpy.mockRestore()
    }
  })

  it('onPageSizeChange also fires in client-side mode', async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
        onPageSizeChange={onPageSizeChange}
      />
    )
    await user.selectOptions(screen.getByLabelText('Rows per page:'), '20')
    expect(onPageSizeChange).toHaveBeenCalledWith(20)
  })

  // ─── Round-2 feedback: incremental selection, per-row disable, hoverable ───

  it('onRowSelect fires per changed row (single toggle and select-all)', async () => {
    const user = userEvent.setup()
    const onRowSelect = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set([1])}
        onSelectionChange={() => {}}
        onRowSelect={onRowSelect}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Select row 2'))
    expect(onRowSelect).toHaveBeenCalledWith(data[1], true)
    onRowSelect.mockClear()
    // Select-all: rows 2 and 3 flip on; row 1 (already selected) must NOT fire
    await user.click(screen.getByLabelText('Select all rows'))
    expect(onRowSelect).toHaveBeenCalledTimes(2)
    expect(onRowSelect).toHaveBeenCalledWith(data[1], true)
    expect(onRowSelect).toHaveBeenCalledWith(data[2], true)
  })

  it('isRowSelectable disables the checkbox and excludes the row from select-all', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set()}
        onSelectionChange={onSelectionChange}
        isRowSelectable={(r) => r.name !== 'Bob'}
        pagination={false}
      />
    )
    expect(screen.getByLabelText('Select row 2')).toBeDisabled()
    await user.click(screen.getByLabelText('Select all rows'))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([1, 3]))
  })

  it('hoverable={false} passes through to the underlying Table', () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} hoverable={false} />)
    expect(screen.getByRole('table')).not.toHaveAttribute('data-hoverable')
  })

  // ─── Density / row styling (ark-finance feedback 3.1, 3.3) ───

  it('passes hoverable and compact through to the underlying Table', () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} compact />)
    const table = screen.getByRole('table')
    expect(table).toHaveAttribute('data-hoverable', 'true')
    expect(table).toHaveAttribute('data-compact', 'true')
  })

  it('rowClassName as function styles rows conditionally', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        rowClassName={(row) => (row.name === 'Bob' ? 'opacity-60' : '')}
      />
    )
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[1]).toHaveClass('opacity-60')
    expect(rows[0]).not.toHaveClass('opacity-60')
  })

  it('rowClassName as string applies to every body row', () => {
    render(
      <DataTable columns={columns} data={data} getRowKey={(r) => r.id} rowClassName="text-xs" />
    )
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows.every((r) => r.classList.contains('text-xs'))).toBe(true)
  })

  // ark-finance feedback: cell-level classes and responsive hiding were the
  // root causes behind negative-margin hacks and a JS media-query workaround
  it('cellClassName / headerClassName reach the right cells', () => {
    render(
      <DataTable
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        columns={[
          {
            key: 'name',
            header: 'Name',
            headerClassName: 'bg-muted',
            cellClassName: (row) => (row.age > 30 ? 'text-destructive' : ''),
          },
          { key: 'age', header: 'Age' },
        ]}
      />
    )
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveClass('bg-muted')
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[2]).getAllByRole('cell')[0]).toHaveClass('text-destructive') // Charlie, 35
    expect(within(rows[0]).getAllByRole('cell')[0]).not.toHaveClass('text-destructive')
  })

  it('cellStyle carries continuous values class strings cannot (heatmap alpha)', () => {
    render(
      <DataTable
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        columns={[
          {
            key: 'age',
            header: 'Age',
            // Continuous alpha computed from the row — the cellClassName-can't case
            cellStyle: (row) => ({ backgroundColor: `rgba(106, 77, 255, ${row.age / 100})` }),
          },
        ]}
      />
    )
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getAllByRole('cell')[0]).toHaveStyle({
      backgroundColor: 'rgba(106, 77, 255, 0.3)',
    })
    expect(within(rows[2]).getAllByRole('cell')[0]).toHaveStyle({
      backgroundColor: 'rgba(106, 77, 255, 0.35)',
    })
  })

  it('headerStyle merges with the width style (e.g. vertical writing mode)', () => {
    render(
      <DataTable
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        columns={[
          { key: 'name', header: 'Name', width: 80, headerStyle: { writingMode: 'vertical-rl' } },
        ]}
      />
    )
    const head = screen.getByRole('columnheader', { name: 'Name' })
    expect(head).toHaveStyle({ width: '80px', writingMode: 'vertical-rl' })
  })

  it("hidden:'mobile' keeps the column rendered but hides it below md via CSS", () => {
    render(
      <DataTable
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'age', header: 'Age', hidden: 'mobile' },
        ]}
      />
    )
    const ageHead = screen.getByRole('columnheader', { name: 'Age' })
    expect(ageHead).toHaveClass('max-md:hidden')
    const firstRowCells = screen.getAllByRole('row')[1].querySelectorAll('td')
    expect(firstRowCells[1]).toHaveClass('max-md:hidden')
  })

  it('hidden:true still removes the column entirely', () => {
    render(
      <DataTable
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'age', header: 'Age', hidden: true },
        ]}
      />
    )
    expect(screen.queryByRole('columnheader', { name: 'Age' })).not.toBeInTheDocument()
  })

  it('infers T from data for inline columns (NoInfer) — compile-level check', () => {
    // No <TestRow> annotation: `row` must be typed from `data`
    render(
      <DataTable
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        columns={[{ key: 'name', header: 'Name', cell: (row) => row.name.toUpperCase() }]}
      />
    )
    expect(screen.getByText('ALICE')).toBeInTheDocument()
  })

  it('Column.pinned pins header and body cells left/right', () => {
    const pinnedColumns: Column<TestRow>[] = [
      { key: 'name', header: 'Name', pinned: 'left' },
      { key: 'age', header: 'Age', pinned: 'right' },
    ]
    render(<DataTable columns={pinnedColumns} data={data} getRowKey={(r) => r.id} />)
    const [nameHead, ageHead] = screen.getAllByRole('columnheader')
    expect(nameHead).toHaveClass('sticky', 'left-0')
    expect(ageHead).toHaveClass('sticky', 'right-0')
    const firstRowCells = screen.getAllByRole('cell').slice(0, 2)
    expect(firstRowCells[0]).toHaveClass('sticky', 'left-0')
    expect(firstRowCells[1]).toHaveClass('sticky', 'right-0')
  })

  // ─── Uncontrolled Selection Tests ───

  it('defaultSelectedRows sets initial uncontrolled selection', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        defaultSelectedRows={new Set([2])}
        pagination={false}
      />
    )
    const rows = screen.getAllByRole('row')
    // rows[0] = header, rows[2] = Bob (id:2)
    expect(rows[2]).toHaveAttribute('data-selected', 'true')
  })

  it('updates uncontrolled selection on click and fires onSelectionChange', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        defaultSelectedRows={new Set([2])}
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Select row 1'))
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([2, 1]))
    // Internal state updated without a controlled selectedRows prop
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveAttribute('data-selected', 'true')
    expect(rows[2]).toHaveAttribute('data-selected', 'true')
  })

  it('controlled selectedRows overrides defaultSelectedRows', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        selectedRows={new Set()}
        defaultSelectedRows={new Set([2])}
        onSelectionChange={() => {}}
        pagination={false}
      />
    )
    const rows = screen.getAllByRole('row')
    expect(rows[2]).not.toHaveAttribute('data-selected')
  })

  // ─── Column Toggle Tests ───

  it('renders column toggle button when columnToggle is true', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        columnToggle
        pagination={false}
      />
    )
    expect(screen.getByLabelText('Toggle columns')).toBeInTheDocument()
  })

  it('toggles column visibility via column toggle dropdown', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        columnToggle
        pagination={false}
      />
    )

    // Both columns visible — age values appear
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()

    // Open dropdown
    await user.click(screen.getByLabelText('Toggle columns'))

    // The dropdown has two items: Name and Age. Find the one that contains 'Age' text
    // and is a button inside the dropdown (not the table header button)
    const dropdownButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.textContent?.trim() === 'Age' && !btn.closest('thead'))
    await user.click(dropdownButtons[0])

    // Age column should be hidden — age values should not appear
    expect(screen.queryByText('30')).not.toBeInTheDocument()
    expect(screen.queryByText('25')).not.toBeInTheDocument()
    // Name column still visible
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('does not render column toggle when columnToggle is false', () => {
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />)
    expect(screen.queryByLabelText('Toggle columns')).not.toBeInTheDocument()
  })

  // ─── Sticky Header Tests ───

  it('applies sticky header attribute to table when stickyHeader is true', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        stickyHeader
        maxHeight="400px"
        pagination={false}
      />
    )
    const table = container.querySelector('table')
    expect(table).toHaveAttribute('data-sticky-header', 'true')
  })

  it('applies maxHeight style to scroll container when stickyHeader is true', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        stickyHeader
        maxHeight="400px"
        pagination={false}
      />
    )
    const scrollContainer = screen.getByTestId('sticky-scroll-container')
    expect(scrollContainer.style.maxHeight).toBe('400px')
    expect(scrollContainer.className).toContain('overflow-auto')
  })

  // Regression: DataTable used to wrap Table's own `overflow-auto` wrapper in a
  // second `overflow-auto` box that carried maxHeight. Nested scrollports make
  // the sticky thead resolve against the inner box — which never scrolls
  // vertically — so the header scrolled away with the rows (verified in
  // Chromium: header offset went 0 → -300 after a 300px scroll).
  it('keeps a single scroll container so the sticky header has something to stick to', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        stickyHeader
        maxHeight="400px"
        pagination={false}
      />
    )
    const scrollers = container.querySelectorAll('[data-scroll-container]')
    expect(scrollers).toHaveLength(1)
    expect((scrollers[0] as HTMLElement).style.maxHeight).toBe('400px')
  })

  it('forwards minWidth to the table so pinned columns can engage', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        minWidth={960}
        pagination={false}
      />
    )
    expect(container.querySelector('table')!.style.minWidth).toBe('960px')
  })

  it('does not apply sticky styles when stickyHeader is false', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />
    )
    const table = container.querySelector('table')
    expect(table).not.toHaveAttribute('data-sticky-header')
    expect(screen.queryByTestId('sticky-scroll-container')).not.toBeInTheDocument()
  })

  // ─── Column Filtering Tests ───

  const filterData: FilterTestRow[] = [
    { id: 1, name: 'Alice', role: 'Admin', status: 'active' },
    { id: 2, name: 'Bob', role: 'Editor', status: 'active' },
    { id: 3, name: 'Carol', role: 'Viewer', status: 'inactive' },
    { id: 4, name: 'David', role: 'Editor', status: 'active' },
    { id: 5, name: 'Eve', role: 'Admin', status: 'inactive' },
  ]

  const filterColumns: Column<FilterTestRow>[] = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role', filterable: true },
    { key: 'status', header: 'Status', filterable: true },
  ]

  it('renders filter icon when column.filterable is true', () => {
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        pagination={false}
      />
    )
    expect(screen.getByLabelText('Filter Role')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter Status')).toBeInTheDocument()
    // Name column is not filterable
    expect(screen.queryByLabelText('Filter Name')).not.toBeInTheDocument()
  })

  it('opens filter dropdown on icon click', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Filter Role'))
    const dropdown = screen.getByTestId('filter-dropdown-role')
    // Should show unique role values
    expect(within(dropdown).getByText('Admin')).toBeInTheDocument()
    expect(within(dropdown).getByText('Editor')).toBeInTheDocument()
    expect(within(dropdown).getByText('Viewer')).toBeInTheDocument()
  })

  it('filters data when option selected', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        pagination={false}
      />
    )
    // Open role filter
    await user.click(screen.getByLabelText('Filter Role'))
    const dropdown = screen.getByTestId('filter-dropdown-role')
    // Select "Admin"
    await user.click(within(dropdown).getByText('Admin'))

    // Only Alice and Eve should be visible
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Eve')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    expect(screen.queryByText('Carol')).not.toBeInTheDocument()
    expect(screen.queryByText('David')).not.toBeInTheDocument()
  })

  it('auto-detects unique values from data', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Filter Status'))
    const dropdown = screen.getByTestId('filter-dropdown-status')
    // Should detect "active" and "inactive"
    expect(within(dropdown).getByText('active')).toBeInTheDocument()
    expect(within(dropdown).getByText('inactive')).toBeInTheDocument()
  })

  it('uses filterOptions when provided', async () => {
    const user = userEvent.setup()
    const columnsWithOptions: Column<FilterTestRow>[] = [
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role', filterable: true, filterOptions: ['Admin', 'SuperAdmin'] },
    ]
    render(
      <DataTable
        columns={columnsWithOptions}
        data={filterData}
        getRowKey={(r) => r.id}
        pagination={false}
      />
    )
    await user.click(screen.getByLabelText('Filter Role'))
    const dropdown = screen.getByTestId('filter-dropdown-role')
    expect(within(dropdown).getByText('Admin')).toBeInTheDocument()
    expect(within(dropdown).getByText('SuperAdmin')).toBeInTheDocument()
    // "Editor" should NOT appear since we provided custom filterOptions
    expect(within(dropdown).queryByText('Editor')).not.toBeInTheDocument()
  })

  it('clears filters', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        pagination={false}
      />
    )
    // Open role filter and select "Admin"
    await user.click(screen.getByLabelText('Filter Role'))
    await user.click(within(screen.getByTestId('filter-dropdown-role')).getByText('Admin'))
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()

    // Click "Clear"
    await user.click(screen.getByText('Clear'))
    // All data should be back
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Carol')).toBeInTheDocument()
  })

  it('multiple column filters work together', async () => {
    const user = userEvent.setup()
    render(
      <DataTable
        columns={filterColumns}
        data={filterData}
        getRowKey={(r) => r.id}
        pagination={false}
      />
    )
    // Filter role = Admin
    await user.click(screen.getByLabelText('Filter Role'))
    await user.click(within(screen.getByTestId('filter-dropdown-role')).getByText('Admin'))

    // Filter status = active (open status filter)
    await user.click(screen.getByLabelText('Filter Status'))
    await user.click(within(screen.getByTestId('filter-dropdown-status')).getByText('active'))

    // Only Alice (Admin + active) should be visible
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Eve')).not.toBeInTheDocument() // Admin but inactive
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('resets to page 0 on filter change', async () => {
    const user = userEvent.setup()
    const largeFilterData = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      role: i < 12 ? 'Admin' : 'Editor',
      status: 'active' as const,
    }))
    render(
      <DataTable
        columns={filterColumns}
        data={largeFilterData}
        getRowKey={(r) => r.id}
        defaultPageSize={10}
      />
    )
    // Navigate to page 2
    await user.click(screen.getByText('1 / 3').closest('div')!.querySelectorAll('button')[2])

    // Now apply a filter — should reset to page 0
    await user.click(screen.getByLabelText('Filter Role'))
    await user.click(within(screen.getByTestId('filter-dropdown-role')).getByText('Admin'))

    // Should show page 1 info
    expect(screen.getByText(/1-10 of 12/)).toBeInTheDocument()
  })
})

describe('DataTable composition guards', () => {
  beforeEach(() => __resetWarnings())
  it('warns when nested in a Card while drawing its own border', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Card>
        <CardContent>
          <DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />
        </CardContent>
      </Card>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('two frames stack'))
    warn.mockRestore()
  })

  it('stays quiet when the table drops its own frame', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Card padding="none">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            getRowKey={(r) => r.id}
            pagination={false}
            bordered={false}
          />
        </CardContent>
      </Card>
    )
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('drops the border box when bordered is false', () => {
    const { container } = render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        bordered={false}
      />
    )
    expect(container.firstElementChild?.className ?? '').not.toContain('rounded-md border')
  })
})

describe('DataTable pinned guard', () => {
  beforeEach(() => __resetWarnings())
  const pinnedColumns: Column<TestRow>[] = [
    { key: 'name', header: 'Name', pinned: 'left' },
    { key: 'age', header: 'Age' },
  ]

  it('warns when pinned columns have no minWidth to overflow against', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <DataTable columns={pinnedColumns} data={data} getRowKey={(r) => r.id} pagination={false} />
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('frozen columns never engage'))
    warn.mockRestore()
  })

  it('stays quiet once minWidth is set', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <DataTable
        columns={pinnedColumns}
        data={data}
        getRowKey={(r) => r.id}
        pagination={false}
        minWidth={900}
      />
    )
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('DataTable card guard — no false positives', () => {
  beforeEach(() => __resetWarnings())

  // Found by reviewing a consumer that had already fixed the double frame the
  // pre-`bordered` way. Warning there would be crying wolf.
  it('stays quiet when className already removes the frame', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Card padding="none">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            getRowKey={(r) => r.id}
            pagination={false}
            className="rounded-none border-0 border-t tabular-nums"
          />
        </CardContent>
      </Card>
    )
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('still warns when className only mentions an unrelated border utility', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Card>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            getRowKey={(r) => r.id}
            pagination={false}
            className="border-t"
          />
        </CardContent>
      </Card>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('two frames stack'))
    warn.mockRestore()
  })
})
