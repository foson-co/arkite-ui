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

  // ── `onClick` without `interactive` ────────────────────────────────────
  // These lock in TODAY's behaviour, which is a known accessibility gap
  // (issue #24; fleet impact measured in #26). They are not an endorsement:
  // the point is that the combination had NO test at all, so changing it —
  // e.g. adopting direction A, "onClick alone grants button semantics" —
  // would have been silent. If A lands, these three must fail and be
  // rewritten to assert the new contract. That is the intended alarm.
  it('onClick without interactive: click fires but no button semantics', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Clickable but not reachable</Card>)

    const card = screen.getByText('Clickable but not reachable')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(card).not.toHaveAttribute('role')
    expect(card).not.toHaveAttribute('tabindex')

    await user.click(card)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('onClick without interactive: not reachable by keyboard (WCAG 2.1.1 gap)', async () => {
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
    // Tab skips straight past the card — there is no stop on it
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('onClick without interactive: Enter/Space on the card does nothing', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Card onClick={onClick}>Card body</Card>)

    const card = screen.getByText('Card body')
    card.focus() // no tabIndex, so this is a no-op on a plain div
    await user.keyboard('{Enter} ')
    expect(onClick).not.toHaveBeenCalled()
  })
})
