import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CheckboxCard } from './CheckboxCard'

describe('CheckboxCard', () => {
  it('renders label and description', () => {
    render(<CheckboxCard label="Enable notifications" description="Receive email alerts" />)
    expect(screen.getByText('Enable notifications')).toBeInTheDocument()
    expect(screen.getByText('Receive email alerts')).toBeInTheDocument()
  })

  it('renders as a checkbox input', () => {
    render(<CheckboxCard label="Option A" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('toggles on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CheckboxCard label="Option A" onChange={onChange} />)
    await user.click(screen.getByText('Option A'))
    expect(onChange).toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('supports controlled checked state', () => {
    render(<CheckboxCard label="Option A" checked readOnly />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('supports disabled state', () => {
    render(<CheckboxCard label="Option A" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('renders without description', () => {
    render(<CheckboxCard label="Simple" />)
    expect(screen.getByText('Simple')).toBeInTheDocument()
  })
})
