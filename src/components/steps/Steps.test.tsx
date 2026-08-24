import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Steps } from './Steps'

const basicSteps = [{ label: 'Account' }, { label: 'Profile' }, { label: 'Review' }]

describe('Steps', () => {
  it('renders all step labels', () => {
    render(<Steps steps={basicSteps} currentStep={0} />)
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('shows step numbers for current and upcoming steps', () => {
    render(<Steps steps={basicSteps} currentStep={0} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('highlights current step with border-primary', () => {
    const { container } = render(<Steps steps={basicSteps} currentStep={1} />)
    // The second step dot (index 1) should have border-primary
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots[1].className).toContain('border-primary')
    expect(dots[1].className).toContain('text-primary')
  })

  it('marks completed steps with bg-primary and check icon', () => {
    const { container } = render(<Steps steps={basicSteps} currentStep={2} />)
    const dots = container.querySelectorAll('.rounded-full')

    // Steps 0 and 1 should be complete
    expect(dots[0].className).toContain('bg-primary')
    expect(dots[1].className).toContain('bg-primary')
    // Completed steps show check SVG instead of number
    expect(dots[0].querySelector('svg')).toBeInTheDocument()
    expect(dots[1].querySelector('svg')).toBeInTheDocument()
    // Current step should show number
    expect(dots[2].className).toContain('border-primary')
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders upcoming steps with muted styling', () => {
    const { container } = render(<Steps steps={basicSteps} currentStep={0} />)
    const dots = container.querySelectorAll('.rounded-full')
    // Steps 1 and 2 are upcoming
    expect(dots[1].className).toContain('border-muted-foreground/30')
    expect(dots[2].className).toContain('border-muted-foreground/30')
  })

  it('renders horizontal orientation by default', () => {
    const { container } = render(<Steps steps={basicSteps} currentStep={0} />)
    const root = container.firstElementChild!
    expect(root.className).toContain('items-center')
    expect(root.className).not.toContain('flex-col')
  })

  it('renders vertical orientation', () => {
    const { container } = render(
      <Steps steps={basicSteps} currentStep={0} orientation="vertical" />
    )
    const root = container.firstElementChild!
    expect(root.className).toContain('flex-col')
  })

  it('renders step descriptions', () => {
    const stepsWithDesc = [
      { label: 'Step 1', description: 'Enter your email' },
      { label: 'Step 2', description: 'Set a password' },
    ]
    render(<Steps steps={stepsWithDesc} currentStep={0} />)
    expect(screen.getByText('Enter your email')).toBeInTheDocument()
    expect(screen.getByText('Set a password')).toBeInTheDocument()
  })

  it('does not render connector line after the last step', () => {
    const { container } = render(<Steps steps={basicSteps} currentStep={0} />)
    // Connector lines are divs with h-0.5 (horizontal). There should be 2 for 3 steps.
    const connectors = container.querySelectorAll('.h-0\\.5')
    expect(connectors.length).toBe(2)
  })
})
