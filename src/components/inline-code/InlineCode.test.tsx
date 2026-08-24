import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { InlineCode } from './InlineCode'

describe('InlineCode', () => {
  it('renders as <code> by default', () => {
    render(<InlineCode>abc-123</InlineCode>)
    const el = screen.getByText('abc-123')
    expect(el.tagName).toBe('CODE')
  })

  it('renders as <span> when specified', () => {
    render(<InlineCode as="span">abc-123</InlineCode>)
    const el = screen.getByText('abc-123')
    expect(el.tagName).toBe('SPAN')
  })

  it('applies default styling classes', () => {
    render(<InlineCode>test</InlineCode>)
    const el = screen.getByText('test')
    expect(el).toHaveClass('rounded', 'bg-muted', 'px-1.5', 'py-0.5', 'text-xs', 'font-mono')
  })

  it('merges custom className', () => {
    render(<InlineCode className="text-destructive">x</InlineCode>)
    const el = screen.getByText('x')
    expect(el).toHaveClass('text-destructive')
    expect(el).toHaveClass('font-mono')
  })

  it('forwards additional HTML attributes', () => {
    render(
      <InlineCode data-testid="code-el" title="some id">
        val
      </InlineCode>
    )
    const el = screen.getByTestId('code-el')
    expect(el).toHaveAttribute('title', 'some id')
  })
})
