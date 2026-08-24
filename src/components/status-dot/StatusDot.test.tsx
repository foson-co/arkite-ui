import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusDot } from './StatusDot'

describe('StatusDot', () => {
  it('renders with correct aria-label', () => {
    render(<StatusDot status="online" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'online')
  })

  it('renders all status types', () => {
    const { rerender } = render(<StatusDot status="online" />)
    expect(screen.getByRole('status')).toBeInTheDocument()

    rerender(<StatusDot status="offline" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'offline')

    rerender(<StatusDot status="busy" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'busy')

    rerender(<StatusDot status="away" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'away')
  })

  it('applies size classes', () => {
    const { rerender } = render(<StatusDot status="online" size="xs" />)
    const dot = screen.getByRole('status')
    expect(dot.className).toContain('h-1.5')

    rerender(<StatusDot status="online" size="lg" />)
    expect(screen.getByRole('status').className).toContain('h-3')
  })

  it('applies pulse animation when enabled for online status', () => {
    render(<StatusDot status="online" pulse />)
    expect(screen.getByRole('status').className).toContain('animate-pulse')
  })

  it('does not pulse for non-online status even when pulse is true', () => {
    render(<StatusDot status="busy" pulse />)
    expect(screen.getByRole('status').className).not.toContain('animate-pulse')
  })

  it('accepts custom className', () => {
    render(<StatusDot status="online" className="ring-background ring-2" />)
    expect(screen.getByRole('status').className).toContain('ring-2')
  })
})
