import type { Meta, StoryFn } from '@storybook/react-vite'
import { CardField, CardGrid } from '../../components/card-field/CardField'
import { Badge } from '../../components/badge/Badge'
import { StatusDot } from '../../components/status-dot/StatusDot'

const meta: Meta<typeof CardField> = {
  title: 'Data Display/CardField',
  component: CardField,
  parameters: { layout: 'padded' },
}

export default meta

// ── Single Field ──

export const SingleField: StoryFn = () => <CardField label="Full Name" value="John Doe" />

// ── Grid Layout (user detail page pattern) ──

export const GridLayout: StoryFn = () => (
  <div className="bg-card max-w-2xl rounded-lg border p-6">
    <h3 className="mb-4 text-lg font-semibold">User Details</h3>
    <CardGrid columns={2}>
      <CardField label="Full Name" value="Jane Smith" />
      <CardField label="Email" value="jane.smith@example.com" />
      <CardField label="Phone" value="+1 (555) 123-4567" />
      <CardField label="Department" value="Engineering" />
      <CardField label="Role" value="Senior Developer" />
      <CardField label="Location" value="San Francisco, CA" />
      <CardField label="Start Date" value="2023-03-15" />
      <CardField label="Manager" value="Alex Johnson" />
    </CardGrid>
  </div>
)

// ── Three Columns ──

export const ThreeColumns: StoryFn = () => (
  <div className="bg-card max-w-3xl rounded-lg border p-6">
    <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
    <CardGrid columns={3}>
      <CardField label="Order ID" value="#ORD-20240315" />
      <CardField label="Date" value="2024-03-15" />
      <CardField label="Total" value="$1,250.00" />
      <CardField label="Payment" value="Credit Card" />
      <CardField label="Shipping" value="Express (2-day)" />
      <CardField label="Tracking" value="1Z999AA10123456784" />
    </CardGrid>
  </div>
)

// ── Custom Content (with Badge / StatusDot as value) ──

export const CustomContent: StoryFn = () => (
  <div className="bg-card max-w-2xl rounded-lg border p-6">
    <h3 className="mb-4 text-lg font-semibold">Project Overview</h3>
    <CardGrid columns={2}>
      <CardField label="Project Name" value="Arkite UI" />
      <CardField label="Status">
        <div className="flex items-center gap-2">
          <StatusDot status="online" pulse />
          <span className="text-sm font-medium">Active</span>
        </div>
      </CardField>
      <CardField label="Priority">
        <Badge variant="warning">High</Badge>
      </CardField>
      <CardField label="Environment">
        <Badge variant="info">Production</Badge>
      </CardField>
      <CardField label="Health">
        <div className="flex items-center gap-2">
          <StatusDot status="busy" />
          <span className="text-sm font-medium">Degraded</span>
        </div>
      </CardField>
      <CardField label="Notes" />
    </CardGrid>
  </div>
)
