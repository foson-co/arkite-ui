import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Radio, RadioGroup } from './Radio'

describe('Radio', () => {
  it('renders a radio input element', () => {
    render(<Radio label="Option A" />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('renders with a label', () => {
    render(<Radio label="Option A" />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('renders with a description', () => {
    render(<Radio label="Option A" description="Description text" />)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('associates label with the input via htmlFor', () => {
    render(<Radio id="radio-1" label="Option A" />)
    const radio = screen.getByRole('radio')
    const label = screen.getByText('Option A')
    expect(radio).toHaveAttribute('id', 'radio-1')
    expect(label).toHaveAttribute('for', 'radio-1')
  })

  it('can be selected by clicking', async () => {
    const user = userEvent.setup()
    render(<Radio label="Option A" name="test" value="a" />)
    const radio = screen.getByRole('radio')
    await user.click(radio)
    expect(radio).toBeChecked()
  })

  it('can be selected by clicking the visual circle', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Radio id="r1" label="Option A" name="test" value="a" />
    )
    await user.click(container.querySelector('input + label')!)
    expect(screen.getByRole('radio')).toBeChecked()
  })

  it('can be selected by clicking the visual circle with no label text', async () => {
    const user = userEvent.setup()
    const { container } = render(<Radio id="r1" name="test" value="a" />)
    await user.click(container.querySelector('input + label')!)
    expect(screen.getByRole('radio')).toBeChecked()
  })

  it('does not select when clicking the visual circle while disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(
      <Radio id="r1" label="Option A" disabled onChange={onChange} />
    )
    await user.click(container.querySelector('input + label')!)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('radio')).not.toBeChecked()
  })

  it('keeps the label text as the accessible name', () => {
    render(<Radio label="Option A" name="test" value="a" />)
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Radio label="Option A" disabled />)
    expect(screen.getByRole('radio')).toBeDisabled()
  })

  it('cannot be selected when disabled', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Radio label="Option A" disabled onChange={onChange} />)
    await user.click(screen.getByRole('radio'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onChange when selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Radio label="Option A" name="test" value="a" onChange={onChange} />)
    await user.click(screen.getByRole('radio'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('forwards ref', () => {
    const ref = vi.fn()
    render(<Radio ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('applies custom className', () => {
    const { container } = render(<Radio className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders without label or description', () => {
    render(<Radio name="test" value="a" />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('renders errorMessage text', () => {
    render(<Radio label="Option A" error errorMessage="Required choice" />)
    const message = screen.getByText('Required choice')
    expect(message).toBeInTheDocument()
    expect(message.className).toContain('text-destructive')
  })
})

describe('RadioGroup', () => {
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
  ]

  it('renders all radio options', () => {
    render(<RadioGroup name="group" options={options} />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(screen.getByText('Option A')).toBeInTheDocument()
    expect(screen.getByText('Option B')).toBeInTheDocument()
    expect(screen.getByText('Option C')).toBeInTheDocument()
  })

  it('renders with radiogroup role', () => {
    render(<RadioGroup name="group" options={options} />)
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('selects an option on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RadioGroup name="group" options={options} onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: 'Option B' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('supports controlled value', () => {
    render(<RadioGroup name="group" options={options} value="b" onChange={() => {}} />)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).not.toBeChecked()
    expect(radios[1]).toBeChecked()
    expect(radios[2]).not.toBeChecked()
  })

  it('supports defaultValue', () => {
    render(<RadioGroup name="group" options={options} defaultValue="c" />)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).not.toBeChecked()
    expect(radios[1]).not.toBeChecked()
    expect(radios[2]).toBeChecked()
  })

  it('disables all options when disabled', () => {
    render(<RadioGroup name="group" options={options} disabled />)
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled()
    })
  })

  it('disables individual options', () => {
    const opts = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B', disabled: true },
      { value: 'c', label: 'Option C' },
    ]
    render(<RadioGroup name="group" options={opts} />)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).not.toBeDisabled()
    expect(radios[1]).toBeDisabled()
    expect(radios[2]).not.toBeDisabled()
  })

  it('renders descriptions for options', () => {
    const opts = [
      { value: 'a', label: 'Option A', description: 'Desc A' },
      { value: 'b', label: 'Option B', description: 'Desc B' },
    ]
    render(<RadioGroup name="group" options={opts} />)
    expect(screen.getByText('Desc A')).toBeInTheDocument()
    expect(screen.getByText('Desc B')).toBeInTheDocument()
  })

  it('only allows one option selected at a time (radio group behavior)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RadioGroup name="group" options={options} onChange={onChange} />)

    await user.click(screen.getByRole('radio', { name: 'Option A' }))
    expect(onChange).toHaveBeenLastCalledWith('a')

    await user.click(screen.getByRole('radio', { name: 'Option C' }))
    expect(onChange).toHaveBeenLastCalledWith('c')
  })

  it('applies custom className', () => {
    render(<RadioGroup name="group" options={options} className="custom-group" />)
    expect(screen.getByRole('radiogroup')).toHaveClass('custom-group')
  })

  it('renders errorMessage text once below the group', () => {
    render(
      <RadioGroup name="group" options={options} error errorMessage="Pick an option" />
    )
    const messages = screen.getAllByText('Pick an option')
    expect(messages).toHaveLength(1)
    expect(messages[0].className).toContain('text-destructive')
  })
})
