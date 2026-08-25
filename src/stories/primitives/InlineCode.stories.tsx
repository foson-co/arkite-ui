import type { Meta, StoryObj } from '@storybook/react-vite'
import { InlineCode } from '../../components/inline-code'

const meta = {
  title: 'Primitives/InlineCode',
  component: InlineCode,
  args: {
    children: 'npm install @arkite-ui/core',
  },
} satisfies Meta<typeof InlineCode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AsSpan: Story = {
  args: { as: 'span', children: 'CUST-00123' },
}

export const InParagraph: Story = {
  render: () => (
    <p className="text-foreground text-sm">
      Use <InlineCode>createTheme()</InlineCode> to generate a custom theme from a hex color, then
      apply it with <InlineCode>applyTheme()</InlineCode>.
    </p>
  ),
}

export const IdDisplay: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Order ID:</span>
      <InlineCode as="span">ORD-2024-0042</InlineCode>
    </div>
  ),
}

export const KeyboardShortcut: Story = {
  render: () => (
    <p className="text-foreground text-sm">
      Press <InlineCode>Ctrl + K</InlineCode> to open the command palette.
    </p>
  ),
}
