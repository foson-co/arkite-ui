import { useState } from 'react'
import type { Meta, StoryObj, StoryFn } from '@storybook/react-vite'
import { SegmentedControl } from '../../components/segmented-control'

const meta = {
  title: 'Primitives/SegmentedControl',
  component: SegmentedControl,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    size: 'md',
    options: [
      { value: 'list', label: 'List' },
      { value: 'grid', label: 'Grid' },
      { value: 'board', label: 'Board' },
    ],
    value: 'list',
    onChange: () => {},
  },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

const ControlledDemo: StoryFn<typeof SegmentedControl> = (args) => {
  const [value, setValue] = useState(args.value)
  return <SegmentedControl {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
  render: ControlledDemo,
}

export const Small: Story = {
  args: { size: 'sm' },
  render: ControlledDemo,
}

export const Large: Story = {
  args: { size: 'lg' },
  render: ControlledDemo,
}

export const FullWidth: Story = {
  args: { fullWidth: true },
  render: ControlledDemo,
  parameters: { layout: 'padded' },
}

export const Disabled: Story = {
  args: { disabled: true },
  render: ControlledDemo,
}

export const TwoOptions: Story = {
  args: {
    options: [
      { value: 'table', label: 'Table' },
      { value: 'card', label: 'Card' },
    ],
    value: 'table',
  },
  render: ControlledDemo,
}

export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived', disabled: true },
    ],
    value: 'all',
  },
  render: ControlledDemo,
}

function AllSizesDemo() {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ]
  const [sm, setSm] = useState('a')
  const [md, setMd] = useState('a')
  const [lg, setLg] = useState('a')

  return (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl size="sm" options={options} value={sm} onChange={setSm} />
      <SegmentedControl size="md" options={options} value={md} onChange={setMd} />
      <SegmentedControl size="lg" options={options} value={lg} onChange={setLg} />
    </div>
  )
}

export const AllSizes: Story = {
  render: AllSizesDemo,
}
