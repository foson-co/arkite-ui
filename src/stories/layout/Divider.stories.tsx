import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from '../../components/divider'

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    labelPosition: {
      control: 'select',
      options: ['left', 'center', 'right'],
    },
  },
} satisfies Meta<typeof Divider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <p className="mb-2 text-sm">Above</p>
      <Divider />
      <p className="mt-2 text-sm">Below</p>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="w-64">
      <Divider label="OR" />
    </div>
  ),
}

export const LabelPositions: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <Divider label="Left" labelPosition="left" />
      <Divider label="Center" labelPosition="center" />
      <Divider label="Right" labelPosition="right" />
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-2">
      <span className="text-sm">Home</span>
      <Divider orientation="vertical" />
      <span className="text-sm">Settings</span>
      <Divider orientation="vertical" />
      <span className="text-sm">Profile</span>
    </div>
  ),
}
