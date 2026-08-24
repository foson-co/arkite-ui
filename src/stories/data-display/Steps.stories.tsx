import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Steps, type StepItem } from '../../components/steps'
import { Button } from '../../components/button'

const meta: Meta = {
  title: 'Data Display/Steps',
  component: Steps,
}

export default meta

const steps: StepItem[] = [
  { label: 'Account', description: 'Create your account' },
  { label: 'Profile', description: 'Complete your profile' },
  { label: 'Settings', description: 'Configure preferences' },
  { label: 'Done', description: 'Ready to go' },
]

const InteractiveDemo = () => {
  const [current, setCurrent] = useState(1)
  return (
    <div className="space-y-6">
      <Steps steps={steps} currentStep={current} />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
        >
          Back
        </Button>
        <Button
          size="sm"
          onClick={() => setCurrent(Math.min(steps.length, current + 1))}
          disabled={current >= steps.length}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export const Horizontal: StoryFn = () => <InteractiveDemo />

const VerticalDemo = () => {
  const [current, setCurrent] = useState(2)
  return (
    <div className="space-y-6">
      <Steps steps={steps} currentStep={current} orientation="vertical" />
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setCurrent(Math.max(0, current - 1))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setCurrent(Math.min(steps.length, current + 1))}>
          Next
        </Button>
      </div>
    </div>
  )
}

export const Vertical: StoryFn = () => <VerticalDemo />

export const AllComplete: StoryFn = () => <Steps steps={steps} currentStep={steps.length} />

export const Small: StoryFn = () => <Steps steps={steps} currentStep={1} size="sm" />
