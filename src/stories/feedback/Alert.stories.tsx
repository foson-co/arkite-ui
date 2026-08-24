import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from '../../components/alert'

const meta = {
  title: 'Feedback/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'destructive'],
    },
    dismissible: { control: 'boolean' },
  },
  args: {
    variant: 'info',
    title: 'Heads up!',
    children: 'You can add components to your app using the CLI.',
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your changes have been saved.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Your trial expires in 3 days.',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    title: 'Error',
    children: 'Something went wrong. Please try again.',
  },
}

export const Dismissible: Story = {
  args: { dismissible: true },
}

export const AllVariants: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      <Alert variant="info" title="Info">
        Informational message.
      </Alert>
      <Alert variant="success" title="Success">
        Operation completed.
      </Alert>
      <Alert variant="warning" title="Warning">
        Please review carefully.
      </Alert>
      <Alert variant="destructive" title="Error">
        Something went wrong.
      </Alert>
    </div>
  ),
}
