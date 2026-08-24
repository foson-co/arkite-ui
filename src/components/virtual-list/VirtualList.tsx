import {
  forwardRef,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type ReactElement,
  type CSSProperties,
  type ForwardedRef,
  type MutableRefObject,
} from 'react'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { Spinner } from '../spinner/Spinner'

/** Merges the internal scroll-element ref with a forwarded ref. */
function useMergedRef(
  localRef: MutableRefObject<HTMLDivElement | null>,
  forwardedRef: ForwardedRef<HTMLDivElement>
) {
  return useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node
      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
      } else if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [localRef, forwardedRef]
  )
}

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Unique key extractor */
  getItemKey?: (item: T, index: number) => string | number
  /** Render function for each item */
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => ReactNode
  /** Estimated item height (px) */
  estimateSize?: number
  /** Container height */
  height?: number | string
  /** Enable dynamic sizing (measure items after render) */
  dynamicSize?: boolean
  /** Gap between items (px) */
  gap?: number
  /** Overscan count (render extra items outside viewport) */
  overscan?: number
  /** Loading state */
  loading?: boolean
  /** Empty state content */
  emptyContent?: ReactNode
  /** Accessible label for the scrollable region */
  'aria-label'?: string
  /** Container className */
  className?: string
  /** Inner list className */
  innerClassName?: string
}

function VirtualListInner<T>(
  {
    items,
    getItemKey,
    renderItem,
    estimateSize = 48,
    height = 400,
    dynamicSize = false,
    gap = 0,
    overscan = 5,
    loading = false,
    emptyContent,
    'aria-label': ariaLabel,
    className,
    innerClassName,
  }: VirtualListProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const locale = useLocale()
  const parentRef = useRef<HTMLDivElement>(null)
  const setRefs = useMergedRef(parentRef, ref)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  })

  const virtualItems = virtualizer.getVirtualItems()

  if (loading) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        style={{ height }}
      >
        <Spinner size="md" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div
        ref={ref}
        className={cn('text-muted-foreground flex items-center justify-center text-sm', className)}
        style={{ height }}
      >
        {emptyContent ?? locale.virtualList.empty}
      </div>
    )
  }

  return (
    <div
      ref={setRefs}
      className={cn('overflow-auto', className)}
      style={{ height }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="region"
      aria-label={ariaLabel || locale.virtualList.label}
    >
      <div
        className={cn('relative w-full', innerClassName)}
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            ref={dynamicSize ? virtualizer.measureElement : undefined}
            data-index={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index, virtualItem)}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Efficiently renders large lists by only mounting visible items. */
export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: ForwardedRef<HTMLDivElement> }
) => ReactElement

// --- Infinite Scroll ---

export interface InfiniteScrollProps<T> extends Omit<VirtualListProps<T>, 'loading'> {
  /** Whether there are more items to load */
  hasMore: boolean
  /** Callback to load more items */
  onLoadMore: () => void
  /** Whether currently loading more */
  loadingMore?: boolean
  /** Initial loading state */
  loading?: boolean
  /** Distance from bottom to trigger load (px) */
  threshold?: number
  /** Loading more indicator */
  loadingMoreContent?: ReactNode
}

function InfiniteScrollInner<T>(
  {
    items,
    hasMore,
    onLoadMore,
    loadingMore = false,
    loading = false,
    threshold = 200,
    loadingMoreContent,
    renderItem,
    estimateSize = 48,
    height = 400,
    gap = 0,
    overscan = 5,
    getItemKey,
    dynamicSize = false,
    emptyContent,
    'aria-label': ariaLabel,
    className,
    innerClassName,
  }: InfiniteScrollProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const locale = useLocale()
  const parentRef = useRef<HTMLDivElement>(null)
  const setRefs = useMergedRef(parentRef, ref)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
  })

  const handleScroll = useCallback(() => {
    const el = parentRef.current
    if (!el || !hasMore || loadingMore) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom < threshold) {
      onLoadMore()
    }
  }, [hasMore, loadingMore, threshold, onLoadMore])

  useEffect(() => {
    const el = parentRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (loading) {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        style={{ height }}
      >
        <Spinner size="md" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div
        ref={ref}
        className={cn('text-muted-foreground flex items-center justify-center text-sm', className)}
        style={{ height }}
      >
        {emptyContent ?? locale.virtualList.empty}
      </div>
    )
  }

  const virtualItems = virtualizer.getVirtualItems()

  const loadingIndicator = loadingMore && (
    <div className="flex items-center justify-center py-4">
      {loadingMoreContent ?? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner size="sm" />
          <span>{locale.virtualList.loadingMore}</span>
        </div>
      )}
    </div>
  )

  const containerStyle: CSSProperties = {
    height: `${virtualizer.getTotalSize()}px`,
  }

  return (
    <div
      ref={setRefs}
      className={cn('overflow-auto', className)}
      style={{ height }}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      role="region"
      aria-label={ariaLabel || locale.virtualList.label}
    >
      <div className={cn('relative w-full', innerClassName)} style={containerStyle}>
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            ref={dynamicSize ? virtualizer.measureElement : undefined}
            data-index={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index, virtualItem)}
          </div>
        ))}
      </div>
      {loadingIndicator}
    </div>
  )
}

/** Virtualized list with automatic loading of additional items on scroll. */
export const InfiniteScroll = forwardRef(InfiniteScrollInner) as <T>(
  props: InfiniteScrollProps<T> & { ref?: ForwardedRef<HTMLDivElement> }
) => ReactElement
