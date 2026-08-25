import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BulkActionBar } from './BulkActionBar'

describe('BulkActionBar', () => {
  it('renders nothing when selectedCount is 0', () => {
    const { container } = render(
      <BulkActionBar selectedCount={0}>
        <button>Delete</button>
      </BulkActionBar>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders when selectedCount > 0', () => {
    render(<BulkActionBar selectedCount={3} />)
    expect(screen.getByRole('toolbar')).toBeInTheDocument()
  })

  it('displays default count text for multiple items', () => {
    render(<BulkActionBar selectedCount={5} />)
    expect(screen.getByText('5 items selected')).toBeInTheDocument()
  })

  it('displays singular text for 1 item', () => {
    render(<BulkActionBar selectedCount={1} />)
    expect(screen.getByText('1 item selected')).toBeInTheDocument()
  })

  it('renders children as action buttons', () => {
    render(
      <BulkActionBar selectedCount={2}>
        <button>Export</button>
        <button>Delete</button>
      </BulkActionBar>
    )
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<BulkActionBar selectedCount={3} onClose={onClose} />)
    await user.click(screen.getByLabelText('Deselect all'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders custom left slot', () => {
    render(<BulkActionBar selectedCount={7} left={<span>Custom: 7 users</span>} />)
    expect(screen.getByText('Custom: 7 users')).toBeInTheDocument()
  })

  it('renders custom right slot', () => {
    render(<BulkActionBar selectedCount={2} right={<button>Clear All</button>} />)
    expect(screen.getByText('Clear All')).toBeInTheDocument()
  })

  it('has correct aria-label', () => {
    render(<BulkActionBar selectedCount={4} />)
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', '4 items selected')
  })
})
