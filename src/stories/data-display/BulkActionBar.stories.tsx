import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { BulkActionBar } from '../../components/bulk-action-bar/BulkActionBar'
import { Button } from '../../components/button/Button'
import { DataTable, type Column } from '../../components/data-table'

const meta: Meta<typeof BulkActionBar> = {
  title: 'Data Display/BulkActionBar',
  component: BulkActionBar,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof BulkActionBar>

export const Default: Story = {
  args: {
    selectedCount: 3,
    children: (
      <>
        <Button size="sm" variant="secondary">
          Export
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </>
    ),
  },
}

export const SingleItem: Story = {
  args: {
    selectedCount: 1,
    children: (
      <Button size="sm" variant="secondary">
        Edit
      </Button>
    ),
  },
}

export const Hidden: Story = {
  name: 'Hidden (count = 0)',
  args: {
    selectedCount: 0,
    children: <Button size="sm">Export</Button>,
  },
}

interface SampleRow {
  id: string
  name: string
  email: string
  role: string
}

const sampleData: SampleRow[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'Viewer' },
  { id: '4', name: 'Dave Brown', email: 'dave@example.com', role: 'Editor' },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Admin' },
]

const sampleColumns: Column<SampleRow>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
]

function WithTableDemo() {
  const [selected, setSelected] = useState<Set<string | number>>(new Set())

  return (
    <div>
      <DataTable<SampleRow>
        data={sampleData}
        columns={sampleColumns}
        getRowKey={(row) => row.id}
        selectable
        selectedRows={selected}
        onSelectionChange={setSelected}
        pagination={false}
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

export const WithTable: Story = {
  render: () => <WithTableDemo />,
}

export const CustomSlots: Story = {
  args: {
    selectedCount: 7,
    left: (
      <span className="text-sm">
        <strong>7</strong> users selected
      </span>
    ),
    children: (
      <>
        <Button size="sm" variant="secondary">
          Send Email
        </Button>
        <Button size="sm" variant="secondary">
          Export CSV
        </Button>
      </>
    ),
    right: (
      <Button size="sm" variant="ghost">
        Clear
      </Button>
    ),
  },
}
