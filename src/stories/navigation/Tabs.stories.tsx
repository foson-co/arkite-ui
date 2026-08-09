import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/tabs'

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pills', 'underline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    defaultValue: 'overview',
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="disabled" disabled>Disabled</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground mt-4">Overview content</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-muted-foreground mt-4">Analytics content</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground mt-4">Settings content</p>
      </TabsContent>
    </Tabs>
  ),
}

export const Pills: Story = {
  ...Default,
  args: { defaultValue: 'overview', variant: 'pills' },
}

export const Underline: Story = {
  ...Default,
  args: { defaultValue: 'overview', variant: 'underline' },
}

/**
 * Vertical strip — the shape for landscape phones, where a horizontal tab row
 * eats scarce vertical space. `orientation` is a prop rather than a className
 * recipe because it also moves the underline variant's active rule to the
 * inline edge, sets `aria-orientation`, and swaps keyboard navigation to the
 * up/down axis.
 */
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="overview" variant="underline" orientation="vertical">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="technical">Technical</TabsTrigger>
        <TabsTrigger value="holdings">Holdings</TabsTrigger>
        <TabsTrigger value="filings">Filings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview panel</TabsContent>
      <TabsContent value="technical">Technical panel</TabsContent>
      <TabsContent value="holdings">Holdings panel</TabsContent>
      <TabsContent value="filings">Filings panel</TabsContent>
    </Tabs>
  ),
}

/** The same strip as pills, at a landscape-phone width. */
export const VerticalOnLandscapePhone: Story = {
  name: 'Vertical (landscape phone)',
  render: () => (
    <div className="h-[375px] w-[812px] overflow-hidden rounded-lg border p-3">
      <Tabs defaultValue="overview" variant="pills" orientation="vertical" size="sm">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="h-[320px] overflow-auto rounded-md bg-muted/40 p-3 text-sm">
            The panel scrolls on its own; the strip stays put.
          </div>
        </TabsContent>
        <TabsContent value="technical">Technical panel</TabsContent>
        <TabsContent value="holdings">Holdings panel</TabsContent>
      </Tabs>
    </div>
  ),
}
