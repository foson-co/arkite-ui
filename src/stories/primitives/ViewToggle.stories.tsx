import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { ViewToggle, type ViewMode } from '../../components/view-toggle'

const meta: Meta = {
  title: 'Primitives/ViewToggle',
  component: ViewToggle,
  parameters: { layout: 'centered' },
}

export default meta

export const Default: StoryFn = () => {
  const [view, setView] = useState<ViewMode>('table')
  return (
    <div className="flex items-center gap-4">
      <ViewToggle value={view} onChange={setView} />
      <span className="text-muted-foreground text-sm">Current: {view}</span>
    </div>
  )
}

export const Small: StoryFn = () => {
  const [view, setView] = useState<ViewMode>('card')
  return <ViewToggle value={view} onChange={setView} size="sm" />
}

export const WithContent: StoryFn = () => {
  const [view, setView] = useState<ViewMode>('table')
  return (
    <div className="w-[600px] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Items</h3>
        <ViewToggle value={view} onChange={setView} />
      </div>
      <div className="text-muted-foreground rounded-md border p-8 text-center text-sm">
        {view === 'table' ? 'Table view content' : 'Card grid content'}
      </div>
    </div>
  )
}
