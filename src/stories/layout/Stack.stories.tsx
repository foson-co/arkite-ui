import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack, HStack } from '../../components/stack'

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-primary/10 border-primary/20 rounded border px-4 py-2 text-sm">{children}</div>
)

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
  args: {
    direction: 'column',
    spacing: 'md',
  },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: (args) => (
    <Stack {...args}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <HStack spacing="md">
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </HStack>
  ),
}

export const SpaceBetween: Story = {
  render: () => (
    <HStack justify="between" fullWidth>
      <Box>Left</Box>
      <Box>Right</Box>
    </HStack>
  ),
  parameters: { layout: 'padded' },
}
