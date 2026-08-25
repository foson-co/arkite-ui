import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TagInput } from './TagInput'

describe('TagInput', () => {
  it('renders with existing tags', () => {
    render(<TagInput value={['React', 'Vue']} onChange={vi.fn()} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
  })

  it('renders placeholder when no tags', () => {
    render(<TagInput value={[]} onChange={vi.fn()} placeholder="Add tags..." />)
    expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument()
  })

  it('hides placeholder when tags exist', () => {
    render(<TagInput value={['React']} onChange={vi.fn()} placeholder="Add tags..." />)
    expect(screen.queryByPlaceholderText('Add tags...')).not.toBeInTheDocument()
  })

  it('adds a tag on Enter', async () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'React{Enter}')
    expect(onChange).toHaveBeenCalledWith(['React'])
  })

  it('adds a tag on comma', async () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Vue,')
    expect(onChange).toHaveBeenCalledWith(['Vue'])
  })

  it('removes last tag on Backspace when input is empty', async () => {
    const onChange = vi.fn()
    render(<TagInput value={['React', 'Vue']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    await userEvent.keyboard('{Backspace}')
    expect(onChange).toHaveBeenCalledWith(['React'])
  })

  it('prevents duplicate tags by default', async () => {
    const onChange = vi.fn()
    render(<TagInput value={['React']} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'React{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('allows duplicates when allowDuplicates is true', async () => {
    const onChange = vi.fn()
    render(<TagInput value={['React']} onChange={onChange} allowDuplicates />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'React{Enter}')
    expect(onChange).toHaveBeenCalledWith(['React', 'React'])
  })

  it('respects max tag limit', async () => {
    const onChange = vi.fn()
    render(<TagInput value={['React', 'Vue']} onChange={onChange} max={2} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Angular{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('removes specific tag via X button', async () => {
    const onChange = vi.fn()
    render(<TagInput value={['React', 'Vue', 'Angular']} onChange={onChange} />)
    const removeBtn = screen.getByLabelText('Remove Vue')
    await userEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith(['React', 'Angular'])
  })

  it('does not show remove buttons when disabled', () => {
    render(<TagInput value={['React']} onChange={vi.fn()} disabled />)
    expect(screen.queryByLabelText('Remove React')).not.toBeInTheDocument()
  })

  it('disables input when disabled', () => {
    render(<TagInput value={[]} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies disabled styling', () => {
    const { container } = render(<TagInput value={[]} onChange={vi.fn()} disabled />)
    expect(container.firstElementChild?.className).toContain('cursor-not-allowed')
  })

  it('applies error border class', () => {
    const { container } = render(<TagInput value={[]} onChange={vi.fn()} error />)
    expect(container.firstElementChild?.className).toContain('border-destructive')
  })

  it('does not add empty or whitespace-only tags', async () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '   {Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders errorMessage text', () => {
    render(<TagInput value={[]} onChange={vi.fn()} error errorMessage="Too many tags" />)
    const message = screen.getByText('Too many tags')
    expect(message).toBeInTheDocument()
    expect(message.className).toContain('text-destructive')
  })
})
