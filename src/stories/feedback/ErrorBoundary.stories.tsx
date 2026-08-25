import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { ErrorBoundary } from '../../components/error-boundary'
import { Button } from '../../components/button'

const meta = {
  title: 'Feedback/ErrorBoundary',
  component: ErrorBoundary,
} satisfies Meta<typeof ErrorBoundary>

export default meta

function BuggyComponent() {
  const [shouldThrow, setShouldThrow] = useState(false)
  if (shouldThrow) throw new Error('Something went wrong in the component!')
  return (
    <div className="space-y-2 rounded-lg border p-6 text-center">
      <p className="text-muted-foreground text-sm">
        This is a normal component. Click the button to trigger an error.
      </p>
      <Button variant="destructive" onClick={() => setShouldThrow(true)}>
        Trigger Error
      </Button>
    </div>
  )
}

export const Default: StoryFn = () => (
  <ErrorBoundary>
    <BuggyComponent />
  </ErrorBoundary>
)

export const CustomFallback: StoryFn = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <div className="space-y-2 rounded-lg border border-yellow-300 bg-yellow-50 p-6 text-center">
        <p className="font-semibold text-yellow-800">Oops!</p>
        <p className="text-sm text-yellow-700">{error.message}</p>
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
      </div>
    )}
  >
    <BuggyComponent />
  </ErrorBoundary>
)
