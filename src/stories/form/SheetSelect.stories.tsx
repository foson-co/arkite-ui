import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { SheetSelect } from '../../components/sheet-select'

const meta: Meta<typeof SheetSelect> = {
  title: 'Form/SheetSelect',
  component: SheetSelect,
  parameters: { layout: 'padded' },
}

export default meta

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian', disabled: true },
]

// ── Default (interactive) ──

function DefaultDemo() {
  const [value, setValue] = useState('')

  return (
    <div className="max-w-sm">
      <SheetSelect
        options={fruits}
        value={value}
        onChange={setValue}
        placeholder="Pick a fruit"
        title="Fruit"
      />
    </div>
  )
}

export const Default: StoryFn = () => <DefaultDemo />

// ── With Descriptions ──

function WithDescriptionsDemo() {
  const [value, setValue] = useState('standard')

  return (
    <div className="max-w-sm">
      <SheetSelect
        options={[
          { value: 'standard', label: 'Standard', description: '3-5 business days' },
          { value: 'express', label: 'Express', description: '1-2 business days' },
          { value: 'pickup', label: 'Store pickup', description: 'Ready in 2 hours' },
        ]}
        value={value}
        onChange={setValue}
        title="Shipping method"
      />
    </div>
  )
}

export const WithDescriptions: StoryFn = () => <WithDescriptionsDemo />

// ── Sizes ──

export const Sizes: StoryFn = () => (
  <div className="max-w-sm space-y-3">
    <SheetSelect options={fruits} size="sm" placeholder="Small" />
    <SheetSelect options={fruits} size="md" placeholder="Medium" />
    <SheetSelect options={fruits} size="lg" placeholder="Large" />
  </div>
)

// ── Error ──

export const Error: StoryFn = () => (
  <div className="max-w-sm">
    <SheetSelect
      options={fruits}
      placeholder="Pick a fruit"
      error
      errorMessage="Please select a fruit"
    />
  </div>
)

// ── Disabled ──

export const Disabled: StoryFn = () => (
  <div className="max-w-sm">
    <SheetSelect options={fruits} value="apple" disabled />
  </div>
)

// ── Custom Option Rendering ──

function RenderOptionDemo() {
  const [value, setValue] = useState('twd')

  return (
    <div className="max-w-sm">
      <SheetSelect
        options={[
          { value: 'twd', label: 'TWD', description: 'New Taiwan Dollar' },
          { value: 'usd', label: 'USD', description: 'US Dollar' },
          { value: 'jpy', label: 'JPY', description: 'Japanese Yen' },
        ]}
        value={value}
        onChange={setValue}
        title="Currency"
        renderOption={(option, selected) => (
          <span className="flex items-baseline gap-2">
            <span className={selected ? 'font-semibold' : 'font-medium'}>{option.label}</span>
            <span className="text-muted-foreground text-xs">{option.description}</span>
          </span>
        )}
      />
    </div>
  )
}

export const CustomOptionRendering: StoryFn = () => <RenderOptionDemo />
