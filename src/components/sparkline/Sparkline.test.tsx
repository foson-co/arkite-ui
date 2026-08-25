import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('renders a polyline for the given data', () => {
    const { container } = render(<Sparkline data={[1, 5, 3, 8]} />)
    const polyline = container.querySelector('polyline')
    expect(polyline).toBeInTheDocument()
    expect(polyline).toHaveAttribute('points')
    expect(polyline?.getAttribute('points')?.split(' ')).toHaveLength(4)
  })

  it('renders nothing for empty data', () => {
    const { container } = render(<Sparkline data={[]} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders a dot for a single data point', () => {
    const { container } = render(<Sparkline data={[5]} />)
    expect(container.querySelector('circle')).toBeInTheDocument()
    expect(container.querySelector('polyline')).not.toBeInTheDocument()
  })

  it('renders a flat centered line when all values are equal', () => {
    const { container } = render(<Sparkline data={[3, 3, 3]} width={80} height={24} />)
    const points = container.querySelector('polyline')?.getAttribute('points')
    const ys = points?.split(' ').map((p) => p.split(',')[1])
    expect(new Set(ys).size).toBe(1)
    expect(Number(ys?.[0])).toBe(12)
  })

  it('applies success color when trend is up (auto)', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} />)
    expect(container.querySelector('svg')).toHaveClass('text-success')
  })

  it('applies destructive color when trend is down (auto)', () => {
    const { container } = render(<Sparkline data={[3, 2, 1]} />)
    expect(container.querySelector('svg')).toHaveClass('text-destructive')
  })

  it('applies muted color when first and last values are equal (auto)', () => {
    const { container } = render(<Sparkline data={[2, 5, 2]} />)
    expect(container.querySelector('svg')).toHaveClass('text-muted-foreground')
  })

  it('respects explicit trend over auto comparison', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} trend="down" />)
    expect(container.querySelector('svg')).toHaveClass('text-destructive')
  })

  it('explicit color overrides trend coloring', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} color="#ff00ff" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toHaveClass('text-success')
    expect(container.querySelector('polyline')).toHaveAttribute('stroke', '#ff00ff')
  })

  it('uses custom dimensions and stroke width', () => {
    const { container } = render(
      <Sparkline data={[1, 2]} width={120} height={40} strokeWidth={2} />
    )
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '120')
    expect(svg).toHaveAttribute('height', '40')
    expect(container.querySelector('polyline')).toHaveAttribute('stroke-width', '2')
  })

  it('exposes role img with aria-label when provided', () => {
    render(<Sparkline data={[1, 2, 3]} aria-label="30-day trend" />)
    expect(screen.getByRole('img', { name: '30-day trend' })).toBeInTheDocument()
  })

  it('is aria-hidden when no aria-label is provided', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(<Sparkline data={[1, 2]} className="custom-class" />)
    expect(container.querySelector('svg')).toHaveClass('custom-class')
  })

  it('accepts null data and renders nothing without placeholder', () => {
    const { container } = render(<Sparkline data={null} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('renders built-in dashed placeholder for null data when placeholder is true', () => {
    const { container } = render(<Sparkline data={null} placeholder width={60} height={18} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('text-border')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    const line = container.querySelector('line')
    expect(line).toHaveAttribute('stroke-dasharray', '2 2')
  })

  it('renders placeholder for single-point data when placeholder is set', () => {
    const { container } = render(<Sparkline data={[5]} placeholder />)
    expect(container.querySelector('line')).toBeInTheDocument()
    expect(container.querySelector('circle')).not.toBeInTheDocument()
  })

  it('renders a custom placeholder node', () => {
    render(<Sparkline data={[]} placeholder={<span data-testid="empty">–</span>} />)
    expect(screen.getByTestId('empty')).toBeInTheDocument()
  })

  it('ignores placeholder when data has 2+ points', () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} placeholder />)
    expect(container.querySelector('polyline')).toBeInTheDocument()
    expect(container.querySelector('line')).not.toBeInTheDocument()
  })
})
