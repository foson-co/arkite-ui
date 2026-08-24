import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SimpleTooltip } from './Tooltip'

describe('Tooltip', () => {
  it('renders trigger content via compound components', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('exports all compound component parts', () => {
    expect(Tooltip).toBeDefined()
    expect(TooltipTrigger).toBeDefined()
    expect(TooltipContent).toBeDefined()
    expect(TooltipProvider).toBeDefined()
  })
})

describe('SimpleTooltip', () => {
  it('renders children', () => {
    render(
      <TooltipProvider>
        <SimpleTooltip content="Help text">
          <button>Click me</button>
        </SimpleTooltip>
      </TooltipProvider>
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
