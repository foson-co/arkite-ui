import { type ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Breadcrumb, BreadcrumbItem, BreadcrumbItemComponent } from './Breadcrumb'

describe('Breadcrumb', () => {
  const defaultItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Page' },
  ]

  it('renders items as a list', () => {
    render(<Breadcrumb items={defaultItems} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Current Page')).toBeInTheDocument()
  })

  it('renders list items', () => {
    render(<Breadcrumb items={defaultItems} />)
    const list = screen.getByRole('list')
    const listItems = list.querySelectorAll('li')
    expect(listItems).toHaveLength(3)
  })

  it('last item has aria-current="page"', () => {
    render(<Breadcrumb items={defaultItems} />)
    const currentPage = screen.getByText('Current Page').closest('[aria-current="page"]')
    expect(currentPage).toBeInTheDocument()
  })

  it('non-last items do not have aria-current', () => {
    render(<Breadcrumb items={defaultItems} />)
    const home = screen.getByText('Home').closest('[aria-current]')
    expect(home).not.toBeInTheDocument()
  })

  it('items with href render as links', () => {
    render(<Breadcrumb items={defaultItems} />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/')
    expect(links[1]).toHaveAttribute('href', '/products')
  })

  it('last item does not render as link even with href', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Last', href: '/last' },
        ]}
      />
    )
    // Last item should be a span, not a link
    const lastItem = screen.getByText('Last').closest('span[aria-current="page"]')
    expect(lastItem).toBeInTheDocument()
  })

  it('renders separator between items', () => {
    render(<Breadcrumb items={defaultItems} separator="|" />)
    const separators = screen.getAllByText('|')
    // Separators appear between items (not after last)
    expect(separators).toHaveLength(2)
  })

  it('has aria-label on nav', () => {
    render(<Breadcrumb items={defaultItems} />)
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Breadcrumb')
  })

  it('maxItems collapse shows ellipsis', () => {
    const manyItems = [
      { label: 'Home', href: '/' },
      { label: 'Category', href: '/cat' },
      { label: 'Sub', href: '/sub' },
      { label: 'Product', href: '/product' },
      { label: 'Current' },
    ]
    render(<Breadcrumb items={manyItems} maxItems={3} />)
    // Should show ellipsis
    expect(screen.getByText('...')).toBeInTheDocument()
    // Should show first item and last (maxItems - 1) items
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Current')).toBeInTheDocument()
    // Middle items should be collapsed
    expect(screen.queryByText('Category')).not.toBeInTheDocument()
    expect(screen.queryByText('Sub')).not.toBeInTheDocument()
  })

  describe('renderLink', () => {
    it('calls renderLink with { href, children, className, active } for items with href', () => {
      const renderLink = vi.fn(
        ({
          href,
          children,
          className,
          active,
        }: {
          href: string
          children: ReactNode
          className?: string
          active?: boolean
        }) => (
          <a href={href} className={className} data-active={active ? 'true' : 'false'}>
            {children}
          </a>
        )
      )
      render(
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Current', href: '/current' },
          ]}
          renderLink={renderLink}
        />
      )
      expect(renderLink).toHaveBeenCalledTimes(2)
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/')
      expect(links[0]).toHaveAttribute('data-active', 'false')
      expect(links[1]).toHaveAttribute('href', '/current')
      expect(links[1]).toHaveAttribute('data-active', 'true')
    })

    it('keeps default rendering for items without href', () => {
      const renderLink = vi.fn(({ href, children }: { href: string; children: ReactNode }) => (
        <a href={href}>{children}</a>
      ))
      render(<Breadcrumb items={defaultItems} renderLink={renderLink} />)
      // Only items with href go through renderLink
      expect(renderLink).toHaveBeenCalledTimes(2)
      // Last item (no href) keeps the default span with aria-current
      const current = screen.getByText('Current Page').closest('span[aria-current="page"]')
      expect(current).toBeInTheDocument()
    })
  })
})

describe('BreadcrumbItem (compound component)', () => {
  it('renders a list item', () => {
    render(
      <ol>
        <BreadcrumbItem data-testid="item">Content</BreadcrumbItem>
      </ol>
    )
    const item = screen.getByTestId('item')
    expect(item.tagName).toBe('LI')
    expect(item).toHaveTextContent('Content')
  })

  it('deprecated BreadcrumbItemComponent still renders and warns', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <ol>
        <BreadcrumbItemComponent data-testid="legacy">Legacy</BreadcrumbItemComponent>
      </ol>
    )
    expect(screen.getByTestId('legacy').tagName).toBe('LI')
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('`BreadcrumbItemComponent` is deprecated')
    )
    warnSpy.mockRestore()
  })
})
