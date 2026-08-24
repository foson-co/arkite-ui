import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { LoadingOverlay } from '../../components/loading-overlay'

const meta: Meta = {
  title: 'Feedback/LoadingOverlay',
  component: LoadingOverlay,
  parameters: { layout: 'padded' },
}

export default meta

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-background relative h-48 w-full rounded-md border p-4">
    <p className="text-muted-foreground text-sm">Content underneath the overlay</p>
    <p className="mt-2 text-sm">This text is covered by the loading overlay.</p>
    {children}
  </div>
)

export const Default: StoryFn = () => (
  <Box>
    <LoadingOverlay />
  </Box>
)

export const WithLabel: StoryFn = () => (
  <Box>
    <LoadingOverlay label="Loading data..." />
  </Box>
)

export const WithBlur: StoryFn = () => (
  <Box>
    <LoadingOverlay blur label="Processing..." />
  </Box>
)

export const Sizes: StoryFn = () => (
  <div className="flex gap-4">
    {(['sm', 'md', 'lg'] as const).map((size) => (
      <div key={size} className="bg-background relative h-32 w-48 rounded-md border p-4">
        <p className="text-muted-foreground text-xs">size=&quot;{size}&quot;</p>
        <LoadingOverlay size={size} />
      </div>
    ))}
  </div>
)

export const Fullscreen: StoryFn = () => {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        className="rounded-md border px-3 py-1.5 text-sm"
        onClick={() => {
          setOpen(true)
          setTimeout(() => setOpen(false), 2000)
        }}
      >
        Show fullscreen overlay (2s)
      </button>
      <LoadingOverlay fullscreen open={open} label="Syncing data..." />
    </div>
  )
}
Fullscreen.parameters = {
  docs: {
    description: {
      story:
        'With `fullscreen`, the overlay covers the entire viewport (fixed, z-50, backdrop blur) with a centered panel — for app-level busy states like sync or upload.',
    },
  },
}

export const Hidden: StoryFn = () => (
  <Box>
    <LoadingOverlay open={false} />
  </Box>
)
Hidden.parameters = {
  docs: { description: { story: 'When `open={false}`, nothing is rendered.' } },
}

export const CustomContent: StoryFn = () => (
  <Box>
    <LoadingOverlay>
      <div className="text-center">
        <div className="text-2xl">⏳</div>
        <p className="mt-1 text-sm font-medium">Please wait...</p>
      </div>
    </LoadingOverlay>
  </Box>
)
