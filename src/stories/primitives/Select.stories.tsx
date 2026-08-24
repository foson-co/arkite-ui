import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select } from '../../components/select'

const sampleOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte', disabled: true },
]

const meta = {
  title: 'Primitives/Select',
  component: Select,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    error: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    options: sampleOptions,
    placeholder: 'Select framework...',
    size: 'md',
    'aria-label': 'Select option',
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  args: { error: true, errorMessage: 'Please select an option' },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Select size="sm" options={sampleOptions} placeholder="Small" aria-label="Small select" />
      <Select size="md" options={sampleOptions} placeholder="Medium" aria-label="Medium select" />
      <Select size="lg" options={sampleOptions} placeholder="Large" aria-label="Large select" />
    </div>
  ),
}
