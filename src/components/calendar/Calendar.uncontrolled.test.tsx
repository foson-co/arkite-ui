import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Calendar } from './Calendar'

describe('Calendar uncontrolled value', () => {
  it('marks defaultValue as selected', () => {
    render(<Calendar defaultValue={new Date(2025, 5, 18)} />)
    const selected = screen.getByRole('button', { name: '18' })
    expect(selected.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true')
  })

  it('opens on the defaultValue month', () => {
    render(<Calendar defaultValue={new Date(2025, 5, 18)} />)
    expect(screen.getByText('June 2025')).toBeInTheDocument()
  })

  it('updates the selection on click and still calls onSelect', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar defaultValue={new Date(2025, 5, 18)} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '20' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect((onSelect.mock.calls[0][0] as Date).getDate()).toBe(20)
    expect(screen.getByRole('button', { name: '20' }).closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('keeps the selection controlled when value is provided', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar value={new Date(2025, 5, 18)} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '20' }))

    expect(onSelect).toHaveBeenCalledTimes(1)
    // Display does not change without the parent updating value
    expect(screen.getByRole('button', { name: '18' }).closest('[role="gridcell"]')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})

describe('Calendar defaultMonth', () => {
  it('opens on the given month', () => {
    render(<Calendar defaultMonth={new Date(2024, 1, 1)} />)
    expect(screen.getByText('February 2024')).toBeInTheDocument()
  })

  it('defaultMonth wins over defaultValue for the initial view', () => {
    render(<Calendar defaultValue={new Date(2025, 5, 18)} defaultMonth={new Date(2024, 1, 1)} />)
    expect(screen.getByText('February 2024')).toBeInTheDocument()
  })
})
