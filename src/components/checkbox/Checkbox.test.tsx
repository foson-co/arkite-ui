import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders a checkbox element', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('is unchecked by default', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('can be rendered as checked', () => {
    render(<Checkbox defaultChecked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('toggles checked state on click', async () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('calls onChange handler when toggled', async () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('does not toggle when disabled', async () => {
    const onChange = vi.fn()
    render(<Checkbox disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders a label', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('associates the label with the checkbox via htmlFor', () => {
    render(<Checkbox label="Accept terms" />)
    const label = screen.getByText('Accept terms')
    const checkbox = screen.getByRole('checkbox')
    expect(label).toHaveAttribute('for', checkbox.id)
  })

  it('toggles when clicking the label', async () => {
    render(<Checkbox label="Accept terms" />)
    await userEvent.click(screen.getByText('Accept terms'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('toggles when clicking the visual box', async () => {
    const { container } = render(<Checkbox id="cb" label="Accept terms" />)
    const box = container.querySelector('input + label')!
    await userEvent.click(box)
    expect(screen.getByRole('checkbox')).toBeChecked()
    await userEvent.click(box)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('toggles when clicking the visual box with no label text', async () => {
    const { container } = render(<Checkbox id="cb" />)
    await userEvent.click(container.querySelector('input + label')!)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('does not toggle when clicking the visual box while disabled', async () => {
    const onChange = vi.fn()
    const { container } = render(<Checkbox id="cb" disabled onChange={onChange} />)
    await userEvent.click(container.querySelector('input + label')!)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('keeps the label text as the accessible name', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument()
  })

  it('renders a description', () => {
    render(<Checkbox label="Newsletter" description="Receive weekly updates" />)
    expect(screen.getByText('Receive weekly updates')).toBeInTheDocument()
  })

  it('uses a custom id when provided', () => {
    render(<Checkbox id="custom-id" label="Custom" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('id', 'custom-id')
  })

  it('applies error styling when error prop is true', () => {
    const { container } = render(<Checkbox error />)
    const visualBox = container.querySelector('.border-destructive')
    expect(visualBox).toBeInTheDocument()
  })

  it('supports indeterminate state via ref', () => {
    const ref = vi.fn((el: HTMLInputElement | null) => {
      if (el) {
        el.indeterminate = true
      }
    })
    render(<Checkbox ref={ref} />)
    expect(ref).toHaveBeenCalled()
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.indeterminate).toBe(true)
  })

  it('forwards ref', () => {
    const ref = vi.fn()
    render(<Checkbox ref={ref} />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('applies custom className', () => {
    const { container } = render(<Checkbox className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('renders errorMessage text', () => {
    render(<Checkbox label="Terms" error errorMessage="You must accept" />)
    const message = screen.getByText('You must accept')
    expect(message).toBeInTheDocument()
    expect(message.className).toContain('text-destructive')
  })
})
