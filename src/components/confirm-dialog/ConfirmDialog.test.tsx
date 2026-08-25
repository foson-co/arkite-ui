import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ConfirmDialog, DeleteConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders title and description when open', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        title="Confirm?"
        description="Are you sure?"
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByText('Confirm?')).toBeInTheDocument()
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ConfirmDialog open={false} onClose={vi.fn()} title="Confirm?" onConfirm={vi.fn()} />)
    expect(screen.queryByText('Confirm?')).not.toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog open onClose={vi.fn()} title="Confirm?" onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn()
    render(<ConfirmDialog open onClose={onClose} title="Confirm?" onConfirm={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows destructive variant with Delete label', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        variant="destructive"
        title="Delete?"
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('uses custom confirmLabel', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        title="Remove?"
        confirmLabel="Yes, remove"
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Yes, remove' })).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<ConfirmDialog open onClose={vi.fn()} title="Saving..." onConfirm={vi.fn()} loading />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('shows warning variant with icon', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        variant="warning"
        title="Warning!"
        onConfirm={vi.fn()}
      />
    )
    expect(screen.getByText('Warning!')).toBeInTheDocument()
  })

  it('applies custom className to the dialog content', () => {
    render(
      <ConfirmDialog
        open
        onClose={vi.fn()}
        title="Confirm?"
        onConfirm={vi.fn()}
        className="my-dialog"
      />
    )
    const content = document.querySelector('.my-dialog')
    expect(content).not.toBeNull()
    expect(content).toContainElement(screen.getByText('Confirm?'))
  })
})

describe('DeleteConfirmDialog', () => {
  it('renders with default delete text', () => {
    render(<DeleteConfirmDialog open onClose={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This action cannot be undone. All associated data will be permanently removed.'
      )
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders with custom itemName', () => {
    render(<DeleteConfirmDialog open onClose={vi.fn()} onConfirm={vi.fn()} itemName="this user" />)
    expect(screen.getByText('Delete this user?')).toBeInTheDocument()
  })

  it('calls onConfirm when delete button is clicked', async () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmDialog open onClose={vi.fn()} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
