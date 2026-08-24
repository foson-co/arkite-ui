import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Select } from './Select'

const defaultOptions = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

describe('Select', () => {
  it('renders a select element', () => {
    render(<Select options={defaultOptions} aria-label="fruit" />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders options', () => {
    render(<Select options={defaultOptions} />)
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('renders placeholder as a disabled option', () => {
    render(<Select options={defaultOptions} placeholder="Pick a fruit" />)
    const placeholder = screen.getByText('Pick a fruit')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toBeDisabled()
  })

  it('applies sm size styles', () => {
    render(<Select options={defaultOptions} size="sm" aria-label="fruit" />)
    expect(screen.getByRole('combobox').className).toContain('h-8')
  })

  it('applies md size styles by default', () => {
    render(<Select options={defaultOptions} aria-label="fruit" />)
    expect(screen.getByRole('combobox').className).toContain('h-10')
  })

  it('applies lg size styles', () => {
    render(<Select options={defaultOptions} size="lg" aria-label="fruit" />)
    expect(screen.getByRole('combobox').className).toContain('h-12')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Select options={defaultOptions} disabled aria-label="fruit" />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('applies error styling', () => {
    render(<Select options={defaultOptions} error aria-label="fruit" />)
    expect(screen.getByRole('combobox').className).toContain('border-destructive')
  })

  it('shows error message', () => {
    render(<Select options={defaultOptions} error errorMessage="Selection required" />)
    expect(screen.getByText('Selection required')).toBeInTheDocument()
  })

  it('does not show error message when errorMessage is not provided', () => {
    const { container } = render(<Select options={defaultOptions} error />)
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Select options={defaultOptions} className="my-custom-class" aria-label="fruit" />)
    expect(screen.getByRole('combobox').className).toContain('my-custom-class')
  })

  it('calls onChange handler when value changes', async () => {
    const onChange = vi.fn()
    render(<Select options={defaultOptions} onChange={onChange} aria-label="fruit" />)
    await userEvent.selectOptions(screen.getByRole('combobox'), 'banana')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders with a disabled option', () => {
    const options = [
      { value: 'a', label: 'Available' },
      { value: 'b', label: 'Unavailable', disabled: true },
    ]
    render(<Select options={options} />)
    expect(screen.getByText('Unavailable')).toBeDisabled()
  })

  it('renders left icon', () => {
    render(<Select options={defaultOptions} leftIcon={<span data-testid="left-icon">icon</span>} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('applies fullWidth styling', () => {
    const { container } = render(<Select options={defaultOptions} fullWidth />)
    expect(container.firstChild).toHaveClass('w-full')
  })

  it('renders children as custom options', () => {
    render(
      <Select aria-label="fruit">
        <option value="custom">Custom Option</option>
      </Select>
    )
    expect(screen.getByText('Custom Option')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = vi.fn()
    render(<Select ref={ref} options={defaultOptions} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSelectElement))
  })
})
