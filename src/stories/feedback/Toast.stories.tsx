import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast, ToastContainer, useToast } from '../../components/toast'
import { Button } from '../../components/button'

const meta = {
  title: 'Feedback/Toast',
  component: ToastContainer,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ToastContainer>

export default meta
type Story = StoryObj<typeof meta>

const ToastDemo = () => {
  const toast = useToast()
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => toast.success('Saved successfully')}>
          Success
        </Button>
        <Button variant="destructive" onClick={() => toast.error('Something went wrong')}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning('Trial expires soon')}>
          Warning
        </Button>
        <Button variant="secondary" onClick={() => toast.info('New version available')}>
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.loading('Uploading...', { description: 'This stays until dismissed' })
          }
        >
          Loading
        </Button>
        <Button variant="ghost" onClick={() => toast.dismissAll()}>
          Dismiss all
        </Button>
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}

export const Default: Story = {
  render: () => <ToastDemo />,
}

// App-level wiring, done ONCE at startup — the error parser is app knowledge
toast.configure({
  formatError: (err) =>
    (err as { detail?: string }).detail ?? (err instanceof Error ? err.message : String(err)),
})

const FromErrorDemo = () => (
  <div className="flex flex-wrap gap-2">
    <Button
      variant="destructive"
      onClick={() =>
        toast.fromError(new Error('Connection timed out'), { prefix: 'Failed to save' })
      }
    >
      Error instance
    </Button>
    <Button
      variant="outline"
      onClick={() =>
        toast.fromError({ detail: 'quota exceeded (429)' }, { prefix: 'Upload failed' })
      }
    >
      API envelope (custom formatError)
    </Button>
    <Button
      variant="ghost"
      onClick={() => toast.fromError({ opaque: true }, { prefix: 'Sync failed' })}
    >
      Unparseable → prefix only
    </Button>
    <ToastContainer position="top-right" />
  </div>
)

export const FromError: Story = {
  render: () => <FromErrorDemo />,
}
