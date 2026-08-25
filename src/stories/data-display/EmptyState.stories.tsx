import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState, NoResults, NoData, ErrorState } from '../../components/empty-state'
import { Button } from '../../components/button'
import { AlertTriangle, ShieldX, ServerCrash } from 'lucide-react'

const meta = {
  title: 'Data Display/EmptyState',
  component: EmptyState,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'search', 'error', 'no-data'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    title: 'No items found',
    description: 'Get started by creating your first item.',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithAction: Story = {
  args: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
    action: <Button variant="primary">Create Project</Button>,
  },
}

export const SearchNoResults: Story = {
  render: () => <NoResults />,
}

export const NoDataPreset: Story = {
  render: () => <NoData />,
}

export const ErrorPreset: Story = {
  render: () => <ErrorState />,
}

/* ─── Error Page Recipes ─── */

export const Page404: Story = {
  name: '404 — Not Found',
  render: () => (
    <EmptyState
      size="lg"
      icon={<AlertTriangle className="h-16 w-16" />}
      title="404 — 找不到頁面"
      description="你要找的頁面不存在或已被移除。"
      action={<Button onClick={() => window.history.back()}>回上一頁</Button>}
    />
  ),
}

export const Page403: Story = {
  name: '403 — Forbidden',
  render: () => (
    <EmptyState
      size="lg"
      icon={<ShieldX className="h-16 w-16" />}
      title="403 — 沒有權限"
      description="你沒有存取此頁面的權限，請聯繫管理員。"
      action={
        <Button variant="secondary" onClick={() => window.history.back()}>
          返回
        </Button>
      }
    />
  ),
}

export const Page500: Story = {
  name: '500 — Server Error',
  render: () => (
    <EmptyState
      size="lg"
      icon={<ServerCrash className="h-16 w-16" />}
      title="500 — 伺服器錯誤"
      description="系統發生異常，請稍後再試。如問題持續，請聯繫技術支援。"
      action={<Button onClick={() => window.location.reload()}>重新載入</Button>}
    />
  ),
}
