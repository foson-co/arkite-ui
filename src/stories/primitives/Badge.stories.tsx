import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../../components/badge'

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'secondary',
        'success',
        'warning',
        'destructive',
        'outline',
        'info',
        'count',
      ],
    },
  },
  args: {
    children: 'Badge',
    variant: 'default',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Success: Story = {
  args: { variant: 'success', children: 'Active' },
}

export const Warning: Story = {
  args: { variant: 'warning', children: 'Pending' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Error' },
}

export const Info: Story = {
  args: { variant: 'info', children: 'Info' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="count">{42}</Badge>
    </div>
  ),
}

export const Count: Story = {
  name: 'Count (tab counters)',
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">Neutral count pills — e.g. after tab labels</p>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center text-sm">
            Items{' '}
            <Badge variant="count" size="sm" className="ml-1.5">
              {12}
            </Badge>
          </span>
          <span className="inline-flex items-center text-sm">
            Photos{' '}
            <Badge variant="count" size="sm" className="ml-1.5">
              {7}
            </Badge>
          </span>
          <span className="inline-flex items-center text-sm">
            Logs{' '}
            <Badge variant="count" size="sm" className="ml-1.5" max={99}>
              {150}
            </Badge>
          </span>
        </div>
      </div>
      <div className="border-border text-muted-foreground rounded-md border p-4 text-xs">
        <p className="text-foreground mb-2 font-medium">Usage</p>
        <pre className="bg-muted overflow-x-auto rounded p-3">{`// Composes with max
<Badge variant="count" max={99}>{itemCount}</Badge>  // 150 → "99+"`}</pre>
      </div>
    </div>
  ),
}

export const MaxCount: Story = {
  name: 'Numeric max (99+ truncation)',
  render: () => (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">
          With <code className="text-xs">max=99</code>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="destructive" max={99}>
            {3}
          </Badge>
          <Badge variant="destructive" max={99}>
            {50}
          </Badge>
          <Badge variant="destructive" max={99}>
            {99}
          </Badge>
          <Badge variant="destructive" max={99}>
            {100}
          </Badge>
          <Badge variant="destructive" max={99}>
            {9999}
          </Badge>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">
          With <code className="text-xs">max=9</code> (compact counters)
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info" max={9}>
            {1}
          </Badge>
          <Badge variant="info" max={9}>
            {9}
          </Badge>
          <Badge variant="info" max={9}>
            {10}
          </Badge>
          <Badge variant="info" max={9}>
            {42}
          </Badge>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Non-numeric children pass through</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success" max={99}>
            New
          </Badge>
          <Badge variant="outline" max={99}>
            Beta
          </Badge>
        </div>
      </div>

      <div className="border-border text-muted-foreground rounded-md border p-4 text-xs">
        <p className="text-foreground mb-2 font-medium">Usage</p>
        <pre className="bg-muted overflow-x-auto rounded p-3">{`// Cap at 99; anything higher becomes "99+"
<Badge variant="destructive" max={99}>{unreadCount}</Badge>

// String children are unaffected
<Badge max={99}>New</Badge>  // → "New"`}</pre>
      </div>
    </div>
  ),
}

/* ------------------------------------------------------------------ */
/*  Pattern: Status Badge                                              */
/*  Use Badge + a status config map to display statuses consistently. */
/*  Keep the mapping in your project, not in @arkite-ui/core.              */
/* ------------------------------------------------------------------ */

type BadgeVariant = 'success' | 'warning' | 'destructive' | 'info' | 'outline' | 'secondary'

/** Example: define a status config map in your project */
const orderStatusMap: Record<string, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'warning' },
  confirmed: { label: 'Confirmed', variant: 'info' },
  processing: { label: 'Processing', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'outline' },
}

/** Reusable pattern — wrap in your project as a helper */
const StatusBadge = ({
  status,
  map,
}: {
  status: string
  map: Record<string, { label: string; variant: BadgeVariant }>
}) => {
  const info = map[status]
  return <Badge variant={info?.variant ?? 'outline'}>{info?.label ?? status}</Badge>
}

/** Active / inactive toggle — a common one-liner, no wrapper needed */
const ActiveBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge variant={isActive ? 'success' : 'outline'}>{isActive ? 'Active' : 'Inactive'}</Badge>
)

export const StatusBadgePattern: Story = {
  name: 'Pattern: Status Badge',
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-medium">Order statuses</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(orderStatusMap).map((status) => (
            <StatusBadge key={status} status={status} map={orderStatusMap} />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Active / Inactive</p>
        <div className="flex gap-2">
          <ActiveBadge isActive />
          <ActiveBadge isActive={false} />
        </div>
      </div>

      <div className="border-border text-muted-foreground space-y-2 rounded-md border p-4 text-xs">
        <p className="text-foreground font-medium">How to use this pattern:</p>
        <pre className="bg-muted overflow-x-auto rounded p-3 text-xs">{`// 1. Define status map in your project
const statusMap = {
  active:   { label: '啟用', variant: 'success' },
  inactive: { label: '停用', variant: 'outline' },
}

// 2. Use Badge directly
<Badge variant={statusMap[status].variant}>
  {statusMap[status].label}
</Badge>`}</pre>
      </div>
    </div>
  ),
}
