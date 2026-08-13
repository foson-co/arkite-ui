import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { renderHook } from '@testing-library/react'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return { ...actual }
})

import {
  AnimatedModal,
  AnimatedDrawer,
  AnimatedToastContainer,
  useAnimatedToast,
  useReducedMotion,
} from './index'

describe('Motion exports', () => {
  it('exports AnimatedModal', () => {
    expect(AnimatedModal).toBeDefined()
  })

  it('exports AnimatedDrawer', () => {
    expect(AnimatedDrawer).toBeDefined()
  })

  it('exports AnimatedToastContainer', () => {
    expect(AnimatedToastContainer).toBeDefined()
  })

  it('exports useAnimatedToast', () => {
    expect(useAnimatedToast).toBeDefined()
  })

  it('exports useReducedMotion', () => {
    expect(useReducedMotion).toBeDefined()
  })
})

describe('AnimatedModal', () => {
  it('renders title and children when open', async () => {
    render(
      <AnimatedModal open onClose={() => {}} title="Test Title">
        <p>Modal body</p>
      </AnimatedModal>
    )
    expect(await screen.findByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('does not render content when open is false', () => {
    render(
      <AnimatedModal open={false} onClose={() => {}}>
        <p>Hidden content</p>
      </AnimatedModal>
    )
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = vi.fn()
    render(
      <AnimatedModal open onClose={onClose}>
        Content
      </AnimatedModal>
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('AnimatedDrawer', () => {
  it('renders title and children when open', async () => {
    render(
      <AnimatedDrawer open onClose={() => {}} title="Drawer Title">
        <p>Drawer body</p>
      </AnimatedDrawer>
    )
    expect(await screen.findByText('Drawer Title')).toBeInTheDocument()
    expect(screen.getByText('Drawer body')).toBeInTheDocument()
  })

  it('does not render content when open is false', () => {
    render(
      <AnimatedDrawer open={false} onClose={() => {}}>
        <p>Hidden drawer</p>
      </AnimatedDrawer>
    )
    expect(screen.queryByText('Hidden drawer')).not.toBeInTheDocument()
  })

  // Shares Drawer's position/safe-area table — this guards against the two
  // copies drifting apart again.
  it('carries the same safe-area insets as Drawer', async () => {
    render(
      <AnimatedDrawer open onClose={() => {}} position="bottom" className="panel-under-test">
        <p>Inset drawer</p>
      </AnimatedDrawer>
    )
    await screen.findByText('Inset drawer')
    const panel = document.querySelector('.panel-under-test')!
    expect(panel.className).toContain('pl-[env(safe-area-inset-left)]')
    expect(panel.className).toContain('pr-[env(safe-area-inset-right)]')
    expect(panel.className).toContain('pb-[env(safe-area-inset-bottom)]')
  })
})

describe('useReducedMotion', () => {
  it('returns a boolean', () => {
    const { result } = renderHook(() => useReducedMotion())
    expect(typeof result.current).toBe('boolean')
  })
})
