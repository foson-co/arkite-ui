import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Card, CardHeader, CardContent, CardFooter } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies padding variants', () => {
    const { container } = render(<Card padding="lg">Content</Card>)
    expect(container.firstChild).toHaveClass('p-6')
  })

  it('applies shadow variants', () => {
    const { container } = render(<Card shadow="lg">Content</Card>)
    expect(container.firstChild).toHaveClass('shadow-lg')
  })

  it('applies hoverable style', () => {
    const { container } = render(<Card hoverable>Content</Card>)
    expect(container.firstChild).toHaveClass('cursor-pointer')
  })

  it('applies border by default', () => {
    const { container } = render(<Card>Content</Card>)
    expect(container.firstChild).toHaveClass('border')
  })

  it('removes border when bordered=false', () => {
    const { container } = render(<Card bordered={false}>Content</Card>)
    expect(container.firstChild).not.toHaveClass('border')
  })
})

describe('Card density', () => {
  it('defaults to default density (unchanged padding)', () => {
    render(
      <Card>
        <CardHeader title="Title" data-testid="header" />
        <CardContent data-testid="content">Body</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    )
    expect(screen.getByTestId('header')).toHaveClass('p-4')
    expect(screen.getByTestId('content')).toHaveClass('p-4', '[&:not(:first-child)]:pt-0')
    expect(screen.getByTestId('footer')).toHaveClass('p-4', '[&:not(:first-child)]:pt-0')
    expect(screen.getByText('Title')).toHaveClass('text-lg')
  })

  it('compact density on Card tightens header, content, and footer', () => {
    render(
      <Card density="compact">
        <CardHeader title="Title" description="Desc" data-testid="header" />
        <CardContent data-testid="content">Body</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    )
    expect(screen.getByTestId('header')).toHaveClass('px-4', 'py-3')
    expect(screen.getByTestId('content')).toHaveClass('px-4', 'py-3', '[&:not(:first-child)]:pt-0')
    expect(screen.getByTestId('footer')).toHaveClass('px-4', 'py-3', '[&:not(:first-child)]:pt-0')
    expect(screen.getByText('Title')).toHaveClass('text-sm')
    expect(screen.getByText('Desc')).toHaveClass('text-xs')
  })

  it('subcomponent density prop overrides the Card context', () => {
    render(
      <Card density="compact">
        <CardContent density="default" data-testid="content">
          Body
        </CardContent>
      </Card>
    )
    expect(screen.getByTestId('content')).toHaveClass('p-4', '[&:not(:first-child)]:pt-0')
  })
})

describe('Card section top padding', () => {
  // Regression: `pt-0` used to be unconditional, so a header-less Card (the
  // shape you get when a DataTable or a plain list is the whole card body) put
  // the content flush against the top border while the other three sides kept
  // their 16px inset.
  it('keeps its own top padding when CardContent is the first child', () => {
    render(
      <Card>
        <CardContent data-testid="content">Body</CardContent>
      </Card>
    )
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('p-4')
    expect(content.matches(':first-child')).toBe(true)
  })

  it('drops top padding when a CardHeader sits above it', () => {
    render(
      <Card>
        <CardHeader title="Title" />
        <CardContent data-testid="content">Body</CardContent>
      </Card>
    )
    const content = screen.getByTestId('content')
    expect(content).toHaveClass('[&:not(:first-child)]:pt-0')
    expect(content.matches(':not(:first-child)')).toBe(true)
  })

  it('keeps its own top padding when CardFooter is the only child', () => {
    render(
      <Card>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>
    )
    expect(screen.getByTestId('footer').matches(':first-child')).toBe(true)
  })
})

