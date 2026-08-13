import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Drawer } from '../../components/drawer'
import { Button } from '../../components/button'

const meta = {
  title: 'Feedback/Drawer',
  component: Drawer,
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof Drawer>

export default meta

const RightDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Drawer Title"
        description="This is a side panel"
      >
        <p className="text-muted-foreground p-4 text-sm">Drawer content goes here.</p>
      </Drawer>
    </>
  )
}

export const Right: StoryFn = () => <RightDemo />

const LeftDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Left Drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Navigation" position="left">
        <p className="text-muted-foreground p-4 text-sm">Left side content.</p>
      </Drawer>
    </>
  )
}

export const Left: StoryFn = () => <LeftDemo />

const BottomDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Bottom Drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Details" position="bottom">
        <p className="text-muted-foreground p-4 text-sm">Bottom panel content.</p>
      </Drawer>
    </>
  )
}

export const Bottom: StoryFn = () => <BottomDemo />

/**
 * Every position pads the edges a notch can reach — a bottom sheet gets
 * left/right insets too, because a landscape phone puts the notch on the side.
 *
 * `env()` cannot be faked from CSS, so the shaded bars below only *mark* where
 * a landscape notch and home indicator would sit; on this desktop viewport the
 * insets resolve to 0 and the drawer is unchanged. To see the real thing you
 * need a notched device (or a simulator) and `viewport-fit=cover` in the host
 * page's viewport meta — without it the browser reports 0 everywhere.
 */
const SafeAreaDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Simulated device cutouts — visual reference only, not the mechanism */}
      <div
        className="bg-destructive/15 pointer-events-none fixed inset-y-0 left-0 z-[60] w-8"
        aria-hidden="true"
      />
      <div
        className="bg-destructive/15 pointer-events-none fixed inset-x-0 bottom-0 z-[60] h-2"
        aria-hidden="true"
      />
      <div className="space-y-3">
        <p className="text-muted-foreground max-w-prose text-sm">
          The shaded strips mark where a landscape notch and home indicator would sit. The bottom
          sheet pads itself away from all three edges, so its first column is never clipped.
        </p>
        <Button onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
      </div>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Stock count"
        position="bottom"
        size="sm"
      >
        <div className="grid grid-cols-4 gap-2 text-sm">
          {['SKU', 'Location', 'Counted', 'Δ'].map((heading) => (
            <span key={heading} className="font-medium">
              {heading}
            </span>
          ))}
          {['A-1042', 'Rack 3', '18', '−2'].map((cell) => (
            <span key={cell} className="text-muted-foreground">
              {cell}
            </span>
          ))}
        </div>
      </Drawer>
    </>
  )
}

export const SafeArea: StoryFn = () => <SafeAreaDemo />
