import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverClose } from './Popover'

describe('Popover', () => {
  it('renders trigger content', () => {
    render(
      <Popover>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    )
    expect(screen.getByText('Open popover')).toBeInTheDocument()
  })

  it('exports all compound component parts', () => {
    expect(Popover).toBeDefined()
    expect(PopoverTrigger).toBeDefined()
    expect(PopoverContent).toBeDefined()
    expect(PopoverAnchor).toBeDefined()
    expect(PopoverClose).toBeDefined()
  })
})
