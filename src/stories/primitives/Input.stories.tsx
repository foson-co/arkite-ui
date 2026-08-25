import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '../../components/input'

const meta = {
  title: 'Primitives/Input',
  component: Input,
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
    placeholder: 'Enter text...',
    size: 'md',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Small: Story = {
  args: { size: 'sm', placeholder: 'Small input' },
}

export const Large: Story = {
  args: { size: 'lg', placeholder: 'Large input' },
}

export const WithError: Story = {
  args: { error: true, errorMessage: 'This field is required' },
}

export const Disabled: Story = {
  args: { disabled: true, value: 'Disabled input' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
}
