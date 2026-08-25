import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ColorPicker } from './ColorPicker'

describe('ColorPicker', () => {
  it('renders color swatch button and hex input', () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Pick a color')).toBeInTheDocument()
    expect(screen.getByLabelText('Hex color value')).toBeInTheDocument()
  })

  it('displays current color in the hex input (without #)', () => {
    render(<ColorPicker value="#abcdef" onChange={vi.fn()} />)
    const input = screen.getByLabelText('Hex color value')
    expect(input).toHaveValue('abcdef')
  })

  it('shows # prefix label', () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} />)
    expect(screen.getByText('#')).toBeInTheDocument()
  })

  it('applies swatch background color', () => {
    render(<ColorPicker value="#00ff00" onChange={vi.fn()} />)
    const swatch = screen.getByLabelText('Pick a color')
    expect(swatch.style.backgroundColor).toBeTruthy()
  })

  it('calls onChange when hex input receives a valid value', () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#000000" onChange={onChange} />)
    const input = screen.getByLabelText('Hex color value')
    fireEvent.change(input, { target: { value: 'ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('does not call onChange for invalid hex input', async () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#ff0000" onChange={onChange} />)
    const input = screen.getByLabelText('Hex color value')
    await userEvent.clear(input)
    await userEvent.type(input, 'zzz')
    // "zzz" is not valid hex, so onChange should not be called
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders preset swatches', () => {
    const presets = ['#ff0000', '#00ff00', '#0000ff']
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} presets={presets} />)
    expect(screen.getByLabelText('Select color #ff0000')).toBeInTheDocument()
    expect(screen.getByLabelText('Select color #00ff00')).toBeInTheDocument()
    expect(screen.getByLabelText('Select color #0000ff')).toBeInTheDocument()
  })

  it('calls onChange when a preset is clicked', async () => {
    const onChange = vi.fn()
    const presets = ['#ff0000', '#00ff00', '#0000ff']
    render(<ColorPicker value="#000000" onChange={onChange} presets={presets} />)
    await userEvent.click(screen.getByLabelText('Select color #00ff00'))
    expect(onChange).toHaveBeenCalledWith('#00ff00')
  })

  it('does not render preset section when presets is empty', () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} presets={[]} />)
    expect(screen.queryByRole('group', { name: 'Preset colors' })).not.toBeInTheDocument()
  })

  it('disables all controls when disabled', () => {
    const presets = ['#ff0000']
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} disabled presets={presets} />)
    expect(screen.getByLabelText('Pick a color')).toBeDisabled()
    expect(screen.getByLabelText('Hex color value')).toBeDisabled()
    expect(screen.getByLabelText('Select color #ff0000')).toBeDisabled()
  })

  it('applies error border class', () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} error />)
    const swatch = screen.getByLabelText('Pick a color')
    expect(swatch.className).toContain('border-destructive')
  })

  it('does not call onChange on preset click when disabled', async () => {
    const onChange = vi.fn()
    render(<ColorPicker value="#000000" onChange={onChange} disabled presets={['#ff0000']} />)
    // Button is disabled so click won't fire handler
    const presetBtn = screen.getByLabelText('Select color #ff0000')
    await userEvent.click(presetBtn)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders errorMessage text', () => {
    render(<ColorPicker value="#ff0000" onChange={vi.fn()} error errorMessage="Invalid color" />)
    const message = screen.getByText('Invalid color')
    expect(message).toBeInTheDocument()
    expect(message.className).toContain('text-destructive')
  })
})

describe('ColorPicker uncontrolled', () => {
  it('renders defaultValue in the hex input', () => {
    render(<ColorPicker defaultValue="#abcdef" />)
    expect(screen.getByLabelText('Hex color value')).toHaveValue('abcdef')
  })

  it('falls back to #000000 when neither value nor defaultValue is given', () => {
    render(<ColorPicker />)
    expect(screen.getByLabelText('Hex color value')).toHaveValue('000000')
  })

  it('updates on preset click and still calls onChange', async () => {
    const onChange = vi.fn()
    render(<ColorPicker defaultValue="#000000" onChange={onChange} presets={['#00ff00']} />)
    await userEvent.click(screen.getByLabelText('Select color #00ff00'))
    expect(onChange).toHaveBeenCalledWith('#00ff00')
    expect(screen.getByLabelText('Hex color value')).toHaveValue('00ff00')
  })

  it('updates via the hex text input without a value prop', () => {
    render(<ColorPicker defaultValue="#000000" />)
    const input = screen.getByLabelText('Hex color value')
    fireEvent.change(input, { target: { value: 'ff0000' } })
    expect(input).toHaveValue('ff0000')
  })
})
