import { render, screen, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScrollFade } from './ScrollFade'

/**
 * jsdom reports 0 for every layout metric, so scroll state is simulated by
 * defining the three properties `measure()` reads.
 */
function setMetrics(
  el: HTMLElement,
  {
    scrollLeft,
    scrollWidth,
    clientWidth,
  }: { scrollLeft: number; scrollWidth: number; clientWidth: number }
) {
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth, configurable: true })
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true })
  el.scrollLeft = scrollLeft
}

const scrollerOf = (container: HTMLElement) =>
  container.querySelector('[data-testid="scroller"]') as HTMLElement

const fade = (edge: 'start' | 'end') => document.querySelector(`[data-scroll-fade="${edge}"]`)

describe('ScrollFade', () => {
  it('renders its children', () => {
    render(<ScrollFade>content</ScrollFade>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('shows no fade when the content fits', () => {
    const { container } = render(<ScrollFade data-testid="scroller">fits</ScrollFade>)
    act(() => {
      setMetrics(scrollerOf(container), { scrollLeft: 0, scrollWidth: 300, clientWidth: 300 })
      scrollerOf(container).dispatchEvent(new Event('scroll', { bubbles: true }))
    })
    expect(fade('start')).toBeNull()
    expect(fade('end')).toBeNull()
  })

  it('shows only the end fade at the start of an overflowing row', () => {
    const { container } = render(<ScrollFade data-testid="scroller">wide</ScrollFade>)
    act(() => {
      setMetrics(scrollerOf(container), { scrollLeft: 0, scrollWidth: 900, clientWidth: 300 })
      scrollerOf(container).dispatchEvent(new Event('scroll', { bubbles: true }))
    })
    expect(fade('start')).toBeNull()
    expect(fade('end')).not.toBeNull()
  })

  it('shows both fades mid-scroll', () => {
    const { container } = render(<ScrollFade data-testid="scroller">wide</ScrollFade>)
    act(() => {
      setMetrics(scrollerOf(container), { scrollLeft: 300, scrollWidth: 900, clientWidth: 300 })
      scrollerOf(container).dispatchEvent(new Event('scroll', { bubbles: true }))
    })
    expect(fade('start')).not.toBeNull()
    expect(fade('end')).not.toBeNull()
  })

  it('drops the end fade once scrolled to the far edge', () => {
    const { container } = render(<ScrollFade data-testid="scroller">wide</ScrollFade>)
    act(() => {
      setMetrics(scrollerOf(container), { scrollLeft: 600, scrollWidth: 900, clientWidth: 300 })
      scrollerOf(container).dispatchEvent(new Event('scroll', { bubbles: true }))
    })
    expect(fade('start')).not.toBeNull()
    expect(fade('end')).toBeNull()
  })

  it('hides the fades from assistive tech', () => {
    const { container } = render(<ScrollFade data-testid="scroller">wide</ScrollFade>)
    act(() => {
      setMetrics(scrollerOf(container), { scrollLeft: 300, scrollWidth: 900, clientWidth: 300 })
      scrollerOf(container).dispatchEvent(new Event('scroll', { bubbles: true }))
    })
    expect(fade('start')).toHaveAttribute('aria-hidden', 'true')
    expect(fade('end')).toHaveAttribute('aria-hidden', 'true')
  })

  it('splits className (outer box) from scrollClassName (scrolling element)', () => {
    const { container } = render(
      <ScrollFade className="-mx-6" scrollClassName="px-6" data-testid="scroller">
        x
      </ScrollFade>
    )
    expect(container.firstElementChild).toHaveClass('relative', '-mx-6')
    expect(scrollerOf(container)).toHaveClass('overflow-x-auto', 'px-6')
  })

  it('forwards the ref to the scrolling element', () => {
    let node: HTMLDivElement | null = null
    const { container } = render(
      <ScrollFade
        ref={(n) => {
          node = n
        }}
        data-testid="scroller"
      >
        x
      </ScrollFade>
    )
    expect(node).toBe(scrollerOf(container))
  })
})
