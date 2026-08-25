import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default').className).toContain('bg-primary')
  })

  it('applies variant classes', () => {
    const { rerender } = render(<Badge variant="success">OK</Badge>)
    expect(screen.getByText('OK').className).toContain('bg-success')

    rerender(<Badge variant="destructive">Error</Badge>)
    expect(screen.getByText('Error').className).toContain('bg-destructive')

    rerender(<Badge variant="warning">Warn</Badge>)
    expect(screen.getByText('Warn').className).toContain('bg-warning')
  })

  it('applies count variant as neutral pill with tabular numerals', () => {
    render(<Badge variant="count">{42}</Badge>)
    const el = screen.getByText('42')
    expect(el.className).toContain('bg-muted')
    expect(el.className).toContain('text-muted-foreground')
    expect(el.className).toContain('tabular-nums')
  })

  it('count variant composes with max truncation', () => {
    render(
      <Badge variant="count" max={99}>
        {150}
      </Badge>
    )
    const el = screen.getByText('99+')
    expect(el.className).toContain('bg-muted')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Test</Badge>)
    expect(screen.getByText('Test').className).toContain('custom-class')
  })

  describe('max prop', () => {
    it('renders numeric child as-is when within max', () => {
      render(<Badge max={99}>{50}</Badge>)
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    it('truncates numeric child exceeding max with "+" suffix', () => {
      render(<Badge max={99}>{150}</Badge>)
      expect(screen.getByText('99+')).toBeInTheDocument()
      expect(screen.queryByText('150')).not.toBeInTheDocument()
    })

    it('renders boundary value (equal to max) unchanged', () => {
      render(<Badge max={99}>{99}</Badge>)
      expect(screen.getByText('99')).toBeInTheDocument()
      expect(screen.queryByText('99+')).not.toBeInTheDocument()
    })

    it('truncates numeric string children', () => {
      render(<Badge max={9}>15</Badge>)
      expect(screen.getByText('9+')).toBeInTheDocument()
    })

    it('passes non-numeric children through unchanged', () => {
      render(<Badge max={99}>New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('is inert when max is not set', () => {
      render(<Badge>{9999}</Badge>)
      expect(screen.getByText('9999')).toBeInTheDocument()
    })
  })
})
