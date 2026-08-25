import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Calendar } from './Calendar'

describe('Calendar', () => {
  it('renders current month name and year', () => {
    const date = new Date(2025, 5, 15) // June 2025
    render(<Calendar month={date} />)
    expect(screen.getByText('June 2025')).toBeInTheDocument()
  })

  it('calls onSelect when a date is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Calendar month={new Date(2025, 5, 1)} onSelect={onSelect} />)

    await user.click(screen.getByText('10'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    const selected: Date = onSelect.mock.calls[0][0]
    expect(selected.getFullYear()).toBe(2025)
    expect(selected.getMonth()).toBe(5)
    expect(selected.getDate()).toBe(10)
  })

  it('navigates to previous month', async () => {
    const user = userEvent.setup()
    render(<Calendar value={new Date(2025, 5, 15)} />)

    expect(screen.getByText('June 2025')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Previous month'))
    expect(screen.getByText('May 2025')).toBeInTheDocument()
  })

  it('navigates to next month', async () => {
    const user = userEvent.setup()
    render(<Calendar value={new Date(2025, 5, 15)} />)

    await user.click(screen.getByLabelText('Next month'))
    expect(screen.getByText('July 2025')).toBeInTheDocument()
  })

  it('disables dates in disabledDates', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const disabledDates = [new Date(2025, 5, 12)]

    render(
      <Calendar month={new Date(2025, 5, 1)} onSelect={onSelect} disabledDates={disabledDates} />
    )

    const disabledButton = screen.getByText('12')
    expect(disabledButton).toBeDisabled()

    await user.click(disabledButton)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('gives today a visually distinct style', () => {
    const today = new Date()
    render(<Calendar month={today} />)

    const todayButton = screen.getByText(String(today.getDate()))
    expect(todayButton.className).toContain('border')
    expect(todayButton.className).toContain('border-primary')
  })

  it('enforces minDate boundary', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    // minDate is June 10 — days before should be disabled
    const minDate = new Date(2025, 5, 10)

    render(<Calendar month={new Date(2025, 5, 1)} onSelect={onSelect} minDate={minDate} />)

    const dayBefore = screen.getByText('9')
    expect(dayBefore).toBeDisabled()

    await user.click(dayBefore)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('enforces maxDate boundary', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    // maxDate is June 20 — days after should be disabled
    const maxDate = new Date(2025, 5, 20)

    render(<Calendar month={new Date(2025, 5, 1)} onSelect={onSelect} maxDate={maxDate} />)

    const dayAfter = screen.getByText('21')
    expect(dayAfter).toBeDisabled()

    await user.click(dayAfter)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
