import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DataTable, type Column } from './DataTable'

/**
 * Keyboard interaction spec for DataTable, measured against the WAI-ARIA
 * APG patterns for sortable tables, disclosure menus, and interactive
 * rows. Specs the component does not meet yet are pinned with `it.fails`
 * and a FINDING comment — remove the `.fails` as each gap is fixed.
 */

interface TestRow {
  id: number
  name: string
  age: number
}

const columns: Column<TestRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true },
]

const filterColumns: Column<TestRow>[] = [
  { key: 'name', header: 'Name', filterable: true },
  { key: 'age', header: 'Age' },
]

const data: TestRow[] = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 },
]

function firstColumnCells() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('td')?.textContent)
}

describe('DataTable keyboard interaction', () => {
  it('sorts via keyboard: Tab to the header button, Enter toggles order', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />)

    const sortButton = screen.getByRole('button', { name: 'Sort by Name' })
    sortButton.focus()
    await user.keyboard('{Enter}')
    expect(firstColumnCells()).toEqual(['Alice', 'Bob', 'Charlie'])

    await user.keyboard('{Enter}')
    expect(firstColumnCells()).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('exposes the sort state via aria-sort on the header cell', async () => {
    const user = userEvent.setup()
    render(<DataTable columns={columns} data={data} getRowKey={(r) => r.id} pagination={false} />)

    const sortButton = screen.getByRole('button', { name: 'Sort by Name' })
    sortButton.focus()
    await user.keyboard('{Enter}')

    const th = sortButton.closest('th')
    expect(th).toHaveAttribute('aria-sort', 'ascending')
  })

  it('toggles select-all and row selection with Space on the checkboxes', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        selectable
        onSelectionChange={onSelectionChange}
        pagination={false}
      />
    )

    const selectAll = screen.getByRole('checkbox', { name: 'Select all rows' })
    selectAll.focus()
    await user.keyboard(' ')
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([1, 2, 3]))

    const rowCheckbox = screen.getByRole('checkbox', { name: 'Select row 2' })
    rowCheckbox.focus()
    await user.keyboard(' ')
    // Uncontrolled selection persists, so toggling row 2 removes it from the set
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([1, 3]))
  })

  it('opens the column filter dropdown with Enter and toggles options', async () => {
    const user = userEvent.setup()
    render(
      <DataTable columns={filterColumns} data={data} getRowKey={(r) => r.id} pagination={false} />
    )

    const filterButton = screen.getByRole('button', { name: 'Filter Name' })
    filterButton.focus()
    await user.keyboard('{Enter}')

    const option = screen.getByRole('checkbox', { name: 'Alice' })
    option.focus()
    await user.keyboard('{Enter}')
    expect(firstColumnCells()).toEqual(['Alice'])
  })

  it('closes the filter dropdown with Escape', async () => {
    const user = userEvent.setup()
    render(
      <DataTable columns={filterColumns} data={data} getRowKey={(r) => r.id} pagination={false} />
    )

    const filterButton = screen.getByRole('button', { name: 'Filter Name' })
    filterButton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('checkbox', { name: 'Alice' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('checkbox', { name: 'Alice' })).not.toBeInTheDocument()
  })

  it('closes the column toggle dropdown with Escape', async () => {
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

    const toggle = screen.getByRole('button', { name: 'Toggle columns' })
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: 'Name' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('button', { name: 'Name' })).not.toBeInTheDocument()
  })

  it('activates a clickable row with Enter', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        getRowKey={(r) => r.id}
        onRowClick={onRowClick}
        pagination={false}
      />
    )

    const firstDataRow = screen.getAllByRole('row')[1]
    expect(firstDataRow).toHaveAttribute('tabindex', '0')
    firstDataRow.focus()
    await user.keyboard('{Enter}')
    expect(onRowClick).toHaveBeenCalledWith(data[0], 0)
  })

  it('expands and collapses a row via its keyboard-reachable button', async () => {
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

    const expandButton = screen.getAllByRole('button', { name: 'Expand row' })[0]
    expandButton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Details for Alice')).toBeInTheDocument()

    const collapseButton = screen.getAllByRole('button', { name: 'Collapse row' })[0]
    collapseButton.focus()
    await user.keyboard('{Enter}')
    expect(screen.queryByText('Details for Alice')).not.toBeInTheDocument()
  })

  it('operates pagination with the keyboard', async () => {
    const user = userEvent.setup()
    const manyRows = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}`, age: i }))
    render(<DataTable columns={columns} data={manyRows} getRowKey={(r) => r.id} />)

    const next = screen.getByRole('button', { name: 'Next page' })
    next.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByText('Row 10')).toBeInTheDocument()
  })
})
