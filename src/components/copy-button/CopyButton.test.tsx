import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CopyButton, CopyInput } from './CopyButton'

describe('CopyButton', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders with default "Copy" text', () => {
    render(<CopyButton value="hello" />)
    expect(screen.getByText('Copy')).toBeInTheDocument()
  })

  it('renders with custom children text', () => {
    render(<CopyButton value="hello">Copy link</CopyButton>)
    expect(screen.getByText('Copy link')).toBeInTheDocument()
  })

  it('has correct aria-label before copy', () => {
    render(<CopyButton value="hello" />)
    expect(screen.getByLabelText('Copy to clipboard')).toBeInTheDocument()
  })

  it('calls clipboard API on click', async () => {
    render(<CopyButton value="test-value" />)
    await userEvent.click(screen.getByText('Copy'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-value')
  })

  it('shows "Copied!" feedback after click', async () => {
    render(<CopyButton value="test-value" />)
    await userEvent.click(screen.getByText('Copy'))
    expect(screen.getByText('Copied!')).toBeInTheDocument()
    expect(screen.getByLabelText('Copied')).toBeInTheDocument()
  })

  it('calls onCopy callback after successful copy', async () => {
    const onCopy = vi.fn()
    render(<CopyButton value="hello" onCopy={onCopy} />)
    await userEvent.click(screen.getByText('Copy'))
    expect(onCopy).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<CopyButton value="hello" disabled />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })
})

describe('CopyInput', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders readonly input with value', () => {
    render(<CopyInput value="https://example.com" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('https://example.com')
    expect(input).toHaveAttribute('readOnly')
  })

  it('copy button copies value to clipboard', async () => {
    render(<CopyInput value="https://example.com" />)
    const copyBtn = screen.getByLabelText('Copy to clipboard')
    await userEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com')
  })

  it('shows feedback state after copy', async () => {
    render(<CopyInput value="https://example.com" />)
    const copyBtn = screen.getByLabelText('Copy to clipboard')
    await userEvent.click(copyBtn)
    expect(screen.getByLabelText('Copied')).toBeInTheDocument()
  })

  it('calls onCopy callback', async () => {
    const onCopy = vi.fn()
    render(<CopyInput value="hello" onCopy={onCopy} />)
    const copyBtn = screen.getByLabelText('Copy to clipboard')
    await userEvent.click(copyBtn)
    expect(onCopy).toHaveBeenCalledTimes(1)
  })
})
