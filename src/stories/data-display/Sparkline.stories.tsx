import type { Meta, StoryObj } from '@storybook/react-vite'
import { Sparkline } from '../../components/sparkline'

const upData = [10, 12, 11, 14, 13, 16, 15, 18, 17, 21]
const downData = [21, 19, 20, 17, 18, 15, 16, 13, 14, 11]
const flatData = [5, 5, 5, 5, 5, 5]

const meta = {
  title: 'Data Display/Sparkline',
  component: Sparkline,
  args: {
    data: upData,
  },
} satisfies Meta<typeof Sparkline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TrendDown: Story = {
  args: { data: downData },
}

export const Flat: Story = {
  args: { data: flatData },
}

export const ExplicitColor: Story = {
  args: { data: upData, color: 'hsl(var(--chart-1))' },
}

export const CustomSize: Story = {
  args: { data: upData, width: 160, height: 48, strokeWidth: 2 },
}

export const WithAriaLabel: Story = {
  args: { data: upData, 'aria-label': '30-day trend, up 110%' },
}

export const InContext: Story = {
  render: () => (
    <div className="w-72 divide-y rounded-lg border">
      {[
        { name: 'ARKW', price: '$142.30', data: upData },
        { name: 'ARKK', price: '$48.12', data: downData },
        { name: 'ARKG', price: '$31.05', data: flatData },
      ].map((row) => (
        <div key={row.name} className="flex items-center justify-between p-3">
          <span className="text-sm font-medium">{row.name}</span>
          <Sparkline data={row.data} aria-label={`${row.name} trend`} />
          <span className="text-muted-foreground text-sm">{row.price}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { layout: 'padded' },
}

export const Placeholder: Story = {
  name: 'Placeholder (no data)',
  render: () => (
    <div className="flex items-center gap-6">
      <div className="space-y-1 text-center">
        <Sparkline data={null} placeholder width={80} height={24} />
        <p className="text-2xs text-muted-foreground">placeholder</p>
      </div>
      <div className="space-y-1 text-center">
        <Sparkline data={[42]} placeholder width={80} height={24} />
        <p className="text-2xs text-muted-foreground">single point + placeholder</p>
      </div>
      <div className="space-y-1 text-center">
        <Sparkline
          data={[]}
          placeholder={<span className="text-muted-foreground text-xs">N/A</span>}
        />
        <p className="text-2xs text-muted-foreground">custom node</p>
      </div>
    </div>
  ),
}
