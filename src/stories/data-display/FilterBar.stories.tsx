import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import {
  FilterBar,
  FilterBarSearch,
  FilterBarFilters,
  FilterBarActions,
  FilterBarGroup,
} from '../../components/filter-bar/FilterBar'
import { Select } from '../../components/select/Select'
import { Button } from '../../components/button/Button'
import { Badge } from '../../components/badge/Badge'
import { SegmentedControl } from '../../components/segmented-control/SegmentedControl'

const meta: Meta<typeof FilterBar> = {
  title: 'Data Display/FilterBar',
  component: FilterBar,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof FilterBar>

export const Default: Story = {
  render: () => (
    <FilterBar>
      <FilterBarSearch placeholder="Search orders..." />
      <FilterBarFilters>
        <Select size="sm" aria-label="Filter by status">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </Select>
        <Select size="sm" aria-label="Filter by type">
          <option value="">All Types</option>
          <option value="standard">Standard</option>
          <option value="express">Express</option>
        </Select>
      </FilterBarFilters>
      <FilterBarActions>
        <Button size="sm" variant="outline">
          Export
        </Button>
        <Button size="sm">Add Order</Button>
      </FilterBarActions>
    </FilterBar>
  ),
}

export const SearchOnly: Story = {
  render: () => (
    <FilterBar>
      <FilterBarSearch placeholder="Search users..." />
      <FilterBarActions>
        <Button size="sm">Invite User</Button>
      </FilterBarActions>
    </FilterBar>
  ),
}

function ActiveFiltersDemo() {
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')

  const hasFilters = status !== '' || query !== ''

  return (
    <div className="space-y-3">
      <FilterBar>
        <FilterBarSearch placeholder="Search products..." value={query} onChange={setQuery} />
        <FilterBarFilters>
          <Select
            size="sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </Select>
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStatus('')
                setQuery('')
              }}
            >
              Clear filters
            </Button>
          )}
        </FilterBarFilters>
        <FilterBarActions>
          <Button size="sm">Add Product</Button>
        </FilterBarActions>
      </FilterBar>

      {hasFilters && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          Active filters:
          {query && (
            <Badge variant="secondary" size="sm">
              Search: {query}
            </Badge>
          )}
          {status && (
            <Badge variant="secondary" size="sm">
              Status: {status}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export const WithActiveFilters: Story = {
  render: () => <ActiveFiltersDemo />,
}

export const FiltersOnly: Story = {
  name: 'Filters without Search',
  render: () => (
    <FilterBar>
      <FilterBarFilters>
        <Select size="sm" aria-label="Filter by department">
          <option value="">Department</option>
          <option value="engineering">Engineering</option>
          <option value="design">Design</option>
          <option value="marketing">Marketing</option>
        </Select>
        <Select size="sm" aria-label="Filter by role">
          <option value="">Role</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </Select>
      </FilterBarFilters>
      <FilterBarActions>
        <Button size="sm" variant="outline">
          Export CSV
        </Button>
      </FilterBarActions>
    </FilterBar>
  ),
}

/**
 * Preset toggles rather than dropdowns — the shape reporting and analytics
 * pages need, and the one a bare `FilterSelect` can't express because its
 * `label` only prefixes the "all" option.
 *
 * Every group is a `FilterBarGroup`, so each carries a visible label, an
 * accessible name, and wrapping. Narrow the viewport and the groups fold onto
 * new lines instead of pushing the page sideways.
 */
export const PresetGroups: Story = {
  render: function PresetGroupsStory() {
    const [period, setPeriod] = useState('7d')
    const [segment, setSegment] = useState('all')
    const [direction, setDirection] = useState('up')
    const [rows, setRows] = useState('50')

    return (
      <FilterBar>
        <FilterBarFilters>
          <FilterBarGroup label="Period">
            <SegmentedControl
              size="sm"
              value={period}
              onChange={setPeriod}
              options={[
                { value: '1d', label: '1D' },
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' },
                { value: '90d', label: '90D' },
              ]}
            />
          </FilterBarGroup>
          <FilterBarGroup label="Segment">
            <SegmentedControl
              size="sm"
              value={segment}
              onChange={setSegment}
              options={[
                { value: 'all', label: 'All' },
                { value: 'smb', label: 'SMB' },
                { value: 'ent', label: 'Enterprise' },
              ]}
            />
          </FilterBarGroup>
          <FilterBarGroup label="Trend">
            <SegmentedControl
              size="sm"
              value={direction}
              onChange={setDirection}
              options={[
                { value: 'up', label: 'Growing ↑' },
                { value: 'down', label: 'Shrinking ↓' },
              ]}
            />
          </FilterBarGroup>
          <FilterBarGroup label="Rows">
            <SegmentedControl
              size="sm"
              value={rows}
              onChange={setRows}
              options={[
                { value: '20', label: '20' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
              ]}
            />
          </FilterBarGroup>
        </FilterBarFilters>
      </FilterBar>
    )
  },
}

/**
 * The same bar at phone width. Groups wrap; nothing overflows. A hand-rolled
 * label + non-wrapping flex row is what puts a horizontal scrollbar on the
 * whole page here.
 */
export const PresetGroupsNarrow: Story = {
  ...PresetGroups,
  name: 'Preset groups (narrow viewport)',
  decorators: [
    (StoryFn) => (
      <div className="w-[320px] rounded-lg border p-3">
        <StoryFn />
      </div>
    ),
  ],
}
