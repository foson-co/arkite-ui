import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** Sticky navbar */
  sticky?: boolean
  /** Bordered navbar */
  bordered?: boolean
  /** Navbar height */
  height?: string
}

/** Top navigation bar with optional sticky positioning and bottom border. */
export const Navbar = forwardRef<HTMLElement, NavbarProps>(
  (
    { className, sticky = false, bordered = true, height = '64px', style, children, ...props },
    ref
  ) => (
    <header
      ref={ref}
      className={cn(
        'bg-background flex items-center px-4',
        sticky && 'sticky top-0 z-40',
        bordered && 'border-b',
        className
      )}
      style={{ height, ...style }}
      {...props}
    >
      {children}
    </header>
  )
)

Navbar.displayName = 'Navbar'

// Navbar Brand
export interface NavbarBrandProps extends HTMLAttributes<HTMLDivElement> {
  /** Logo element */
  logo?: ReactNode
  /** Brand name */
  name?: ReactNode
  /** Link href */
  href?: string
  /** Custom link renderer for framework integration (React Router, Next.js). Only used when `href` is set; defaults to a native `<a>`. */
  renderLink?: (props: {
    href: string
    children: ReactNode
    className?: string
    active?: boolean
  }) => ReactNode
}

/** Brand section of the navbar displaying a logo and/or name. */
export const NavbarBrand = forwardRef<HTMLDivElement, NavbarBrandProps>(
  ({ className, logo, name, href, renderLink, children, ...props }, ref) => {
    const content = (
      <>
        {logo && <span className="shrink-0">{logo}</span>}
        {name && <span className="font-bold">{name}</span>}
        {children}
      </>
    )

    if (href) {
      return (
        <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
          {renderLink ? (
            renderLink({
              href,
              children: content,
              className: 'flex items-center gap-2 hover:opacity-80',
            })
          ) : (
            <a href={href} className="flex items-center gap-2 hover:opacity-80">
              {content}
            </a>
          )}
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        {content}
      </div>
    )
  }
)

NavbarBrand.displayName = 'NavbarBrand'

// Navbar Content
export interface NavbarContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Content alignment */
  align?: 'left' | 'center' | 'right'
}

/** Flexible content area within the navbar with configurable alignment. */
export const NavbarContent = forwardRef<HTMLDivElement, NavbarContentProps>(
  ({ className, align = 'left', ...props }, ref) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end ml-auto',
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-4', alignStyles[align], className)}
        {...props}
      />
    )
  }
)

NavbarContent.displayName = 'NavbarContent'

// Navbar Item
export interface NavbarItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Active state */
  active?: boolean
}

/** Individual item wrapper within the navbar. */
export const NavbarItem = forwardRef<HTMLDivElement, NavbarItemProps>(
  ({ className, active, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center', active && 'text-primary', className)}
      {...props}
    >
      {children}
    </div>
  )
)

NavbarItem.displayName = 'NavbarItem'

// Navbar Link
export interface NavbarLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  /** Link href */
  href?: string
  /** Active state */
  active?: boolean
  /** Custom link renderer for framework integration (React Router, Next.js). Only used when `href` is set; defaults to a native `<a>` (ref and extra DOM props are not forwarded to a custom link). */
  renderLink?: (props: {
    href: string
    children: ReactNode
    className?: string
    active?: boolean
  }) => ReactNode
}

/** Styled anchor link for use within the navbar. */
export const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(
  ({ className, href, active, renderLink, children, ...props }, ref) => {
    const linkClassName = cn(
      'text-sm font-medium transition-colors hover:text-foreground',
      active ? 'text-foreground' : 'text-muted-foreground',
      className
    )

    if (renderLink && href != null) {
      return <>{renderLink({ href, children, className: linkClassName, active })}</>
    }

    return (
      <a ref={ref} href={href} className={linkClassName} {...props}>
        {children}
      </a>
    )
  }
)

NavbarLink.displayName = 'NavbarLink'

// Navbar Divider
export type NavbarDividerProps = HTMLAttributes<HTMLDivElement>

/** Vertical divider line between navbar items. */
export const NavbarDivider = forwardRef<HTMLDivElement, NavbarDividerProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-border h-6 w-px', className)} {...props} />
  )
)

NavbarDivider.displayName = 'NavbarDivider'

// Navbar Spacer
export type NavbarSpacerProps = HTMLAttributes<HTMLDivElement>

/** Flexible spacer that pushes adjacent navbar items apart. */
export const NavbarSpacer = forwardRef<HTMLDivElement, NavbarSpacerProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex-1', className)} {...props} />
)

NavbarSpacer.displayName = 'NavbarSpacer'
