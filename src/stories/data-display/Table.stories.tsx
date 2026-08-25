import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  TableLoading,
} from '../../components/table'

const meta = {
  title: 'Data Display/Table',
  component: Table,
  argTypes: {
    variant: { control: 'select', options: ['default', 'striped'] },
    compact: { control: 'boolean' },
    bordered: { control: 'boolean' },
    hoverable: { control: 'boolean' },
  },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice Chen</TableCell>
          <TableCell>alice@example.com</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob Smith</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>Editor</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Carol Wu</TableCell>
          <TableCell>carol@example.com</TableCell>
          <TableCell>Viewer</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const Striped: Story = {
  ...Default,
  args: { variant: 'striped' },
}

export const Compact: Story = {
  ...Default,
  args: { compact: true },
}

export const AlignedAndNumeric: Story = {
  render: () => (
    <Table compact>
      <TableHeader>
        <TableRow>
          <TableHead>Ticker</TableHead>
          <TableHead align="center">Exchange</TableHead>
          <TableHead align="right">Market Cap</TableHead>
          <TableHead align="right">Change</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          ['AAPL', 'NASDAQ', '3.4T', '+1.24'],
          ['MSFT', 'NASDAQ', '3.1T', '-0.38'],
          ['2330', 'TWSE', '22.0T', '+12.50'],
        ].map(([t, ex, cap, chg]) => (
          <TableRow key={t}>
            <TableCell className="font-medium">{t}</TableCell>
            <TableCell align="center">{ex}</TableCell>
            <TableCell numeric>{cap}</TableCell>
            <TableCell numeric>{chg}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const EmptyAndLoadingRows: Story = {
  render: () => (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* colSpan is measured from the header row automatically */}
          <TableEmpty />
        </TableBody>
      </Table>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableLoading />
        </TableBody>
      </Table>
    </div>
  ),
}

export const FrozenColumns: Story = {
  render: () => (
    <div className="max-w-xl">
      <Table compact>
        <TableHeader>
          <TableRow>
            <TableHead stickyLead>Ticker</TableHead>
            {['Open', 'High', 'Low', 'Close', 'Volume', 'MA5', 'MA20', 'RSI'].map((h) => (
              <TableHead key={h} align="right" className="min-w-24">
                {h}
              </TableHead>
            ))}
            <TableHead stickyAction>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {['AAPL', 'MSFT', 'NVDA'].map((t, r) => (
            <TableRow key={t}>
              <TableCell stickyLead className="font-medium">
                {t}
              </TableCell>
              {Array.from({ length: 8 }, (_, i) => (
                <TableCell key={i} numeric>
                  {(100 + r * 7 + i * 3.14).toFixed(2)}
                </TableCell>
              ))}
              <TableCell stickyAction>…</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}
