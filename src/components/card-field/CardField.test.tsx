import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CardField, CardGrid } from './CardField'

describe('CardField', () => {
  it('renders label and value', () => {
    render(<CardField label="Name" value="John Doe" />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('shows dash placeholder when no value or children', () => {
    render(<CardField label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders children instead of value when both provided', () => {
    render(
      <CardField label="Status" value="fallback">
        <span data-testid="custom">Active</span>
      </CardField>
    )
    expect(screen.getByTestId('custom')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByText('fallback')).not.toBeInTheDocument()
  })

  it('renders children when only children is provided', () => {
    render(
      <CardField label="Custom">
        <a href="/test">Link</a>
      </CardField>
    )
    expect(screen.getByText('Link')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<CardField label="Test" value="val" className="my-custom-class" />)
    expect(container.firstElementChild?.className).toContain('my-custom-class')
  })

  it('applies default space-y-1 class', () => {
    const { container } = render(<CardField label="Test" value="val" />)
    expect(container.firstElementChild?.className).toContain('space-y-1')
  })

  it('renders value as ReactNode', () => {
    render(<CardField label="Price" value={<strong>$100</strong>} />)
    expect(screen.getByText('$100')).toBeInTheDocument()
  })
})

describe('CardGrid', () => {
  it('renders children', () => {
    render(
      <CardGrid>
        <div>Child 1</div>
        <div>Child 2</div>
      </CardGrid>
    )
    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('applies default 2 column grid class', () => {
    const { container } = render(
      <CardGrid>
        <div>A</div>
      </CardGrid>
    )
    expect(container.firstElementChild?.className).toContain('sm:grid-cols-2')
  })

  it('applies specified column count', () => {
    const { container } = render(
      <CardGrid columns={3}>
        <div>A</div>
      </CardGrid>
    )
    expect(container.firstElementChild?.className).toContain('sm:grid-cols-3')
  })

  it('applies base grid and gap classes', () => {
    const { container } = render(
      <CardGrid>
        <div>A</div>
      </CardGrid>
    )
    const el = container.firstElementChild
    expect(el?.className).toContain('grid')
    expect(el?.className).toContain('grid-cols-1')
    expect(el?.className).toContain('gap-4')
  })

  it('accepts custom className', () => {
    const { container } = render(
      <CardGrid className="extra-class">
        <div>A</div>
      </CardGrid>
    )
    expect(container.firstElementChild?.className).toContain('extra-class')
  })

  it('supports single column', () => {
    const { container } = render(
      <CardGrid columns={1}>
        <div>A</div>
      </CardGrid>
    )
    expect(container.firstElementChild?.className).toContain('sm:grid-cols-1')
  })

  it('supports four columns', () => {
    const { container } = render(
      <CardGrid columns={4}>
        <div>A</div>
      </CardGrid>
    )
    expect(container.firstElementChild?.className).toContain('sm:grid-cols-4')
  })
})
