import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PasswordInput } from './PasswordInput'

describe('PasswordInput', () => {
  it('renders as password type by default', () => {
    render(<PasswordInput placeholder="Enter password" />)
    expect(screen.getByPlaceholderText('Enter password')).toHaveAttribute('type', 'password')
  })

  it('toggles to text type on eye button click', async () => {
    const user = userEvent.setup()
    render(<PasswordInput placeholder="pw" />)
    const input = screen.getByPlaceholderText('pw')
    const toggle = screen.getByLabelText('Show password')

    await user.click(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Hide password'))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('supports controlled visibility', async () => {
    const user = userEvent.setup()
    const onVisibleChange = vi.fn()
    const { rerender } = render(
      <PasswordInput placeholder="pw" visible={false} onVisibleChange={onVisibleChange} />
    )
    expect(screen.getByPlaceholderText('pw')).toHaveAttribute('type', 'password')

    await user.click(screen.getByLabelText('Show password'))
    expect(onVisibleChange).toHaveBeenCalledWith(true)

    // Still password because controlled — parent hasn't updated
    expect(screen.getByPlaceholderText('pw')).toHaveAttribute('type', 'password')

    rerender(<PasswordInput placeholder="pw" visible={true} onVisibleChange={onVisibleChange} />)
    expect(screen.getByPlaceholderText('pw')).toHaveAttribute('type', 'text')
  })

  it('disables the toggle button when disabled', () => {
    render(<PasswordInput placeholder="pw" disabled />)
    expect(screen.getByLabelText('Show password')).toBeDisabled()
  })

  it('forwards Input props like error and size', () => {
    render(<PasswordInput placeholder="pw" error errorMessage="Required" size="lg" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('pw')).toHaveClass('h-12')
  })
})
