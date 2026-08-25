import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewToggle } from './ViewToggle'

describe('ViewToggle', () => {
  it('renders table and card options', () => {
    render(<ViewToggle value="table" onChange={() => {}} />)
    expect(screen.getByRole('radio', { name: 'Table view' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Card view' })).toBeInTheDocument()
  })

  it('marks current value as checked', () => {
    render(<ViewToggle value="card" onChange={() => {}} />)
    expect(screen.getByRole('radio', { name: 'Card view' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Table view' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('calls onChange when clicking a different option', async () => {
    const onChange = vi.fn()
    render(<ViewToggle value="table" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Card view' }))
    expect(onChange).toHaveBeenCalledWith('card')
  })

  it('calls onChange when clicking current option', async () => {
    const onChange = vi.fn()
    render(<ViewToggle value="table" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Table view' }))
    expect(onChange).toHaveBeenCalledWith('table')
  })

  it('supports sm size', () => {
    render(<ViewToggle value="table" onChange={() => {}} size="sm" />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })
})

describe('ViewToggle uncontrolled', () => {
  it('marks defaultValue as checked', () => {
    render(<ViewToggle defaultValue="card" />)
    expect(screen.getByRole('radio', { name: 'Card view' })).toHaveAttribute('aria-checked', 'true')
  })

  it('updates the checked option on click and still calls onChange', async () => {
    const onChange = vi.fn()
    render(<ViewToggle defaultValue="table" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Card view' }))

    expect(onChange).toHaveBeenCalledWith('card')
    expect(screen.getByRole('radio', { name: 'Card view' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Table view' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('remains controlled when value is provided', async () => {
    const onChange = vi.fn()
    render(<ViewToggle value="table" onChange={onChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Card view' }))

    expect(onChange).toHaveBeenCalledWith('card')
    expect(screen.getByRole('radio', { name: 'Table view' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
  })
})
