import { useState, useCallback } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { VirtualList, InfiniteScroll } from '../../components/virtual-list'
import { Badge } from '../../components/badge'

const meta: Meta = {
  component: VirtualList,
  subcomponents: { InfiniteScroll },
  title: 'Data Display/VirtualList',
}

export default meta

// Generate sample data
function generateItems(count: number, offset = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: offset + i,
    name: `Item ${offset + i + 1}`,
    status: ['active', 'inactive', 'pending'][i % 3] as string,
    value: Math.floor(Math.random() * 1000),
  }))
}

const BasicDemo = () => {
  const items = generateItems(10000)
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">Rendering 10,000 items with virtual scrolling</p>
      <VirtualList
        items={items}
        getItemKey={(item) => item.id}
        estimateSize={48}
        height={400}
        className="rounded-lg border"
        renderItem={(item) => (
          <div className="hover:bg-muted/50 flex items-center justify-between border-b px-4 py-3 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{item.name}</span>
              <Badge
                variant={
                  item.status === 'active'
                    ? 'success'
                    : item.status === 'pending'
                      ? 'warning'
                      : 'secondary'
                }
              >
                {item.status}
              </Badge>
            </div>
            <span className="text-muted-foreground text-sm">{item.value}</span>
          </div>
        )}
      />
    </div>
  )
}

export const Basic: StoryFn = () => <BasicDemo />

const DynamicHeightDemo = () => {
  const items = Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    title: `Item ${i + 1}`,
    description:
      i % 3 === 0
        ? 'Short description.'
        : i % 3 === 1
          ? 'This is a medium length description that takes a bit more space to display properly.'
          : 'This is a longer description that demonstrates dynamic height virtual scrolling. Each item can have a different height and the virtualizer will measure them correctly.',
  }))

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">Dynamic item heights (measured after render)</p>
      <VirtualList
        items={items}
        getItemKey={(item) => item.id}
        estimateSize={80}
        height={400}
        dynamicSize
        gap={1}
        className="rounded-lg border"
        renderItem={(item) => (
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
          </div>
        )}
      />
    </div>
  )
}

export const DynamicHeight: StoryFn = () => <DynamicHeightDemo />

const InfiniteScrollDemo = () => {
  const [items, setItems] = useState(() => generateItems(50))
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const handleLoadMore = useCallback(() => {
    if (loadingMore) return
    setLoadingMore(true)
    // Simulate async load
    setTimeout(() => {
      setItems((prev) => {
        const newItems = [...prev, ...generateItems(30, prev.length)]
        if (newItems.length >= 500) setHasMore(false)
        return newItems
      })
      setLoadingMore(false)
    }, 800)
  }, [loadingMore])

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">
        Loaded: {items.length} items {hasMore ? '(scroll for more)' : '(all loaded)'}
      </p>
      <InfiniteScroll
        items={items}
        getItemKey={(item) => item.id}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        loadingMore={loadingMore}
        estimateSize={48}
        height={400}
        threshold={300}
        className="rounded-lg border"
        renderItem={(item) => (
          <div className="hover:bg-muted/50 flex items-center justify-between border-b px-4 py-3 transition-colors">
            <span className="text-sm font-medium">{item.name}</span>
            <Badge variant="secondary">{item.value}</Badge>
          </div>
        )}
      />
    </div>
  )
}

export const InfiniteScrollExample: StoryFn = () => <InfiniteScrollDemo />

const EmptyStateDemo = () => (
  <VirtualList
    items={[]}
    renderItem={() => null}
    height={200}
    className="rounded-lg border"
    emptyContent="No items to display"
  />
)

export const EmptyState: StoryFn = () => <EmptyStateDemo />

const LoadingDemo = () => (
  <VirtualList
    items={[]}
    renderItem={() => null}
    loading
    height={200}
    className="rounded-lg border"
  />
)

export const Loading: StoryFn = () => <LoadingDemo />
