import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { AnimatedToastContainer, useAnimatedToast } from '../../components/motion'
import { Button } from '../../components/button'
import type { ToastPosition } from '../../components/toast'

const meta: Meta = {
  component: AnimatedToastContainer,
  title: 'Feedback/AnimatedToast',
}

export default meta

const DefaultDemo = () => {
  const toast = useAnimatedToast()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success('Success', 'Operation completed successfully')}>
          Success Toast
        </Button>
        <Button variant="destructive" onClick={() => toast.error('Error', 'Something went wrong')}>
          Error Toast
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.warning('Warning', 'Please check your input')}
        >
          Warning Toast
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.info('Info', 'A new version is available')}
        >
          Info Toast
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Toasts slide in from the edge with Framer Motion and animate out when dismissed or expired.
      </p>
      <AnimatedToastContainer position="top-right" />
    </div>
  )
}

export const Default: StoryFn = () => <DefaultDemo />

const PositionsDemo = () => {
  const toast = useAnimatedToast()
  const [position, setPosition] = useState<ToastPosition>('top-right')

  const positions: ToastPosition[] = [
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center',
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {positions.map((pos) => (
          <Button
            key={pos}
            variant={position === pos ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPosition(pos)}
          >
            {pos}
          </Button>
        ))}
      </div>
      <Button onClick={() => toast.success('Toast', `Position: ${position}`)}>Show Toast</Button>
      <AnimatedToastContainer position={position} />
    </div>
  )
}

export const Positions: StoryFn = () => <PositionsDemo />

const WithActionDemo = () => {
  const toast = useAnimatedToast()
  return (
    <div>
      <Button
        onClick={() =>
          toast({
            title: 'File deleted',
            description: 'document.pdf has been removed',
            variant: 'default',
            duration: 8000,
            action: {
              label: 'Undo',
              onClick: () => toast.success('Restored', 'File has been restored'),
            },
          })
        }
      >
        Delete File (with Undo)
      </Button>
      <AnimatedToastContainer position="bottom-right" />
    </div>
  )
}

export const WithAction: StoryFn = () => <WithActionDemo />
