import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress, CircularProgress } from '../../components/progress'

const meta = {
  title: 'Feedback/Progress',
  component: Progress,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    variant: { control: 'select', options: ['default', 'success', 'warning', 'destructive'] },
    showLabel: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    striped: { control: 'boolean' },
    animated: { control: 'boolean' },
  },
  args: {
    value: 60,
    size: 'md',
    variant: 'default',
    'aria-label': 'Progress',
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
}

export const WithLabel: Story = {
  args: { showLabel: true, value: 75 },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
}

export const Indeterminate: Story = {
  args: { indeterminate: true },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
}

export const Striped: Story = {
  args: { striped: true, animated: true, value: 65 },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
}

export const AllVariants: Story = {
  render: () => (
    <div className="w-72 space-y-3">
      <Progress value={80} variant="default" showLabel aria-label="Default progress" />
      <Progress value={60} variant="success" showLabel aria-label="Success progress" />
      <Progress value={40} variant="warning" showLabel aria-label="Warning progress" />
      <Progress value={20} variant="destructive" showLabel aria-label="Destructive progress" />
    </div>
  ),
}

export const Circular: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CircularProgress value={25} showLabel aria-label="Progress at 25%" />
      <CircularProgress value={50} variant="success" showLabel aria-label="Success progress" />
      <CircularProgress value={75} variant="warning" showLabel aria-label="Warning progress" />
      <CircularProgress indeterminate aria-label="Loading" />
    </div>
  ),
}
