import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarLink,
  NavbarDivider,
  NavbarSpacer,
} from './Navbar'

describe('Navbar', () => {
  it('renders children', () => {
    render(<Navbar>Nav content</Navbar>)
    expect(screen.getByText('Nav content')).toBeInTheDocument()
  })

  it('renders as header element', () => {
    render(<Navbar>Nav</Navbar>)
    expect(screen.getByText('Nav').closest('header')).toBeInTheDocument()
  })

  it('sticky prop adds sticky class', () => {
    render(<Navbar sticky>Nav</Navbar>)
    const header = screen.getByText('Nav').closest('header')!
    expect(header.className).toContain('sticky')
  })

  it('does not add sticky class by default', () => {
    render(<Navbar>Nav</Navbar>)
    const header = screen.getByText('Nav').closest('header')!
    expect(header.className).not.toContain('sticky')
  })

  it('bordered prop adds border-b by default', () => {
    render(<Navbar>Nav</Navbar>)
    const header = screen.getByText('Nav').closest('header')!
    expect(header.className).toContain('border-b')
  })

  it('bordered=false removes border-b', () => {
    render(<Navbar bordered={false}>Nav</Navbar>)
    const header = screen.getByText('Nav').closest('header')!
    expect(header.className).not.toContain('border-b')
  })
})

describe('NavbarBrand', () => {
  it('renders name', () => {
    render(<NavbarBrand name="My App" />)
    expect(screen.getByText('My App')).toBeInTheDocument()
  })

  it('renders logo', () => {
    render(<NavbarBrand logo={<span data-testid="logo">L</span>} />)
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })

  it('renders as link when href is provided', () => {
    render(<NavbarBrand name="App" href="/home" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/home')
  })

  it('does not render link when href is not provided', () => {
    render(<NavbarBrand name="App" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('uses renderLink when provided with href', () => {
    render(
      <NavbarBrand
        name="App"
        href="/home"
        renderLink={({ href, children, className }) => (
          <a href={href} className={className} data-testid="custom-link">
            {children}
          </a>
        )}
      />
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/home')
    expect(link.className).toContain('flex items-center gap-2')
    expect(screen.getByText('App')).toBeInTheDocument()
  })

  it('does not use renderLink without href', () => {
    render(
      <NavbarBrand
        name="App"
        renderLink={({ href, children }) => (
          <a href={href} data-testid="custom-link">
            {children}
          </a>
        )}
      />
    )
    expect(screen.queryByTestId('custom-link')).not.toBeInTheDocument()
  })
})

describe('NavbarLink', () => {
  it('renders a native anchor by default', () => {
    render(<NavbarLink href="/docs">Docs</NavbarLink>)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).toHaveTextContent('Docs')
  })

  it('applies active state class', () => {
    render(
      <NavbarLink href="/docs" active>
        Docs
      </NavbarLink>
    )
    expect(screen.getByRole('link').className).toContain('text-foreground')
  })

  it('uses renderLink when provided with href', () => {
    render(
      <NavbarLink
        href="/docs"
        active
        renderLink={({ href, children, className, active }) => (
          <a
            href={href}
            className={className}
            data-testid="custom-link"
            data-active={active ? 'true' : 'false'}
          >
            {children}
          </a>
        )}
      >
        Docs
      </NavbarLink>
    )
    const link = screen.getByTestId('custom-link')
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).toHaveAttribute('data-active', 'true')
    expect(link.className).toContain('text-foreground')
    expect(link).toHaveTextContent('Docs')
  })

  it('does not use renderLink without href', () => {
    render(
      <NavbarLink
        renderLink={({ href, children }) => (
          <a href={href} data-testid="custom-link">
            {children}
          </a>
        )}
      >
        Docs
      </NavbarLink>
    )
    expect(screen.queryByTestId('custom-link')).not.toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })
})

describe('NavbarContent', () => {
  it('renders children', () => {
    render(<NavbarContent>Content</NavbarContent>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('applies left alignment by default', () => {
    render(<NavbarContent>Content</NavbarContent>)
    expect(screen.getByText('Content').className).toContain('justify-start')
  })

  it('applies right alignment', () => {
    render(<NavbarContent align="right">Content</NavbarContent>)
    expect(screen.getByText('Content').className).toContain('justify-end')
  })

  it('applies center alignment', () => {
    render(<NavbarContent align="center">Content</NavbarContent>)
    expect(screen.getByText('Content').className).toContain('justify-center')
  })
})

describe('NavbarItem', () => {
  it('renders children', () => {
    render(<NavbarItem>Item</NavbarItem>)
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('applies active state class', () => {
    render(<NavbarItem active>Item</NavbarItem>)
    expect(screen.getByText('Item').className).toContain('text-primary')
  })

  it('does not apply active class when not active', () => {
    render(<NavbarItem>Item</NavbarItem>)
    expect(screen.getByText('Item').className).not.toContain('text-primary')
  })
})

describe('NavbarDivider', () => {
  it('renders', () => {
    render(<NavbarDivider data-testid="divider" />)
    expect(screen.getByTestId('divider')).toBeInTheDocument()
    expect(screen.getByTestId('divider').className).toContain('bg-border')
  })
})

describe('NavbarSpacer', () => {
  it('renders with flex-1', () => {
    render(<NavbarSpacer data-testid="spacer" />)
    expect(screen.getByTestId('spacer').className).toContain('flex-1')
  })
})
