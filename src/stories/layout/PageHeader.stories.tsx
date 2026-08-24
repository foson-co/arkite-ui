import type { Meta, StoryFn } from '@storybook/react-vite'
import { PageHeader } from '../../components/page-header'
import { Button } from '../../components/button'
import { Badge } from '../../components/badge'

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
} satisfies Meta<typeof PageHeader>

export default meta

export const Default: StoryFn = () => (
  <PageHeader title="Users" description="Manage all registered users." />
)

export const WithActions: StoryFn = () => (
  <PageHeader
    title="Products"
    description="Manage your product catalog."
    actions={
      <>
        <Button variant="outline">Export</Button>
        <Button variant="primary">Add Product</Button>
      </>
    }
  />
)

export const WithBadge: StoryFn = () => (
  <PageHeader
    title="Orders"
    description="View and manage customer orders."
    badge={<Badge variant="info">128 total</Badge>}
    actions={<Button variant="primary">New Order</Button>}
  />
)

export const WithBackButton: StoryFn = () => (
  <PageHeader
    onBack={() => alert('Navigate back')}
    title="User Detail"
    description="View and edit user information."
    badge={<Badge variant="success">Active</Badge>}
    actions={
      <>
        <Button variant="outline">Reset Password</Button>
        <Button variant="primary">Save</Button>
      </>
    }
  />
)

export const Sizes: StoryFn = () => (
  <div className="space-y-8">
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <PageHeader
        key={size}
        size={size}
        title={`Dashboard (size="${size}")`}
        description="Overview of your workspace activity."
        badge={<Badge variant="info">Live</Badge>}
      />
    ))}
  </div>
)

export const WithBreadcrumb: StoryFn = () => (
  <PageHeader
    breadcrumb={
      <nav className="text-muted-foreground text-sm">
        <span>Settings</span> / <span className="text-foreground">General</span>
      </nav>
    }
    title="General Settings"
    description="Configure your application preferences."
    actions={<Button variant="primary">Save Changes</Button>}
  />
)