describe('CardHeader', () => {
  it('renders title and description', () => {
    render(<CardHeader title="Title" description="Desc" />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Desc')).toBeInTheDocument()
  })

  it('renders the title as h3 by default', () => {
    render(<CardHeader title="Title" />)
    expect(screen.getByRole('heading', { level: 3, name: 'Title' })).toBeInTheDocument()
  })

  it('headingLevel changes the title element', () => {
    render(<CardHeader title="Title" headingLevel={2} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument()
  })

  it('renders action slot', () => {
    render(<CardHeader title="Title" action={<button>Action</button>} />)
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders actions slot as a right-aligned row', () => {
    render(
      <CardHeader
        title="Title"
        actions={
          <>
            <button>Refresh</button>
            <button>Settings</button>
          </>
        }
      />
    )
    const refresh = screen.getByText('Refresh')
    expect(refresh).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(refresh.parentElement).toHaveClass('flex', 'items-center', 'gap-1')
  })
})

describe('CardContent', () => {
  it('renders children', () => {
    render(<CardContent>Body</CardContent>)
    expect(screen.getByText('Body')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})

describe('Card interactive', () => {
  it('adds button semantics and activates on click and Enter/Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Card interactive onClick={onClick}>
        Open item
      </Card>
    )
    const card = screen.getByRole('button', { name: 'Open item' })
    expect(card).toHaveAttribute('tabindex', '0')
    await user.click(card)
    card.focus()
    await user.keyboard('{Enter} ')
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('Enter on an inner interactive child does not double-activate the card', async () => {
    const user = userEvent.setup()
    const onCardClick = vi.fn()
    const onInnerClick = vi.fn()
    render(
      <Card interactive aria-label="Item card" onClick={onCardClick}>
        <button type="button" onClick={onInnerClick}>
          Inner
        </button>
      </Card>
    )
    screen.getByRole('button', { name: 'Inner' }).focus()
    await user.keyboard('{Enter}')
    expect(onInnerClick).toHaveBeenCalled()
    // Click bubbling from the inner button is the consumer's stopPropagation
    // call to make; Enter must not synthesize an extra card activation
    expect(onCardClick).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }))
  })

  it('without onClick stays a plain div (no role/tabindex)', () => {
    render(<Card interactive>Static</Card>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // ── `onClick` alone grants button semantics (v0.23, issue #24 / #26) ──
  // These replace three tests that locked in the previous behaviour, where a
  // card given only `onClick` was clickable but had no keyboard path. Those
  // tests existed precisely so this change could not happen silently — they
  // failed when the condition was relaxed, which is what they were for.
  it('onClick alone gives button semantics without interactive', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Open item</Card>)

    const card = screen.getByRole('button', { name: 'Open item' })
    expect(card).toHaveAttribute('tabindex', '0')

    await user.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('onClick alone is reachable by keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <>
        <button type="button">before</button>
        <Card onClick={onClick}>Card body</Card>
        <button type="button">after</button>
      </>
    )

    screen.getByRole('button', { name: 'before' }).focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Card body' })).toHaveFocus()

    await user.keyboard('{Enter} ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('passing interactive changes nothing (deprecated, ignored)', async () => {
    const user = userEvent.setup()
    const withProp = vi.fn()
    const withoutProp = vi.fn()
    const { rerender } = render(
      <Card interactive onClick={withProp}>
        Same either way
      </Card>
    )
    const a = screen.getByRole('button', { name: 'Same either way' })
    const aAttrs = [a.getAttribute('role'), a.getAttribute('tabindex'), a.className]
    await user.click(a)

    rerender(<Card onClick={withoutProp}>Same either way</Card>)
    const b = screen.getByRole('button', { name: 'Same either way' })
    expect([b.getAttribute('role'), b.getAttribute('tabindex'), b.className]).toEqual(aAttrs)
    await user.click(b)

    expect(withProp).toHaveBeenCalledTimes(1)
    expect(withoutProp).toHaveBeenCalledTimes(1)
  })

  it('interactive without onClick still stays a plain div', () => {
    render(<Card interactive>Static</Card>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  // The one regression risk of granting semantics from `onClick`: a card that
  // already contains its own control now yields TWO tab stops. Four ark-shield
  // sites and one ark-crm site have this shape (issue #26). Enter still does
  // not double-activate — that is covered above — but the extra stop is real,
  // and consumers whose card wraps a control should move the navigation onto
  // an explicit link/button inside the card instead.
  it('a card containing its own control yields two tab stops', async () => {
    const user = userEvent.setup()
    const onCard = vi.fn()
    const onInner = vi.fn()
    render(
      <>
        <button type="button">before</button>
        <Card aria-label="Item card" onClick={onCard}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onInner()
            }}
          >
            Inner
          </button>
        </Card>
      </>
    )

    screen.getByRole('button', { name: 'before' }).focus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Item card' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Inner' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(onInner).toHaveBeenCalledTimes(1)
    expect(onCard).not.toHaveBeenCalled()
  })
})
