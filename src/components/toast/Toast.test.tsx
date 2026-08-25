import { render, renderHook, act, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRef } from 'react'
import { Toast, ToastContainer, useToast, useToastStore } from './Toast'
import { ImperativeToastContainer } from './ToastContainer'
import { useImperativeToastStore } from './toast-store'
import { toast } from './toast-api'

describe('useToast', () => {
  beforeEach(() => {
    // Clear toasts between tests
    useToastStore.getState().dismissAllToasts()
  })

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current({ title: 'Hello' })
    })
    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0].title).toBe('Hello')
  })

  it('adds success toast with options object', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.success('Done', { description: 'Completed' })
    })
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(1)
    expect(toasts[0].variant).toBe('success')
    expect(toasts[0].title).toBe('Done')
    expect(toasts[0].description).toBe('Completed')
  })

  it('supports deprecated (title, description) shorthand with a warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.warning('Caution', 'Legacy description')
    })
    const toasts = useToastStore.getState().toasts
    expect(toasts[0].variant).toBe('warning')
    expect(toasts[0].description).toBe('Legacy description')
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('warning(title, description)'))
    warnSpy.mockRestore()
  })

  it('adds destructive toast via error() convenience method', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.error('Failed')
    })
    expect(useToastStore.getState().toasts[0].variant).toBe('destructive')
  })

  it('adds info toast', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.info('Note')
    })
    expect(useToastStore.getState().toasts[0].variant).toBe('info')
  })

  it('adds loading toast with spinner flag and no auto-dismiss', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.loading('Uploading...')
    })
    const toasts = useToastStore.getState().toasts
    expect(toasts[0].isLoading).toBe(true)
    expect(toasts[0].duration).toBe(0)
  })

  it('dismisses a toast', () => {
    const { result } = renderHook(() => useToast())
    let id: string
    act(() => {
      id = result.current({ title: 'Dismiss me' })
    })
    expect(useToastStore.getState().toasts).toHaveLength(1)
    act(() => {
      result.current.dismiss(id!)
    })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('dismisses all toasts', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.success('One')
      result.current.error('Two')
      result.current.info('Three')
    })
    expect(useToastStore.getState().toasts).toHaveLength(3)
    act(() => {
      result.current.dismissAll()
    })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('keeps clear() as deprecated alias of dismissAll()', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.success('One')
      result.current.error('Two')
    })
    expect(useToastStore.getState().toasts).toHaveLength(2)
    act(() => {
      result.current.clear()
    })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('shares the store with the imperative toast API', () => {
    const { result } = renderHook(() => useToast())
    let id: string
    act(() => {
      id = result.current.success('From hook')
    })
    expect(useImperativeToastStore).toBe(useToastStore)
    act(() => {
      toast.dismiss(id!)
    })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('limits hook-added toasts to max 5, removing oldest', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      for (let i = 0; i < 7; i++) {
        result.current.info(`Toast ${i}`)
      }
    })
    const toasts = useToastStore.getState().toasts
    expect(toasts).toHaveLength(5)
    expect(toasts[0].title).toBe('Toast 2')
    expect(toasts[4].title).toBe('Toast 6')
  })
})

describe('Toast component variants', () => {
  it('renders destructive variant with red styles', () => {
    render(<Toast id="t1" title="Boom" variant="destructive" onClose={() => {}} />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('bg-destructive-soft')
    expect(alert.className).toContain('text-destructive-soft-foreground')
  })

  it('supports deprecated error variant as alias for destructive', () => {
    render(
      <>
        <Toast id="t-old" title="Old" variant="error" onClose={() => {}} />
        <Toast id="t-new" title="New" variant="destructive" onClose={() => {}} />
      </>
    )
    const [oldToast, newToast] = screen.getAllByRole('alert')
    expect(oldToast.className).toBe(newToast.className)
    expect(oldToast.className).toContain('bg-destructive-soft')
  })

  it('accepts a custom className', () => {
    render(<Toast id="t2" title="Styled" className="my-custom" onClose={() => {}} />)
    expect(screen.getByRole('alert').className).toContain('my-custom')
  })

  it('renders a spinner instead of the variant icon when isLoading', () => {
    const { container } = render(
      <Toast id="t3" title="Loading" variant="success" isLoading onClose={() => {}} />
    )
    // spinner shown, variant icon suppressed (only spinner + close icon remain)
    expect(container.querySelector('.animate-spin')).not.toBeNull()
    expect(container.querySelectorAll('svg')).toHaveLength(2)
  })
})

describe('ToastContainer', () => {
  beforeEach(() => {
    useToastStore.getState().dismissAllToasts()
  })

  it('defaults to top-right position and forwards ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ToastContainer ref={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current!.className).toContain('top-4 right-4')
  })

  it('renders toasts added via the imperative API', () => {
    act(() => {
      toast.success('Imperative')
    })
    render(<ToastContainer />)
    expect(screen.getByRole('alert').textContent).toContain('Imperative')
  })

  it('renders deprecated error variant with destructive styles', () => {
    act(() => {
      useToastStore.getState().addToast({
        variant: 'error',
        title: 'Legacy failure',
      })
    })
    render(<ToastContainer />)
    const alert = screen.getByRole('alert')
    expect(alert.className).toContain('bg-destructive-soft')
    expect(alert.className).toContain('text-destructive-soft-foreground')
  })
})

describe('ImperativeToastContainer (deprecated alias)', () => {
  beforeEach(() => {
    useImperativeToastStore.getState().dismissAllToasts()
  })

  it('renders from the same store with top-right default position', () => {
    act(() => {
      toast.info('Aliased')
    })
    const ref = createRef<HTMLDivElement>()
    render(<ImperativeToastContainer ref={ref} />)
    expect(screen.getByRole('alert').textContent).toContain('Aliased')
    expect(ref.current!.className).toContain('top-4 right-4')
  })
})
