import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchInput } from '../../components/search-input'

const meta = {
  title: 'Form/SearchInput',
  component: SearchInput,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    placeholder: 'Search...',
    size: 'md',
  },
} satisfies Meta<typeof SearchInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: { loading: true },
}

export const WithDebounce: Story = {
  args: {
    debounce: 300,
    placeholder: 'Search with 300ms debounce...',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <SearchInput size="sm" placeholder="Small" />
      <SearchInput size="md" placeholder="Medium" />
      <SearchInput size="lg" placeholder="Large" />
    </div>
  ),
}
