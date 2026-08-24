import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { DataTable, type Column } from '../../components/data-table'
import { Badge } from '../../components/badge'
import { BulkActionBar } from '../../components/bulk-action-bar'
import { Button } from '../../components/button'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
}

const sampleData: User[] = [
  { id: 1, name: 'Alice Chen', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'active' },
  { id: 3, name: 'Carol Wu', email: 'carol@example.com', role: 'Viewer', status: 'inactive' },
  { id: 4, name: 'David Kim', email: 'david@example.com', role: 'Editor', status: 'active' },
  { id: 5, name: 'Eve Johnson', email: 'eve@example.com', role: 'Admin', status: 'active' },
  { id: 6, name: 'Frank Li', email: 'frank@example.com', role: 'Viewer', status: 'inactive' },
  { id: 7, name: 'Grace Park', email: 'grace@example.com', role: 'Editor', status: 'active' },
  { id: 8, name: 'Henry Wang', email: 'henry@example.com', role: 'Viewer', status: 'active' },
]

const columns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    cell: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>{row.status}</Badge>
    ),
  },
]

const meta: Meta = {
  title: 'Data Display/DataTable',
  component: DataTable,
  argTypes: {
    pagination: { control: 'boolean' },
    loading: { control: 'boolean' },
    selectable: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
}

export default meta

const Template: StoryFn = (args) => (
  <DataTable<User>
    data={sampleData}
    columns={columns}
    getRowKey={(row) => row.id}
    pagination
    defaultPageSize={5}
    {...args}
  />
)

export const Default: StoryFn = Template.bind({})

export const Loading: StoryFn = Template.bind({})
Loading.args = { loading: true }

export const Empty: StoryFn = () => (
  <DataTable<User>
    data={[]}
    columns={columns}
    getRowKey={(row) => row.id}
    emptyContent="No users found"
  />
)

export const NoPagination: StoryFn = Template.bind({})
NoPagination.args = { pagination: false }

export const ErrorState: StoryFn = () => (
  <DataTable<User>
    data={[]}
    columns={columns}
    getRowKey={(row) => row.id}
    emptyContent={
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <span className="text-destructive font-medium">Failed to load data</span>
        <span className="text-muted-foreground text-sm">
          Please check your connection and try again.
        </span>
      </div>
    }
  />
)

export const LoadingWithData: StoryFn = () => (
  <DataTable<User>
    data={sampleData.slice(0, 3)}
    columns={columns}
    getRowKey={(row) => row.id}
    loading
    pagination
    defaultPageSize={5}
  />
)

function SelectableDemo() {
  const [selected, setSelected] = useState<Set<string | number>>(new Set())

  return (
    <div>
      <DataTable<User>
        data={sampleData}
        columns={columns}
        getRowKey={(row) => row.id}
        selectable
        selectedRows={selected}
        onSelectionChange={setSelected}
        pagination
        defaultPageSize={5}
      />
      <BulkActionBar selectedCount={selected.size} onClose={() => setSelected(new Set())}>
        <Button size="sm" variant="secondary">
          Export
        </Button>
        <Button size="sm" variant="secondary">
          Assign Role
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </BulkActionBar>
    </div>
  )
}

export const Selectable: StoryFn = () => <SelectableDemo />

export const ExpandableRows: StoryFn = () => (
  <DataTable<User>
    data={sampleData}
    columns={columns}
    getRowKey={(row) => row.id}
    renderExpandedRow={(row) => (
      <div className="space-y-2 text-sm">
        <p>
          <strong>Full details for {row.name}</strong>
        </p>
        <p>Email: {row.email}</p>
        <p>Role: {row.role}</p>
        <p>Status: {row.status}</p>
      </div>
    )}
    pagination
    defaultPageSize={5}
  />
)

export const ColumnToggle: StoryFn = () => (
  <DataTable<User>
    data={sampleData}
    columns={columns}
    getRowKey={(row) => row.id}
    columnToggle
    pagination
    defaultPageSize={5}
  />
)

const stickyData: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'Editor', 'Viewer'][i % 3],
  status: (i % 4 === 0 ? 'inactive' : 'active') as 'active' | 'inactive',
}))

export const StickyHeader: StoryFn = () => (
  <DataTable<User>
    data={stickyData}
    columns={columns}
    getRowKey={(row) => row.id}
    stickyHeader
    maxHeight="400px"
    pagination={false}
  />
)

export const ExpandableWithColumnToggle: StoryFn = () => (
  <DataTable<User>
    data={sampleData}
    columns={columns}
    getRowKey={(row) => row.id}
    renderExpandedRow={(row) => (
      <div className="text-muted-foreground text-sm">
        Additional details for <strong>{row.name}</strong> — {row.email}
      </div>
    )}
    columnToggle
    pagination
    defaultPageSize={5}
  />
)

const filterableColumns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'role', header: 'Role', filterable: true },
  {
    key: 'status',
    header: 'Status',
    filterable: true,
    cell: (row) => (
      <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>{row.status}</Badge>
    ),
  },
]

export const WithFilters: StoryFn = () => (
  <DataTable<User>
    data={sampleData}
    columns={filterableColumns}
    getRowKey={(row) => row.id}
    pagination
    defaultPageSize={5}
  />
)

