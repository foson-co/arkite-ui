import type { Meta, StoryObj } from '@storybook/react-vite'
import { CollapsibleSection } from '../../components/collapsible-section'
import { Badge } from '../../components/badge'

const meta = {
  title: 'Layout/CollapsibleSection',
  component: CollapsibleSection,
  argTypes: {
    defaultOpen: { control: 'boolean' },
    disabled: { control: 'boolean' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
  args: {
    title: 'Section Title',
    defaultOpen: true,
    children: 'Section content goes here.',
  },
} satisfies Meta<typeof CollapsibleSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <CollapsibleSection {...args} className="w-96">
      <p className="text-muted-foreground text-sm">
        This is the section content. It can contain any React nodes.
      </p>
    </CollapsibleSection>
  ),
}

export const Collapsed: Story = {
  args: {
    defaultOpen: false,
  },
  render: (args) => (
    <CollapsibleSection {...args} className="w-96">
      <p className="text-muted-foreground text-sm">This content is hidden by default.</p>
    </CollapsibleSection>
  ),
}

export const WithDescription: Story = {
  args: {
    title: 'Advanced Settings',
    description: 'Configure advanced options for this feature',
  },
  render: (args) => (
    <CollapsibleSection {...args} className="w-96">
      <div className="space-y-2">
        <p className="text-sm">Option A</p>
        <p className="text-sm">Option B</p>
      </div>
    </CollapsibleSection>
  ),
}

export const WithRightSlot: Story = {
  args: {
    title: 'Notifications',
    rightSlot: <Badge variant="secondary">3</Badge>,
  },
  render: (args) => (
    <CollapsibleSection {...args} className="w-96">
      <div className="space-y-2 text-sm">
        <p>Notification 1</p>
        <p>Notification 2</p>
        <p>Notification 3</p>
      </div>
    </CollapsibleSection>
  ),
}

export const Disabled: Story = {
  args: {
    title: 'Locked Section',
    disabled: true,
    defaultOpen: false,
  },
  render: (args) => (
    <CollapsibleSection {...args} className="w-96">
      <p className="text-muted-foreground text-sm">This section cannot be toggled.</p>
    </CollapsibleSection>
  ),
}

export const Nested: Story = {
  args: {
    title: 'Parent Section',
  },
  render: (args) => (
    <CollapsibleSection {...args} className="w-96">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">Parent content</p>
        <CollapsibleSection title="Child Section A" defaultOpen={false}>
          <p className="text-muted-foreground text-sm">Nested content A</p>
        </CollapsibleSection>
        <CollapsibleSection title="Child Section B">
          <p className="text-muted-foreground text-sm">Nested content B</p>
        </CollapsibleSection>
      </div>
    </CollapsibleSection>
  ),
}
