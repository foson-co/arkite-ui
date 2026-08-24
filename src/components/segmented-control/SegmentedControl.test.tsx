import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'platform', label: 'Platform' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'custom', label: 'Custom' },
]

describe('SegmentedControl', () => {
  it('renders all options', () => {
    render(<SegmentedControl options={options} value="platform" onChange={() => {}} />)
    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('Tenant')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('marks the selected option as checked', () => {
    render(<SegmentedControl options={options} value="tenant" onChange={() => {}} />)
    expect(screen.getByText('Tenant').closest('button')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Platform').closest('button')).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with selected value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="platform" onChange={onChange} />)
    await user.click(screen.getByText('Tenant'))
    expect(onChange).toHaveBeenCalledWith('tenant')
  })

  it('supports disabled state', () => {
    render(<SegmentedControl options={options} value="platform" onChange={() => {}} disabled />)
    const buttons = screen.getAllByRole('radio')
    buttons.forEach((btn) => expect(btn).toBeDisabled())
  })

  it('supports individual option disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const opts = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
    ]
    render(<SegmentedControl options={opts} value="a" onChange={onChange} />)
    await user.click(screen.getByText('B'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('applies fullWidth class', () => {
    const { container } = render(
      <SegmentedControl options={options} value="platform" onChange={() => {}} fullWidth />
    )
    expect(container.firstChild).toHaveClass('w-full')
  })

  it('uses radiogroup role', () => {
    render(<SegmentedControl options={options} value="platform" onChange={() => {}} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })
})

describe('SegmentedControl uncontrolled', () => {
  it('marks defaultValue as checked', () => {
    render(<SegmentedControl options={options} defaultValue="tenant" />)
    expect(screen.getByText('Tenant').closest('button')).toHaveAttribute('aria-checked', 'true')
  })

  it('updates the checked segment on click and still calls onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SegmentedControl options={options} defaultValue="platform" onChange={onChange} />)
    await user.click(screen.getByText('Tenant'))

    expect(onChange).toHaveBeenCalledWith('tenant')
    expect(screen.getByText('Tenant').closest('button')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('Platform').closest('button')).toHaveAttribute('aria-checked', 'false')
  })

  it('works without value and onChange', async () => {
    const user = userEvent.setup()
    render(<SegmentedControl options={options} />)
    await user.click(screen.getByText('Custom'))
    expect(screen.getByText('Custom').closest('button')).toHaveAttribute('aria-checked', 'true')
  })

  it('remains controlled when value is provided', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SegmentedControl options={options} value="platform" onChange={onChange} />)
    await user.click(screen.getByText('Tenant'))

    expect(onChange).toHaveBeenCalledWith('tenant')
    // Display does not change without the parent updating value
    expect(screen.getByText('Platform').closest('button')).toHaveAttribute('aria-checked', 'true')
  })
})
