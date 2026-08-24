import type { Meta, StoryFn } from '@storybook/react-vite'
import { Checkbox, CheckboxCard } from '../../components/checkbox'

const meta: Meta = {
  title: 'Form/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
}

export default meta

export const Default: StoryFn = () => <Checkbox aria-label="Accept" />

export const Checked: StoryFn = () => (
  <div className="flex flex-col gap-3">
    <Checkbox defaultChecked size="sm" label="Small checked" />
    <Checkbox defaultChecked size="md" label="Medium checked" />
    <Checkbox defaultChecked size="lg" label="Large checked" />
  </div>
)

export const WithLabel: StoryFn = () => (
  <Checkbox label="Subscribe to newsletter" description="Receive product updates every week" />
)

export const Error: StoryFn = () => (
  <div className="flex flex-col gap-3">
    <Checkbox label="Accept terms" error errorMessage="You must accept the terms" />
    <Checkbox label="Checked with error" error defaultChecked />
  </div>
)

export const Disabled: StoryFn = () => (
  <div className="flex flex-col gap-3">
    <Checkbox label="Disabled unchecked" disabled />
    <Checkbox label="Disabled checked" disabled defaultChecked />
  </div>
)

export const Card: StoryFn = () => (
  <div className="flex w-80 flex-col gap-3">
    <CheckboxCard label="Email notifications" description="Get notified about account activity" />
    <CheckboxCard
      label="SMS notifications"
      description="Get notified via text message"
      defaultChecked
    />
    <CheckboxCard label="Push notifications" description="This option is unavailable" disabled />
    <CheckboxCard
      label="Marketing emails"
      description="Promotions and offers"
      error
      errorMessage="This selection is required"
    />
  </div>
)
