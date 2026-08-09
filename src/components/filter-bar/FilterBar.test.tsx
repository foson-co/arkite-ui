import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { __resetWarnings } from '../../utils/deprecate'
import {
  FilterBar,
  FilterBarSearch,
  FilterBarFilters,
  FilterBarActions,
  FilterBarGroup,
} from './FilterBar'
import { DateRangePicker } from '../date-picker/DateRangePicker'

describe('FilterBar', () => {
  it('renders children', () => {
    render(
      <FilterBar>
        <span>content</span>
      </FilterBar>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(
      <FilterBar className="my-class">
        <span>x</span>
      </FilterBar>
    )
    expect(container.firstChild).toHaveClass('my-class')
  })
})

describe('FilterBarSearch', () => {
  it('renders search input with placeholder', () => {
    render(<FilterBarSearch placeholder="Search orders..." />)
    expect(screen.getByPlaceholderText('Search orders...')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FilterBarSearch value="" onChange={onChange} />)
    await user.type(screen.getByRole('searchbox'), 'hello')
    expect(onChange).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith('o')
  })

  it('uses default placeholder', () => {
    render(<FilterBarSearch />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('guards against password manager autofill', () => {
    render(<FilterBarSearch />)
    const input = screen.getByRole('searchbox')
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveAttribute('name', 'search')
    expect(input).toHaveAttribute('autocomplete', 'off')
  })
})

describe('FilterBarFilters', () => {
  it('renders filter children', () => {
    render(
      <FilterBarFilters>
        <select data-testid="filter-1"><option>All</option></select>
        <select data-testid="filter-2"><option>Active</option></select>
      </FilterBarFilters>
    )
    expect(screen.getByTestId('filter-1')).toBeInTheDocument()
    expect(screen.getByTestId('filter-2')).toBeInTheDocument()
  })
})

describe('FilterBarActions', () => {
  it('renders action buttons', () => {
    render(
      <FilterBarActions>
        <button>Export</button>
        <button>Add</button>
      </FilterBarActions>
    )
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })
})

describe('FilterBar composition', () => {
  it('renders all slots together', () => {
    render(
      <FilterBar>
        <FilterBarSearch placeholder="Search..." />
        <FilterBarFilters>
          <select><option>Status</option></select>
        </FilterBarFilters>
        <FilterBarActions>
          <button>Export</button>
        </FilterBarActions>
      </FilterBar>
    )
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })
})

describe('FilterBarGroup', () => {
  it('renders its label and children', () => {
    render(
      <FilterBarGroup label="Period">
        <button>7d</button>
      </FilterBarGroup>
    )
    expect(screen.getByText('Period')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '7d' })).toBeInTheDocument()
  })

  it('exposes a named group to assistive tech', () => {
    render(
      <FilterBarGroup label="Period">
        <button>7d</button>
      </FilterBarGroup>
    )
    expect(screen.getByRole('group', { name: 'Period' })).toBeInTheDocument()
  })

  it('omits aria-label when the label is not plain text', () => {
    render(
      <FilterBarGroup label={<em>Period</em>}>
        <button>7d</button>
      </FilterBarGroup>
    )
    expect(screen.getByRole('group')).not.toHaveAttribute('aria-label')
  })

  // The hand-rolled version of this group (seen downstream) had neither, so a
  // single group's content width pushed the whole page sideways on mobile.
  it('wraps and can shrink so it never forces a horizontal scrollbar', () => {
    render(
      <FilterBarGroup label="Period">
        <button>7d</button>
      </FilterBarGroup>
    )
    const group = screen.getByRole('group', { name: 'Period' })
    expect(group).toHaveClass('flex-wrap', 'min-w-0')
    expect(group.lastElementChild).toHaveClass('flex-wrap', 'min-w-0')
  })

  it('merges className', () => {
    render(
      <FilterBarGroup label="Period" className="mt-2">
        <button>7d</button>
      </FilterBarGroup>
    )
    expect(screen.getByRole('group', { name: 'Period' })).toHaveClass('mt-2')
  })
})

describe('FilterBar composition guards', () => {
  beforeEach(() => __resetWarnings())
  it('warns when a DateRangePicker keeps its stacked label in a toolbar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <FilterBar>
        <FilterBarFilters>
          <DateRangePicker startLabel="From" endLabel="To" />
        </FilterBarFilters>
      </FilterBar>
    )
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('out of alignment'))
    warn.mockRestore()
  })

  it('stays quiet with the label inside, and outside a toolbar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <>
        <FilterBar>
          <FilterBarFilters>
            <DateRangePicker startLabel="From" endLabel="To" labelPlacement="inside" />
          </FilterBarFilters>
        </FilterBar>
        <DateRangePicker startLabel="From" endLabel="To" />
      </>
    )
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
