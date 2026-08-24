import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { PinInput } from '../../components/pin-input'

const meta: Meta = {
  title: 'Form/PinInput',
  component: PinInput,
  parameters: { layout: 'centered' },
}

export default meta

export const Default: StoryFn = () => {
  const [value, setValue] = useState('')
  const [done, setDone] = useState<string | null>(null)
  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line jsx-a11y/no-autofocus -- story 的作用就是示範 autoFocus prop */}
      <PinInput value={value} onChange={setValue} onComplete={setDone} autoFocus />
      <p className="text-muted-foreground text-xs">
        {done ? `Completed: ${done}` : `Value: ${value || '(empty)'}`}
      </p>
    </div>
  )
}

export const FourDigits: StoryFn = () => <PinInput length={4} />

export const Alphanumeric: StoryFn = () => <PinInput type="alphanumeric" length={5} />

export const Masked: StoryFn = () => <PinInput masked />

export const Sizes: StoryFn = () => (
  <div className="flex flex-col items-center gap-4">
    <PinInput size="sm" length={4} />
    <PinInput size="md" length={4} />
    <PinInput size="lg" length={4} />
  </div>
)

export const ErrorState: StoryFn = () => <PinInput error defaultValue="123456" />

export const Disabled: StoryFn = () => <PinInput disabled defaultValue="42" />
