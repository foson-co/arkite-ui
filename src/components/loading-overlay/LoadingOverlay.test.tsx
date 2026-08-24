import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoadingOverlay } from './LoadingOverlay'

describe('LoadingOverlay', () => {
  it('renders when open is true (default)', () => {
    const { container } = render(<LoadingOverlay />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('does not render when open=false', () => {
    const { container } = render(<LoadingOverlay open={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('still supports the deprecated visible alias', () => {
    const { container } = render(<LoadingOverlay visible={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows label text', () => {
    render(<LoadingOverlay label="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders custom children instead of spinner', () => {
    render(
      <LoadingOverlay>
        <span data-testid="custom-child">custom</span>
      </LoadingOverlay>
    )
    expect(screen.getByTestId('custom-child')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('applies backdrop-blur-sm class when blur=true', () => {
    const { container } = render(<LoadingOverlay blur={true} />)
    expect(container.firstChild).toHaveClass('backdrop-blur-sm')
  })

  it('does not apply backdrop-blur-sm class when blur=false (default)', () => {
    const { container } = render(<LoadingOverlay />)
    expect(container.firstChild).not.toHaveClass('backdrop-blur-sm')
  })

  it('applies custom className', () => {
    const { container } = render(<LoadingOverlay className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  describe('fullscreen', () => {
    it('is container-relative by default (absolute, z-10, no blur)', () => {
      const { container } = render(<LoadingOverlay />)
      expect(container.firstChild).toHaveClass('absolute', 'inset-0', 'z-10')
      expect(container.firstChild).not.toHaveClass('fixed')
      expect(container.firstChild).not.toHaveClass('backdrop-blur-sm')
    })

    it('renders fixed inset-0 with high z-index and backdrop blur when fullscreen', () => {
      const { container } = render(<LoadingOverlay fullscreen />)
      expect(container.firstChild).toHaveClass('fixed', 'inset-0', 'z-50', 'backdrop-blur-sm')
      expect(container.firstChild).not.toHaveClass('absolute')
    })

    it('shows spinner and label inside a centered panel when fullscreen', () => {
      render(<LoadingOverlay fullscreen label="Syncing..." />)
      const label = screen.getByText('Syncing...')
      expect(label).toBeInTheDocument()
      expect(label.parentElement).toHaveClass('rounded-lg', 'bg-background', 'shadow-lg')
    })

    it('composes with open — renders nothing when open=false', () => {
      const { container } = render(<LoadingOverlay fullscreen open={false} />)
      expect(container.firstChild).toBeNull()
    })
  })
})
