import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal open onClose={() => {}}>
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Hidden</p>
      </Modal>
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('renders title and description', () => {
    render(
      <Modal open onClose={() => {}} title="My Title" description="My Description">
        Content
      </Modal>
    )
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('My Description')).toBeInTheDocument()
  })

  it('calls onClose when escape is pressed', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose}>
        Content
      </Modal>
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close on escape when closeOnEscape is false', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} closeOnEscape={false}>
        Content
      </Modal>
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose}>
        Content
      </Modal>
    )
    // The backdrop is the div with aria-hidden="true"
    const backdrops = document.querySelectorAll('[aria-hidden="true"]')
    const backdrop = backdrops[backdrops.length - 1]
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close on backdrop click when closeOnBackdropClick is false', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} closeOnBackdropClick={false}>
        Content
      </Modal>
    )
    const backdrops = document.querySelectorAll('[aria-hidden="true"]')
    const backdrop = backdrops[backdrops.length - 1]
    await userEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders close button and calls onClose when clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Test">
        Content
      </Modal>
    )
    const closeBtn = screen.getByText('Close').closest('button')!
    await userEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal open onClose={() => {}} title="Test" showCloseButton={false}>
        Content
      </Modal>
    )
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('renders footer', () => {
    render(
      <Modal open onClose={() => {}} footer={<button>Save</button>}>
        Content
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('has correct aria attributes', () => {
    render(
      <Modal open onClose={() => {}} title="Dialog Title" description="Dialog Description">
        Content
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // ids are generated with useId so multiple modals on the same page don't
    // collide — assert the linkage, not a hardcoded id value
    expect(dialog).toHaveAttribute('aria-labelledby', screen.getByText('Dialog Title').id)
    expect(dialog).toHaveAttribute('aria-describedby', screen.getByText('Dialog Description').id)
  })

  // ark-finance feedback ①: without a height cap + scrollable body, long
  // content grows past the viewport while body scroll is locked
  it('caps panel height and makes the body scrollable', () => {
    render(
      <Modal open onClose={() => {}} title="Long">
        <p>content</p>
      </Modal>
    )
    const body = screen.getByText('content').parentElement!
    expect(body).toHaveClass('overflow-y-auto', 'min-h-0')
    // Without onSubmit the body's parent IS the panel
    expect(body.parentElement!.className).toContain('max-h-[calc(100vh-2rem)]')
  })

  // ark-finance feedback ②: a submit button in `footer` must reach the form
  // fields in `children` without form="<id>" plumbing
  it('onSubmit wraps sections in a form; footer submit button submits it', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <Modal
        open
        onClose={() => {}}
        title="Create"
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      >
        <input aria-label="Name" defaultValue="x" />
      </Modal>
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('without onSubmit no form element is rendered', () => {
    render(
      <Modal open onClose={() => {}} title="Plain">
        <p>body</p>
      </Modal>
    )
    expect(document.querySelector('[role="dialog"] form')).toBeNull()
  })
})
