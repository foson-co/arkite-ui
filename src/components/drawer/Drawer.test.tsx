import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from './Drawer'

// The Drawer uses requestAnimationFrame to coordinate mount/animation.
// We need to flush rAF callbacks so the component becomes visible in tests.
function flushRAF() {
  vi.advanceTimersByTime(0)
}

function renderOpenDrawer(props: Partial<React.ComponentProps<typeof Drawer>> = {}) {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const result = render(
    <Drawer open onClose={() => {}} {...props}>
      {props.children ?? <p>Drawer content</p>}
    </Drawer>
  )
  act(() => flushRAF())
  act(() => flushRAF())
  return result
}

describe('Drawer', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders when open', () => {
    renderOpenDrawer()
    expect(screen.getByText('Drawer content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Drawer open={false} onClose={() => {}}>
        <p>Hidden</p>
      </Drawer>
    )
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('renders title and description', () => {
    renderOpenDrawer({ title: 'My Title', description: 'My Description' })
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('My Description')).toBeInTheDocument()
  })

  it('calls onClose when escape is pressed', async () => {
    const onClose = vi.fn()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <Drawer open onClose={onClose}>
        Content
      </Drawer>
    )
    act(() => flushRAF())
    act(() => flushRAF())
    vi.useRealTimers()

    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close on escape when closeOnEscape is false', async () => {
    const onClose = vi.fn()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <Drawer open onClose={onClose} closeOnEscape={false}>
        Content
      </Drawer>
    )
    act(() => flushRAF())
    act(() => flushRAF())
    vi.useRealTimers()

    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <Drawer open onClose={onClose}>
        Content
      </Drawer>
    )
    act(() => flushRAF())
    act(() => flushRAF())
    vi.useRealTimers()

    const backdrops = document.querySelectorAll('[aria-hidden="true"]')
    const backdrop = backdrops[backdrops.length - 1]
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close on backdrop click when closeOnBackdropClick is false', async () => {
    const onClose = vi.fn()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <Drawer open onClose={onClose} closeOnBackdropClick={false}>
        Content
      </Drawer>
    )
    act(() => flushRAF())
    act(() => flushRAF())
    vi.useRealTimers()

    const backdrops = document.querySelectorAll('[aria-hidden="true"]')
    const backdrop = backdrops[backdrops.length - 1]
    await userEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders close button and calls onClose when clicked', async () => {
    const onClose = vi.fn()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    render(
      <Drawer open onClose={onClose} title="Test">
        Content
      </Drawer>
    )
    act(() => flushRAF())
    act(() => flushRAF())
    vi.useRealTimers()

    const closeBtn = screen.getByText('Close').closest('button')!
    await userEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('hides close button when showCloseButton is false', () => {
    renderOpenDrawer({ title: 'Test', showCloseButton: false })
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('renders footer', () => {
    renderOpenDrawer({ footer: <button>Save</button> })
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('renders children content', () => {
    renderOpenDrawer({
      children: <div>Custom child content</div>,
    })
    expect(screen.getByText('Custom child content')).toBeInTheDocument()
  })

  describe('position variants', () => {
    it.each(['left', 'right', 'top', 'bottom'] as const)(
      'renders with position="%s"',
      (position) => {
        renderOpenDrawer({ position, children: <p>Positioned content</p> })
        expect(screen.getByText('Positioned content')).toBeInTheDocument()
      }
    )
  })

  describe('size variants', () => {
    it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)('renders with size="%s"', (size) => {
      renderOpenDrawer({ size, children: <p>Sized content</p> })
      expect(screen.getByText('Sized content')).toBeInTheDocument()
    })
  })
})

describe('DrawerHeader', () => {
  it('renders with children', () => {
    render(<DrawerHeader>Header Content</DrawerHeader>)
    expect(screen.getByText('Header Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<DrawerHeader className="custom-class">Header</DrawerHeader>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('DrawerBody', () => {
  it('renders with children', () => {
    render(<DrawerBody>Body Content</DrawerBody>)
    expect(screen.getByText('Body Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<DrawerBody className="custom-class">Body</DrawerBody>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('DrawerFooter', () => {
  it('renders with children', () => {
    render(<DrawerFooter>Footer Content</DrawerFooter>)
    expect(screen.getByText('Footer Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<DrawerFooter className="custom-class">Footer</DrawerFooter>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
