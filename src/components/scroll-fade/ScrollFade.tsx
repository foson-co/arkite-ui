import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../utils/cn'

/** `data-*` passthrough — plain typed prop objects can't carry them otherwise. */
export type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined
}

export interface ScrollFadeProps extends HTMLAttributes<HTMLDivElement>, DataAttributes {
  /** Content that may overflow horizontally */
  children: ReactNode
  /**
   * Class for the **outer** box — layout and positioning (margins, height,
   * `flex-1`…). The fade overlays are positioned against this element.
   */
  className?: string
  /**
   * Class for the **scrolling** element — padding, `max-h-*`, background.
   * Anything that should scroll with, or clip, the content goes here.
   */
  scrollClassName?: string
}

/** Width of the fade, in px — matches the 12px sticky-column shadow spread. */
const FADE_WIDTH = 12

/**
 * Horizontal scroll container with edge fades that appear only on the side
 * where content is actually hidden — the "you can scroll this" affordance for
 * pill rows, tab strips, toolbars, and wide tables.
 *
 * The fades are driven by real scroll state (scroll + resize observed), not a
 * static gradient, so nothing shows when the content fits. They are painted
 * with `foreground` at low alpha, which reads as a shadow in light mode and a
 * glow in dark mode — no surface color to keep in sync, so it works unchanged
 * on `background`, `card`, or `muted`.
 *
 * The forwarded ref points at the scrolling element (for `scrollTo` etc.).
 *
 * @example
 * ```tsx
 * <ScrollFade className="-mx-6" scrollClassName="px-6">
 *   <TabsList>…</TabsList>
 * </ScrollFade>
 * ```
 */
export const ScrollFade = forwardRef<HTMLDivElement, ScrollFadeProps>(
  ({ children, className, scrollClassName, onScroll, ...props }, ref) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => scrollRef.current as HTMLDivElement)
    const [edges, setEdges] = useState({ start: false, end: false })

    const measure = useCallback(() => {
      const el = scrollRef.current
      if (!el) return
      const max = el.scrollWidth - el.clientWidth
      // 1px tolerance: sub-pixel layout leaves a fractional remainder at the
      // extremes, which would otherwise keep a fade permanently lit.
      const start = el.scrollLeft > 1
      const end = max > 1 && el.scrollLeft < max - 1
      setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))
    }, [])

    useEffect(() => {
      const el = scrollRef.current
      if (!el) return
      measure()
      // Content growth (async data) and container resize both change what is
      // hidden without ever firing `scroll`. Absent in jsdom — consumers run
      // component tests there, so this must degrade to scroll-only, not throw.
      if (typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(measure)
      observer.observe(el)
      const child = el.firstElementChild
      if (child) observer.observe(child)
      return () => observer.disconnect()
    }, [measure])

    return (
      <div className={cn('relative', className)}>
        <div
          ref={scrollRef}
          // overflow-x:auto forces the visible y-axis to compute to auto, so a
          // `max-h-*` on this element still scrolls vertically.
          className={cn('overflow-x-auto', scrollClassName)}
          {...props}
          // After the spread: a caller's own onScroll composes with the
          // measurement instead of silently replacing it.
          onScroll={(e) => {
            measure()
            onScroll?.(e)
          }}
        >
          {children}
        </div>
        {edges.start && (
          <span
            aria-hidden="true"
            data-scroll-fade="start"
            className="from-foreground/15 pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r to-transparent"
            style={{ width: FADE_WIDTH }}
          />
        )}
        {edges.end && (
          <span
            aria-hidden="true"
            data-scroll-fade="end"
            className="from-foreground/15 pointer-events-none absolute inset-y-0 right-0 bg-gradient-to-l to-transparent"
            style={{ width: FADE_WIDTH }}
          />
        )}
      </div>
    )
  }
)

ScrollFade.displayName = 'ScrollFade'
