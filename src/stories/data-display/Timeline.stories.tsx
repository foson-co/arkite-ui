import type { Meta, StoryFn } from '@storybook/react-vite'
import { Timeline, type TimelineItem } from '../../components/timeline'
import { Badge } from '../../components/badge'

const meta: Meta = {
  title: 'Data Display/Timeline',
  component: Timeline,
}

export default meta

const auditItems: TimelineItem[] = [
  {
    date: '2024-01-15 14:32',
    title: 'User logged in',
    description: 'wilson@example.com from 192.168.1.1',
    variant: 'primary',
  },
  {
    date: '2024-01-15 14:35',
    title: 'Settings updated',
    description: 'Changed notification preferences',
    variant: 'muted',
  },
  {
    date: '2024-01-15 14:38',
    title: 'Verification email sent',
    description: 'Delivery scheduled by the notification service',
    variant: 'info',
  },
  {
    date: '2024-01-15 14:40',
    title: 'API key created',
    description: (
      <div className="mt-1 flex items-center gap-2">
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">sk-prod-***</code>
        <Badge variant="success">Active</Badge>
      </div>
    ),
    variant: 'success',
  },
  {
    date: '2024-01-15 15:00',
    title: 'Failed login attempt',
    description: 'Invalid password (3rd attempt)',
    variant: 'destructive',
  },
  {
    date: '2024-01-15 15:05',
    title: 'Account locked',
    description: 'Too many failed attempts. Auto-unlock in 30 minutes.',
    variant: 'warning',
  },
]

export const AuditLog: StoryFn = () => <Timeline items={auditItems} />

export const Small: StoryFn = () => <Timeline items={auditItems} size="sm" />

const simpleItems: TimelineItem[] = [
  { title: 'Order placed', date: 'Jan 10' },
  { title: 'Payment confirmed', date: 'Jan 10' },
  { title: 'Processing', date: 'Jan 11', variant: 'primary' },
  { title: 'Shipped', date: 'Jan 12', variant: 'success' },
]

export const Simple: StoryFn = () => <Timeline items={simpleItems} />
