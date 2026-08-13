import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SheetSelect } from './SheetSelect'

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', description: 'Yellow fruit' },
  { value: 'cherry', label: 'Cherry', disabled: true },
]

describe('SheetSelect', () => {
  it('renders placeholder when nothing is selected', () => {
    render(<SheetSelect options={options} placeholder="Pick a fruit" />)
    expect(screen.getByText('Pick a fruit')).toBeInTheDocument()
  })

  it('renders the selected option label in the trigger', () => {
    render(<SheetSelect options={options} value="banana" />)
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('trigger has aria-haspopup listbox and reflects expanded state', async () => {
    const user = userEvent.setup()
    render(<SheetSelect options={options} />)
    const trigger = screen.getByRole('button', { name: 'Select…' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens the sheet with options on trigger click', async () => {
    const user = userEvent.setup()
    render(<SheetSelect options={options} title="Fruit" />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Select…' }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(screen.getByText('Fruit')).toBeInTheDocument()
    expect(screen.getByText('Yellow fruit')).toBeInTheDocument()
  })

  it('marks the selected option with aria-selected', async () => {
    const user = userEvent.setup()
    render(<SheetSelect options={options} value="apple" />)
    await user.click(screen.getByRole('button', { name: 'Apple' }))
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: /Banana/ })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange and closes the sheet on select', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SheetSelect options={options} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Select…' }))
    await user.click(screen.getByRole('option', { name: /Banana/ }))
    expect(onChange).toHaveBeenCalledWith('banana')

    // Drawer unmounts after its close transition completes
    fireEvent.transitionEnd(screen.getByRole('listbox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not select disabled options', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SheetSelect options={options} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Select…' }))
    await user.click(screen.getByRole('option', { name: 'Cherry' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('does not open when disabled', async () => {
    const user = userEvent.setup()
    render(<SheetSelect options={options} disabled />)
    const trigger = screen.getByRole('button', { name: 'Select…' })
    expect(trigger).toBeDisabled()
    await user.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders error message and error styles', () => {
    render(<SheetSelect options={options} error errorMessage="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select…' })).toHaveClass('border-destructive')
  })

  it('supports renderOption for custom option content', async () => {
    const user = userEvent.setup()
    render(
      <SheetSelect
        options={options}
        value="apple"
        renderOption={(option, selected) => (
          <span>
            {option.label.toUpperCase()}
            {selected ? ' (current)' : ''}
          </span>
        )}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Apple' }))
    expect(screen.getByText('APPLE (current)')).toBeInTheDocument()
    expect(screen.getByText('BANANA')).toBeInTheDocument()
  })

  it('closes on backdrop click without selecting', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SheetSelect options={options} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Select…' }))
    const backdrops = document.querySelectorAll('.fixed.inset-0.bg-black\\/50')
    await user.click(backdrops[backdrops.length - 1])
    fireEvent.transitionEnd(screen.getByRole('listbox'))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('applies custom className to the trigger', () => {
    render(<SheetSelect options={options} className="custom-class" />)
    expect(screen.getByRole('button', { name: 'Select…' })).toHaveClass('custom-class')
  })
})

describe('SheetSelect uncontrolled value', () => {
  it('shows defaultValue label in the trigger', () => {
    render(<SheetSelect options={options} defaultValue="banana" />)
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('updates the trigger after selecting and still calls onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SheetSelect options={options} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Select…' }))
    await user.click(screen.getByRole('option', { name: /Banana/ }))

    expect(onChange).toHaveBeenCalledWith('banana')
    fireEvent.transitionEnd(screen.getByRole('listbox'))
    expect(screen.getByRole('button', { name: /Banana/ })).toBeInTheDocument()
  })
})

describe('SheetSelect controlled open', () => {
  it('shows the sheet when open is true', () => {
    render(<SheetSelect options={options} open />)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('shows the sheet initially with defaultOpen', () => {
    render(<SheetSelect options={options} defaultOpen />)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('stays closed when open is false even after clicking the trigger', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<SheetSelect options={options} open={false} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Select…' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('calls onOpenChange when the sheet opens and closes', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<SheetSelect options={options} onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Select…' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    await user.click(screen.getByRole('option', { name: /Banana/ }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
