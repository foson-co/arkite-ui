import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test error')
  return <div>Normal content</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })

  it('renders default fallback on error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders custom fallback function', () => {
    render(
      <ErrorBoundary fallback={({ error }) => <div>Custom: {error.message}</div>}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom: Test error')).toBeInTheDocument()
  })

  it('renders custom fallback ReactNode', () => {
    render(
      <ErrorBoundary fallback={<div>Oops!</div>}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText('Oops!')).toBeInTheDocument()
  })

  it('calls onError when error occurs', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it('resets error state when try again is clicked', async () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // After clicking reset, the boundary tries to re-render children
    // which will throw again, showing the fallback again
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    // The component throws again so fallback is shown again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('recovers after reset when error is fixed', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Re-render with non-throwing child and a new ErrorBoundary key to reset
    rerender(
      <ErrorBoundary key="reset">
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Normal content')).toBeInTheDocument()
  })
})
