import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Radio, RadioGroup } from '../../components/radio'

const meta: Meta = {
  title: 'Form/Radio',
  component: RadioGroup,
  parameters: { layout: 'centered' },
}

export default meta

const planOptions = [
  { value: 'free', label: 'Free', description: 'Basic features for personal use' },
  { value: 'pro', label: 'Pro', description: 'Advanced features for professionals' },
  { value: 'team', label: 'Team', description: 'Collaboration for small teams' },
]

export const Default: StoryFn = () => (
  <RadioGroup name="plan" options={planOptions} defaultValue="pro" />
)

export const Controlled: StoryFn = () => {
  const [value, setValue] = useState('free')
  return (
    <div>
      <RadioGroup name="plan-controlled" options={planOptions} value={value} onChange={setValue} />
      <p className="text-muted-foreground mt-3 text-xs">Selected: {value}</p>
    </div>
  )
}

export const Horizontal: StoryFn = () => (
  <RadioGroup
    name="size"
    orientation="horizontal"
    options={[
      { value: 'sm', label: 'Small' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' },
    ]}
    defaultValue="md"
  />
)

export const Sizes: StoryFn = () => (
  <div className="flex flex-col gap-4">
    <Radio name="sizes" value="sm" size="sm" label="Small radio" defaultChecked />
    <Radio name="sizes" value="md" size="md" label="Medium radio" />
    <Radio name="sizes" value="lg" size="lg" label="Large radio" />
  </div>
)

export const Error: StoryFn = () => (
  <RadioGroup
    name="plan-error"
    options={planOptions}
    defaultValue="free"
    error
    errorMessage="Please choose a valid plan"
  />
)

export const Disabled: StoryFn = () => (
  <RadioGroup name="plan-disabled" options={planOptions} defaultValue="pro" disabled />
)

export const WithDisabledOption: StoryFn = () => (
  <RadioGroup
    name="plan-partial"
    options={[
      ...planOptions,
      { value: 'enterprise', label: 'Enterprise', description: 'Contact sales', disabled: true },
    ]}
    defaultValue="team"
  />
)
