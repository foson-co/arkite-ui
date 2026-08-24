import type { Meta, StoryFn } from '@storybook/react-vite'
import { DescriptionList, DescriptionItem } from '../../components/description-list/DescriptionList'
import { Badge } from '../../components/badge/Badge'
import { StatusDot } from '../../components/status-dot/StatusDot'

const meta: Meta<typeof DescriptionList> = {
  title: 'Data Display/DescriptionList',
  component: DescriptionList,
  parameters: { layout: 'padded' },
}

export default meta

// ── Default (Customer Info) ──

export const Default: StoryFn = () => (
  <div className="bg-card max-w-md rounded-lg border p-6">
    <h3 className="mb-2 text-lg font-semibold">Customer Info</h3>
    <DescriptionList>
      <DescriptionItem label="Full Name" value="Jane Smith" />
      <DescriptionItem label="Email" value="jane.smith@example.com" />
      <DescriptionItem label="Phone" value="+1 (555) 123-4567" />
      <DescriptionItem label="Company" value="Acme Corp" />
      <DescriptionItem label="Notes" />
    </DescriptionList>
  </div>
)

// ── No Divider ──

export const NoDivider: StoryFn = () => (
  <div className="bg-card max-w-md rounded-lg border p-6">
    <h3 className="mb-2 text-lg font-semibold">Order Summary</h3>
    <DescriptionList divider={false}>
      <DescriptionItem label="Order ID" value="#ORD-20240315" />
      <DescriptionItem label="Date" value="2024-03-15" />
      <DescriptionItem label="Total" value="$1,250.00" />
      <DescriptionItem label="Payment" value="Credit Card" />
    </DescriptionList>
  </div>
)

// ── With Custom Content (Badge / StatusDot) ──

export const WithCustomContent: StoryFn = () => (
  <div className="bg-card max-w-md rounded-lg border p-6">
    <h3 className="mb-2 text-lg font-semibold">Project Details</h3>
    <DescriptionList>
      <DescriptionItem label="Project" value="Arkite UI" />
      <DescriptionItem label="Status">
        <Badge variant="success">Active</Badge>
      </DescriptionItem>
      <DescriptionItem label="Priority">
        <Badge variant="warning">High</Badge>
      </DescriptionItem>
      <DescriptionItem label="Health">
        <div className="flex items-center gap-2">
          <StatusDot status="online" pulse />
          <span className="text-sm font-medium">Healthy</span>
        </div>
      </DescriptionItem>
      <DescriptionItem label="Environment">
        <Badge variant="info">Production</Badge>
      </DescriptionItem>
    </DescriptionList>
  </div>
)

// ── Single Item ──

export const SingleItem: StoryFn = () => (
  <div className="bg-card max-w-md rounded-lg border p-6">
    <DescriptionList>
      <DescriptionItem label="Status">
        <Badge variant="success">Active</Badge>
      </DescriptionItem>
    </DescriptionList>
  </div>
)
