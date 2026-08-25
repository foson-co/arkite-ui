import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { PinInput } from './PinInput'

function cells(): HTMLInputElement[] {
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

describe('PinInput', () => {
  it('renders `length` cells with accessible names', () => {
    render(<PinInput length={4} />)
    expect(cells()).toHaveLength(4)
    expect(screen.getByLabelText('Character 1 of 4')).toBeInTheDocument()
    expect(screen.getByLabelText('Character 4 of 4')).toBeInTheDocument()
  })

  it('typing fills cells, auto-advances, and fires onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PinInput length={4} onChange={onChange} />)
    await user.click(cells()[0])
    await user.keyboard('12')
    expect(onChange).toHaveBeenLastCalledWith('12')
    expect(cells()[0]).toHaveValue('1')
    expect(cells()[1]).toHaveValue('2')
    expect(cells()[2]).toHaveFocus()
  })

  it('numeric mode rejects non-digits', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PinInput length={4} onChange={onChange} />)
    await user.click(cells()[0])
    await user.keyboard('a')
    expect(onChange).not.toHaveBeenCalled()
    expect(cells()[0]).toHaveValue('')
  })

  it('alphanumeric mode accepts letters', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PinInput length={4} type="alphanumeric" onChange={onChange} />)
    await user.click(cells()[0])
    await user.keyboard('a1')
    expect(onChange).toHaveBeenLastCalledWith('a1')
  })

  it('fires onComplete exactly once when all cells fill', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PinInput length={3} onComplete={onComplete} />)
    await user.click(cells()[0])
    await user.keyboard('123')
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('123')
  })

  it('Backspace clears the previous cell and moves focus back', async () => {
    const user = userEvent.setup()
    render(<PinInput length={4} />)
    await user.click(cells()[0])
    await user.keyboard('12')
    await user.keyboard('{Backspace}')
    expect(cells()[1]).toHaveValue('')
    expect(cells()[1]).toHaveFocus()
    expect(cells()[0]).toHaveValue('1')
  })

  it('paste distributes characters and filters invalid ones', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<PinInput length={4} onComplete={onComplete} />)
    await user.click(cells()[0])
    await user.paste('1a2b3c4d99')
    expect(
      cells()
        .map((c) => c.value)
        .join('')
    ).toBe('1234')
    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('arrow keys move focus between cells', async () => {
    const user = userEvent.setup()
    render(<PinInput length={4} defaultValue="12" />)
    await user.click(cells()[1])
    await user.keyboard('{ArrowLeft}')
    expect(cells()[0]).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(cells()[1]).toHaveFocus()
  })

  it('works controlled', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [v, setV] = useState('')
      return <PinInput length={4} value={v} onChange={setV} />
    }
    render(<Harness />)
    await user.click(cells()[0])
    await user.keyboard('42')
    expect(cells()[0]).toHaveValue('4')
    expect(cells()[1]).toHaveValue('2')
  })

  it('masked renders password inputs', () => {
    const { container } = render(<PinInput masked length={4} />)
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(4)
  })

  it('numeric mode sets inputMode and one-time-code autocomplete on the first cell', () => {
    render(<PinInput length={4} />)
    const first = cells()[0]
    expect(first).toHaveAttribute('inputmode', 'numeric')
    expect(first).toHaveAttribute('autocomplete', 'one-time-code')
  })
})
