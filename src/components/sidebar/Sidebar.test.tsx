import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  SidebarToggle,
  useSidebar,
} from './Sidebar'

describe('Sidebar', () => {
  it('renders as an aside element', () => {
    render(
      <Sidebar data-testid="sidebar">
        <SidebarContent>Content</SidebarContent>
      </Sidebar>
    )
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.tagName).toBe('ASIDE')
    expect(sidebar).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Sidebar data-testid="sidebar" className="my-custom-class">
        <SidebarContent />
      </Sidebar>
    )
    expect(screen.getByTestId('sidebar').className).toContain('my-custom-class')
  })

  it('renders children', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <span>Sidebar child</span>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByText('Sidebar child')).toBeInTheDocument()
  })

  it('uses default width when not collapsed', () => {
    render(
      <Sidebar data-testid="sidebar">
        <SidebarContent />
      </Sidebar>
    )
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.style.width).toBe('240px')
  })

  it('uses collapsed width when defaultCollapsed is true', () => {
    render(
      <Sidebar data-testid="sidebar" defaultCollapsed>
        <SidebarContent />
      </Sidebar>
    )
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.style.width).toBe('64px')
  })

  it('uses custom width and collapsedWidth', () => {
    render(
      <Sidebar data-testid="sidebar" width="300px" collapsedWidth="80px" defaultCollapsed>
        <SidebarContent />
      </Sidebar>
    )
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.style.width).toBe('80px')
  })
})

describe('Sidebar collapsed state', () => {
  it('toggles collapsed state via SidebarToggle', async () => {
    render(
      <Sidebar data-testid="sidebar">
        <SidebarHeader>
          <SidebarToggle />
        </SidebarHeader>
        <SidebarContent />
      </Sidebar>
    )
    const sidebar = screen.getByTestId('sidebar')
    const toggle = screen.getByRole('button', { name: 'Toggle sidebar' })

    expect(sidebar.style.width).toBe('240px')

    await userEvent.click(toggle)
    expect(sidebar.style.width).toBe('64px')

    await userEvent.click(toggle)
    expect(sidebar.style.width).toBe('240px')
  })

  it('calls onCollapsedChange when toggled', async () => {
    const onCollapsedChange = vi.fn()
    render(
      <Sidebar onCollapsedChange={onCollapsedChange}>
        <SidebarHeader>
          <SidebarToggle />
        </SidebarHeader>
      </Sidebar>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Toggle sidebar' }))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
  })

  it('respects controlled collapsed prop', () => {
    render(
      <Sidebar data-testid="sidebar" collapsed>
        <SidebarContent />
      </Sidebar>
    )
    expect(screen.getByTestId('sidebar').style.width).toBe('64px')
  })

  it('hides SidebarToggle when collapsible is false', () => {
    render(
      <Sidebar collapsible={false}>
        <SidebarHeader>
          <SidebarToggle />
        </SidebarHeader>
      </Sidebar>
    )
    expect(screen.queryByRole('button', { name: 'Toggle sidebar' })).not.toBeInTheDocument()
  })
})

describe('SidebarItem', () => {
  it('renders item text', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem>Dashboard</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders an icon', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem icon={<span data-testid="icon">I</span>}>Home</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies active styling', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem active>Active Item</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    const item = screen.getByRole('button', { name: 'Active Item' })
    expect(item.className).toContain('bg-primary/5')
    expect(item.className).toContain('text-primary')
  })

  it('fires onClick callback', async () => {
    const onClick = vi.fn()
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem onClick={onClick}>Clickable</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Clickable' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('can be disabled', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem disabled>Disabled</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })

  it('renders as a link when href is provided', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarItem href="/home">Home Link</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    const link = screen.getByRole('link', { name: 'Home Link' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/home')
  })

  it('hides text when sidebar is collapsed', () => {
    render(
      <Sidebar defaultCollapsed>
        <SidebarContent>
          <SidebarItem icon={<span data-testid="icon">I</span>}>Hidden Text</SidebarItem>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

describe('SidebarGroup', () => {
  it('renders group label', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup label="Navigation">
            <SidebarItem>Item</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })

  it('hides group label when collapsed', () => {
    render(
      <Sidebar defaultCollapsed>
        <SidebarContent>
          <SidebarGroup label="Navigation">
            <SidebarItem icon={<span>I</span>}>Item</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.queryByText('Navigation')).not.toBeInTheDocument()
  })

  it('renders group children', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup label="Section">
            <SidebarItem>First</SidebarItem>
            <SidebarItem>Second</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('applies custom className to group', () => {
    render(
      <Sidebar>
        <SidebarContent>
          <SidebarGroup label="Nav" className="custom-group" data-testid="group">
            <SidebarItem>Item</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
    expect(screen.getByTestId('group').className).toContain('custom-group')
  })
})

describe('SidebarHeader / SidebarFooter', () => {
  it('renders header content', () => {
    render(
      <Sidebar>
        <SidebarHeader>
          <span>App Name</span>
        </SidebarHeader>
      </Sidebar>
    )
    expect(screen.getByText('App Name')).toBeInTheDocument()
  })

  it('renders footer content', () => {
    render(
      <Sidebar>
        <SidebarFooter>
          <span>Footer Info</span>
        </SidebarFooter>
      </Sidebar>
    )
    expect(screen.getByText('Footer Info')).toBeInTheDocument()
  })
})

describe('useSidebar', () => {
  it('throws when used outside Sidebar', () => {
    const TestComponent = () => {
      useSidebar()
      return null
    }

    expect(() => render(<TestComponent />)).toThrow('useSidebar must be used within a Sidebar')
  })
})
