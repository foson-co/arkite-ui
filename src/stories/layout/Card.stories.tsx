import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardContent, CardFooter } from '../../components/card'
import { Button } from '../../components/button'

const meta = {
  title: 'Layout/Card',
  component: Card,
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    hoverable: { control: 'boolean' },
    bordered: { control: 'boolean' },
    density: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
  args: {
    padding: 'md',
    shadow: 'sm',
    bordered: true,
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader title="Card Title" description="Card description text" />
      <CardContent>
        <p className="text-muted-foreground text-sm">Card content goes here.</p>
      </CardContent>
    </Card>
  ),
}

export const WithAction: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader
        title="Settings"
        description="Manage your account"
        action={
          <Button size="sm" variant="outline">
            Edit
          </Button>
        }
      />
      <CardContent>
        <p className="text-muted-foreground text-sm">Your account settings content.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary" size="sm">
          Save
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const DashboardWidget: Story = {
  name: 'Dashboard widget (compact + actions)',
  render: () => (
    <div className="flex gap-4">
      <Card density="compact" className="w-80">
        <CardHeader
          title="Watchlist"
          description="12 symbols tracked"
          actions={
            <>
              <button
                type="button"
                aria-label="Refresh"
                className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex h-7 w-7 items-center justify-center rounded-md"
              >
                ↻
              </button>
              <button
                type="button"
                aria-label="Settings"
                className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex h-7 w-7 items-center justify-center rounded-md"
              >
                ⚙
              </button>
            </>
          }
        />
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Compact density: tighter padding and smaller header typography for dense dashboard
            grids.
          </p>
        </CardContent>
      </Card>
      <Card className="w-80">
        <CardHeader title="Watchlist" description="12 symbols tracked" />
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Default density for comparison — unchanged from before.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
}

export const Hoverable: Story = {
  render: () => (
    <div className="flex gap-4">
      {['Project A', 'Project B', 'Project C'].map((name) => (
        <Card key={name} hoverable className="w-48 cursor-pointer">
          <CardContent>
            <p className="font-medium">{name}</p>
            <p className="text-muted-foreground text-sm">Click to open</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}

export const Interactive: Story = {
  render: () => (
    <div className="flex gap-4">
      {['Project A', 'Project B'].map((name) => (
        <Card key={name} onClick={() => alert(`Open ${name}`)} className="w-56">
          <CardContent>
            <p className="font-medium">{name}</p>
            <p className="text-muted-foreground text-sm">
              Whole card is a button — Tab to it, press Enter.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
}
