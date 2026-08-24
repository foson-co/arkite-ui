import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Stack, HStack, VStack } from './Stack'

describe('Stack', () => {
  it('renders children in a flex container', () => {
    render(
      <Stack>
        <span>A</span>
        <span>B</span>
      </Stack>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('defaults to column direction', () => {
    const { container } = render(<Stack>Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-col')
  })

  it('applies row direction', () => {
    const { container } = render(<Stack direction="row">Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-row')
  })

  it('applies spacing', () => {
    const { container } = render(<Stack spacing="lg">Content</Stack>)
    expect(container.firstChild).toHaveClass('gap-6')
  })

  it('applies fullWidth', () => {
    const { container } = render(<Stack fullWidth>Content</Stack>)
    expect(container.firstChild).toHaveClass('w-full')
  })

  it('applies wrap', () => {
    const { container } = render(<Stack wrap>Content</Stack>)
    expect(container.firstChild).toHaveClass('flex-wrap')
  })
})

describe('HStack', () => {
  it('renders as row', () => {
    const { container } = render(<HStack>Content</HStack>)
    expect(container.firstChild).toHaveClass('flex-row')
  })
})

describe('VStack', () => {
  it('renders as column', () => {
    const { container } = render(<VStack>Content</VStack>)
    expect(container.firstChild).toHaveClass('flex-col')
  })
})
