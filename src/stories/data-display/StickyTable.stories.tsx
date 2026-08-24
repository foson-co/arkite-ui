import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../../components/button/Button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/table/Table'

const meta: Meta<typeof Table> = {
  title: 'Data Display/Table/Sticky',
  component: Table,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof Table>

const rows = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'Editor', 'Viewer'][i % 3],
  department: ['Engineering', 'Design', 'Marketing', 'Sales'][i % 4],
  status: ['Active', 'Inactive'][i % 2],
}))

export const StickyHeader: Story = {
  render: () => (
    <div className="rounded-md border">
      <Table
        stickyHeader
        maxHeight="400px"
        wrapperProps={{ tabIndex: 0, role: 'region', 'aria-label': 'Sticky header table' }}
      >
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell>{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const StickyActionColumn: Story = {
  render: () => (
    <div className="max-w-[600px] rounded-md border">
      <Table
        minWidth={900}
        wrapperProps={{
          tabIndex: 0,
          role: 'region',
          'aria-label': 'Table with sticky action column',
        }}
      >
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="min-w-[250px]">Email</TableHead>
            <TableHead className="min-w-[120px]">Role</TableHead>
            <TableHead className="min-w-[150px]">Department</TableHead>
            <TableHead stickyAction>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 10).map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell stickyAction>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const StickyHeaderAndAction: Story = {
  name: 'Sticky Header + Action Column',
  render: () => (
    <div className="max-w-[600px] rounded-md border">
      <Table
        stickyHeader
        maxHeight="400px"
        minWidth={900}
        wrapperProps={{
          tabIndex: 0,
          role: 'region',
          'aria-label': 'Table with sticky header and action column',
        }}
      >
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="min-w-[250px]">Email</TableHead>
            <TableHead className="min-w-[120px]">Role</TableHead>
            <TableHead className="min-w-[150px]">Department</TableHead>
            <TableHead stickyAction>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>{row.department}</TableCell>
              <TableCell stickyAction>
                <Button size="sm" variant="ghost">
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}
