import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Progress, CircularProgress } from './Progress'

describe('Progress', () => {
  it('renders with progressbar role', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('sets aria-valuenow', () => {
    render(<Progress value={75} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('sets aria-valuemax', () => {
    render(<Progress value={50} max={200} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '200')
  })

  it('shows label when showLabel is true', () => {
    render(<Progress value={75} showLabel />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('clamps percentage to 0-100', () => {
    render(<Progress value={150} showLabel />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('removes aria-valuenow when indeterminate', () => {
    render(<Progress indeterminate />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow')
  })

  it('applies destructive variant styles', () => {
    render(<Progress value={50} variant="destructive" />)
    const bar = screen.getByRole('progressbar').firstElementChild as HTMLElement
    expect(bar.className).toContain('bg-destructive')
  })

  it('supports deprecated error variant as alias for destructive', () => {
    render(
      <>
        <Progress value={50} variant="error" aria-label="old" />
        <Progress value={50} variant="destructive" aria-label="new" />
      </>
    )
    const oldBar = screen.getByRole('progressbar', { name: 'old' }).firstElementChild as HTMLElement
    const newBar = screen.getByRole('progressbar', { name: 'new' }).firstElementChild as HTMLElement
    expect(oldBar.className).toContain('bg-destructive')
    expect(oldBar.className).toBe(newBar.className)
  })
})

describe('CircularProgress', () => {
  it('renders with progressbar role', () => {
    render(<CircularProgress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows label when enabled', () => {
    render(<CircularProgress value={60} showLabel />)
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('hides label when indeterminate', () => {
    render(<CircularProgress value={60} showLabel indeterminate />)
    expect(screen.queryByText('60%')).not.toBeInTheDocument()
  })

  it('sets dimensions from diameter', () => {
    render(<CircularProgress value={50} diameter={64} />)
    const el = screen.getByRole('progressbar')
    expect(el.style.width).toBe('64px')
    expect(el.style.height).toBe('64px')
  })

  it('supports deprecated size as alias for diameter', () => {
    render(<CircularProgress value={50} size={64} />)
    const el = screen.getByRole('progressbar')
    expect(el.style.width).toBe('64px')
    expect(el.style.height).toBe('64px')
  })

  it('prefers diameter over deprecated size when both provided', () => {
    render(<CircularProgress value={50} diameter={80} size={64} />)
    const el = screen.getByRole('progressbar')
    expect(el.style.width).toBe('80px')
  })

  it('supports deprecated error variant as alias for destructive', () => {
    render(
      <>
        <CircularProgress value={50} variant="error" aria-label="old" />
        <CircularProgress value={50} variant="destructive" aria-label="new" />
      </>
    )
    const oldCircle = screen.getByRole('progressbar', { name: 'old' }).querySelectorAll('circle')[1]
    const newCircle = screen.getByRole('progressbar', { name: 'new' }).querySelectorAll('circle')[1]
    expect(oldCircle.getAttribute('class')).toContain('stroke-destructive')
    expect(oldCircle.getAttribute('class')).toBe(newCircle.getAttribute('class'))
  })
})
