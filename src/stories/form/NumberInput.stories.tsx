import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { NumberInput } from '../../components/number-input'

const meta: Meta = {
  title: 'Form/NumberInput',
  component: NumberInput,
  parameters: { layout: 'centered' },
}

export default meta

export const Default: StoryFn = () => {
  const [value, setValue] = useState<number | null>(42)
  return (
    <div className="w-64">
      <NumberInput
        value={value}
        onChange={setValue}
        placeholder="Enter number"
        aria-label="Number input"
      />
      <p className="text-muted-foreground mt-2 text-xs">Value: {value ?? 'null'}</p>
    </div>
  )
}

export const WithMinMax: StoryFn = () => {
  const [value, setValue] = useState<number | null>(5)
  return (
    <div className="w-64">
      <NumberInput
        value={value}
        onChange={setValue}
        min={0}
        max={10}
        step={1}
        aria-label="Number with range"
      />
      <p className="text-muted-foreground mt-2 text-xs">Range: 0–10</p>
    </div>
  )
}

export const Currency: StoryFn = () => {
  const [value, setValue] = useState<number | null>(99.99)
  return (
    <div className="w-64">
      <NumberInput
        value={value}
        onChange={setValue}
        prefix="$"
        precision={2}
        min={0}
        step={0.01}
        aria-label="Amount"
      />
    </div>
  )
}

export const Percentage: StoryFn = () => {
  const [value, setValue] = useState<number | null>(75)
  return (
    <div className="w-64">
      <NumberInput
        value={value}
        onChange={setValue}
        suffix="%"
        min={0}
        max={100}
        step={5}
        aria-label="Percentage"
      />
    </div>
  )
}

export const WithoutControls: StoryFn = () => {
  const [value, setValue] = useState<number | null>(100)
  return (
    <div className="w-64">
      <NumberInput value={value} onChange={setValue} controls={false} aria-label="Number input" />
    </div>
  )
}

export const Sizes: StoryFn = () => (
  <div className="flex w-64 flex-col gap-3">
    <NumberInput defaultValue={10} size="sm" placeholder="Small" aria-label="Small number input" />
    <NumberInput
      defaultValue={20}
      size="md"
      placeholder="Medium"
      aria-label="Medium number input"
    />
    <NumberInput defaultValue={30} size="lg" placeholder="Large" aria-label="Large number input" />
  </div>
)

export const Error: StoryFn = () => (
  <div className="w-64">
    <NumberInput
      defaultValue={-5}
      error
      errorMessage="Value must be positive"
      min={0}
      aria-label="Number input"
    />
  </div>
)

export const Disabled: StoryFn = () => (
  <div className="w-64">
    <NumberInput defaultValue={42} disabled aria-label="Number input" />
  </div>
)
