import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { AnimatedModal } from '../../components/motion'
import { Button } from '../../components/button'

const meta: Meta = {
  title: 'Feedback/AnimatedModal',
  component: AnimatedModal,
}

export default meta

const DefaultDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Animated Modal</Button>
      <AnimatedModal
        open={open}
        onClose={() => setOpen(false)}
        title="Animated Modal"
        description="This modal uses Framer Motion for smooth enter/exit animations."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Confirm</Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Notice the smooth scale and fade animation when opening and closing. The backdrop also
          fades in and out independently.
        </p>
      </AnimatedModal>
    </>
  )
}

export const Default: StoryFn = () => <DefaultDemo />

const SizesDemo = () => {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | null>(null)
  return (
    <div className="flex gap-2">
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Button key={s} variant="outline" onClick={() => setSize(s)}>
          {s.toUpperCase()}
        </Button>
      ))}
      {size && (
        <AnimatedModal
          open={!!size}
          onClose={() => setSize(null)}
          title={`Size: ${size}`}
          size={size}
        >
          <p className="text-muted-foreground">
            Modal with size=&quot;{size}&quot; and Framer Motion animations.
          </p>
        </AnimatedModal>
      )}
    </div>
  )
}

export const Sizes: StoryFn = () => <SizesDemo />
