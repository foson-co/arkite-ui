import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('renders input with placeholder', () => {
    render(<SearchInput placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
  })

  it('renders the search icon', () => {
    const { container } = render(<SearchInput />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<SearchInput onChange={handleChange} />)
    const input = screen.getByRole('searchbox')

    await user.type(input, 'hello')
    expect(handleChange).toHaveBeenCalledTimes(5)
  })

  it('guards against password manager autofill, overridable via props', () => {
    const { rerender } = render(<SearchInput />)
    const input = screen.getByRole('searchbox')
    expect(input).toHaveAttribute('name', 'search')
    expect(input).toHaveAttribute('autocomplete', 'off')

    rerender(<SearchInput name="q" autoComplete="on" />)
    expect(input).toHaveAttribute('name', 'q')
    expect(input).toHaveAttribute('autocomplete', 'on')
  })

  it('shows clear button when value is non-empty', () => {
    render(<SearchInput value="test" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument()
  })

  it('does not show clear button when value is empty', () => {
    render(<SearchInput value="" onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
  })

  it('clicking clear resets value and calls onClear', async () => {
    const user = userEvent.setup()
    const handleClear = vi.fn()
    const handleChange = vi.fn()

    render(<SearchInput value="test" onChange={handleChange} onClear={handleClear} />)

    const clearButton = screen.getByRole('button', { name: /clear search/i })
    await user.click(clearButton)

    expect(handleClear).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: '' }),
      })
    )
  })

  it('disables the input when disabled prop is set', () => {
    render(<SearchInput disabled />)
    expect(screen.getByRole('searchbox')).toBeDisabled()
  })

  it('applies sm size variant classes', () => {
    render(<SearchInput size="sm" />)
    const input = screen.getByRole('searchbox')
    expect(input.className).toContain('h-9')
  })

  it('applies md size variant classes by default', () => {
    render(<SearchInput />)
    const input = screen.getByRole('searchbox')
    expect(input.className).toContain('h-10')
  })

  it('applies lg size variant classes', () => {
    render(<SearchInput size="lg" />)
    const input = screen.getByRole('searchbox')
    expect(input.className).toContain('h-12')
  })

  it('applies custom className', () => {
    render(<SearchInput className="my-custom-class" />)
    const input = screen.getByRole('searchbox')
    expect(input.className).toContain('my-custom-class')
  })
})