export const CompactDense: StoryFn = () => (
  <DataTable<User>
    data={sampleData}
    columns={columns}
    getRowKey={(row) => row.id}
    compact
    rowClassName={(row) => (row.status === 'inactive' ? 'opacity-60' : '')}
    pagination={false}
  />
)
CompactDense.storyName = 'Compact + rowClassName'

const pinnedColumns: Column<User>[] = [
  { key: 'name', header: 'Name', pinned: 'left', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'email2', header: 'Backup Email', cell: (r) => r.email },
  { key: 'role2', header: 'Previous Role', cell: (r) => r.role },
]

export const PinnedColumns: StoryFn = () => (
  <div className="max-w-xl">
    <DataTable<User>
      data={sampleData}
      columns={pinnedColumns}
      getRowKey={(row) => row.id}
      compact
      pagination={false}
    />
  </div>
)

// ── 0.15 additions ──

const heatColumns: Column<User>[] = [
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    align: 'center',
    // Whole-cell styling — no negative-margin hacks needed for matrix/heatmap cells
    cellClassName: (row) => (row.status === 'active' ? 'bg-success-soft' : 'bg-warning-soft'),
    headerClassName: 'bg-muted',
  },
  { key: 'email', header: 'Email (hidden on mobile)', hidden: 'mobile' },
]

export const CellStylingAndResponsive: StoryFn = () => (
  <DataTable<User>
    data={sampleData}
    columns={heatColumns}
    getRowKey={(row) => row.id}
    compact
    pagination={false}
  />
)
CellStylingAndResponsive.storyName = 'cellClassName + hidden:"mobile"'

const SelectionRulesDemo = () => {
  const [selected, setSelected] = useState<Set<string | number>>(new Set())
  const [log, setLog] = useState<string[]>([])
  return (
    <div className="space-y-3">
      <DataTable<User>
        data={sampleData}
        columns={columns}
        getRowKey={(row) => row.id}
        selectable
        selectedRows={selected}
        onSelectionChange={setSelected}
        // Incremental events alongside the whole-set callback
        onRowSelect={(row, isSelected) =>
          setLog((prev) => [...prev.slice(-4), `${row.name} → ${isSelected ? 'on' : 'off'}`])
        }
        // Admins can't be deselected/selected here
        isRowSelectable={(row) => row.role !== 'Admin'}
        pagination={false}
      />
      <p className="text-muted-foreground text-xs">
        onRowSelect log: {log.join(' · ') || '(interact with checkboxes)'}
      </p>
    </div>
  )
}

export const SelectionRules: StoryFn = () => <SelectionRulesDemo />
SelectionRules.storyName = 'isRowSelectable + onRowSelect'

// cellStyle: CONTINUOUS values that class strings can't express —
// heatmap alpha computed from the row at runtime. headerStyle: vertical
// writing-mode for rotated matrix headers.
interface HeatRow {
  metric: string
  q1: number
  q2: number
  q3: number
  q4: number
}

const heatRows: HeatRow[] = [
  { metric: 'Revenue growth', q1: 0.12, q2: 0.35, q3: 0.61, q4: 0.88 },
  { metric: 'Churn', q1: 0.72, q2: 0.44, q3: 0.28, q4: 0.09 },
  { metric: 'NPS', q1: 0.2, q2: 0.51, q3: 0.66, q4: 0.94 },
]

const heatCell = (key: keyof HeatRow & string): Column<HeatRow> => ({
  key,
  header: key.toUpperCase(),
  align: 'right',
  headerStyle: { writingMode: 'vertical-rl' },
  cellStyle: (row) => ({ backgroundColor: `rgba(106, 77, 255, ${row[key] as number})` }),
  cell: (row) => `${Math.round((row[key] as number) * 100)}%`,
})

export const ContinuousHeatmap: StoryFn = () => (
  <DataTable<HeatRow>
    data={heatRows}
    columns={[
      { key: 'metric', header: 'Metric' },
      heatCell('q1'),
      heatCell('q2'),
      heatCell('q3'),
      heatCell('q4'),
    ]}
    getRowKey={(r) => r.metric}
    compact
    hoverable={false}
    pagination={false}
  />
)
ContinuousHeatmap.storyName = 'cellStyle heatmap (continuous alpha)'

/**
 * In dense tables a Switch repeated down a column out-shouts the data.
 * The blessed pattern is a clickable status pill: Badge inside a ghost
 * Button carrying aria-pressed. Switch stays canonical in forms/settings.
 */
export const ToggleableStatusBadge: StoryFn = () => {
  const [rows, setRows] = useState(sampleData)
  const toggle = (id: number) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
      )
    )
  return (
    <DataTable<User>
      data={rows}
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        {
          key: 'status',
          header: 'Status',
          cell: (row) => (
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={row.status === 'active'}
              onClick={() => toggle(row.id)}
            >
              <Badge variant={row.status === 'active' ? 'success' : 'secondary'}>
                {row.status === 'active' ? '● 啟用' : '⏸ 停用'}
              </Badge>
            </Button>
          ),
        },
      ]}
      getRowKey={(row) => row.id}
      pagination={false}
    />
  )
}
ToggleableStatusBadge.storyName = 'Toggleable status badge (not Switch)'
