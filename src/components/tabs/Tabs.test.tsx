import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'

function renderTabs(props: React.ComponentProps<typeof Tabs> = {}) {
  return render(
    <Tabs defaultValue="tab1" {...props}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3" disabled>
          Tab 3
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders all tab triggers', () => {
    renderTabs()

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument()
  })

  it('shows active tab content based on defaultValue', () => {
    renderTabs()

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  it('switches tab content on click', async () => {
    const user = userEvent.setup()
    renderTabs()

    expect(screen.getByText('Content 1')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
  })

  it('does not switch to a disabled tab', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: 'Tab 3' }))

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  it('marks the disabled trigger as disabled', () => {
    renderTabs()

    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeDisabled()
  })

  it('applies custom className to the root element', () => {
    const { container } = renderTabs({ className: 'my-custom-class' })

    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('renders with a controlled value', () => {
    render(
      <Tabs value="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange when a tab is clicked', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    renderTabs({ onChange: handleChange })

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('tab2')
  })

  it('still supports the deprecated onValueChange alias', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()

    renderTabs({ onValueChange: handleChange })

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('tab2')
  })
})

describe('Tabs orientation', () => {
  const renderUnderlineTabs = (orientation?: 'horizontal' | 'vertical') =>
    render(
      <Tabs defaultValue="a" variant="underline" orientation={orientation}>
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
          <TabsTrigger value="c" disabled>
            Gamma
          </TabsTrigger>
          <TabsTrigger value="d">Delta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
        <TabsContent value="d">Panel D</TabsContent>
      </Tabs>
    )

  it('declares its axis on the tablist', () => {
    renderUnderlineTabs('vertical')
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('defaults to horizontal', () => {
    renderUnderlineTabs()
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('moves the underline rule to the inline edge when vertical', () => {
    renderUnderlineTabs('vertical')
    // Regression guard for the reason this is a prop and not a className:
    // a bottom rule points across the reading direction in a side strip.
    expect(screen.getByRole('tab', { name: 'Alpha' }).className).toContain('border-e-2')
    expect(screen.getByRole('tab', { name: 'Alpha' }).className).not.toContain('border-b-2')
  })

  it('keeps a single tab stop via roving tabindex', () => {
    renderUnderlineTabs()
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('tabindex', '-1')
  })
})

describe('Tabs keyboard navigation', () => {
  const setup = (orientation?: 'horizontal' | 'vertical') => {
    const onChange = vi.fn()
    render(
      <Tabs defaultValue="a" orientation={orientation} onChange={onChange}>
        <TabsList>
          <TabsTrigger value="a">Alpha</TabsTrigger>
          <TabsTrigger value="b">Beta</TabsTrigger>
          <TabsTrigger value="c" disabled>
            Gamma
          </TabsTrigger>
          <TabsTrigger value="d">Delta</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
        <TabsContent value="d">Panel D</TabsContent>
      </Tabs>
    )
    return { onChange }
  }

  it('moves along the horizontal axis with left/right', async () => {
    const user = userEvent.setup()
    const { onChange } = setup()
    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('b')
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus()
  })

  it('ignores the cross-axis keys', async () => {
    const user = userEvent.setup()
    const { onChange } = setup()
    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('moves along the vertical axis with up/down', async () => {
    const user = userEvent.setup()
    const { onChange } = setup('vertical')
    screen.getByRole('tab', { name: 'Alpha' }).focus()
    await user.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith('b')
  })

  it('skips disabled tabs and wraps around', async () => {
    const user = userEvent.setup()
    const { onChange } = setup()
    screen.getByRole('tab', { name: 'Beta' }).focus()
    await user.keyboard('{ArrowRight}')
    // Gamma is disabled → Delta
    expect(onChange).toHaveBeenLastCalledWith('d')
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('a')
  })

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup()
    const { onChange } = setup()
    screen.getByRole('tab', { name: 'Beta' }).focus()
    await user.keyboard('{End}')
    expect(onChange).toHaveBeenLastCalledWith('d')
    await user.keyboard('{Home}')
    expect(onChange).toHaveBeenLastCalledWith('a')
  })
})
