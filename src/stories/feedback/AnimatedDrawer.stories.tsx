import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { AnimatedDrawer } from '../../components/motion'
import { Button } from '../../components/button'
import type { DrawerPosition } from '../../components/drawer'

const meta: Meta = {
  title: 'Feedback/AnimatedDrawer',
  component: AnimatedDrawer,
}

export default meta

const DefaultDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Animated Drawer</Button>
      <AnimatedDrawer
        open={open}
        onClose={() => setOpen(false)}
        title="Animated Drawer"
        description="Smooth slide animation powered by Framer Motion"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This drawer slides in from the right with a spring-like easing curve. The backdrop fades
            in simultaneously.
          </p>
          <p className="text-muted-foreground">
            Try closing it — notice the smooth exit animation as well.
          </p>
        </div>
      </AnimatedDrawer>
    </>
  )
}

export const Default: StoryFn = () => <DefaultDemo />

const PositionsDemo = () => {
  const [position, setPosition] = useState<DrawerPosition | null>(null)
  return (
    <div className="flex gap-2">
      {(['left', 'right', 'top', 'bottom'] as const).map((pos) => (
        <Button key={pos} variant="outline" onClick={() => setPosition(pos)}>
          {pos.charAt(0).toUpperCase() + pos.slice(1)}
        </Button>
      ))}
      {position && (
        <AnimatedDrawer
          open={!!position}
          onClose={() => setPosition(null)}
          position={position}
          title={`Drawer from ${position}`}
          size={position === 'top' || position === 'bottom' ? 'lg' : 'md'}
        >
          <p className="text-muted-foreground">
            Slides in from the {position} with direction-aware animation.
          </p>
        </AnimatedDrawer>
      )}
    </div>
  )
}

export const Positions: StoryFn = () => <PositionsDemo />
