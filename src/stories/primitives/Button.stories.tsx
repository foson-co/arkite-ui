import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../../components/button'

const meta = {
  title: 'Primitives/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'gradient'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon'],
    },
    loading: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Gradient: Story = {
  args: { variant: 'gradient' },
}

export const Small: Story = {
  args: { size: 'sm', children: 'Small' },
}

export const Large: Story = {
  args: { size: 'lg', children: 'Large' },
}

export const Loading: Story = {
  args: { loading: true, children: 'Saving...' },
}

export const FullWidth: Story = {
  args: { fullWidth: true, children: 'Full Width' },
  parameters: { layout: 'padded' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="gradient">Gradient</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Link: Story = {
  render: () => (
    <p className="text-sm">
      Inline action in a sentence or table cell: <Button variant="link">view details</Button> — link
      look, button semantics. Use a real <code>&lt;a&gt;</code> for navigation.
    </p>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}
