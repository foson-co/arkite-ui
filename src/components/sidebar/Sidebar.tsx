import {
  createContext,
  forwardRef,
  useContext,
  useState,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react'
import { cn } from '../../utils/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale } from '../../locale'

// Sidebar Context
interface SidebarContextValue {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  collapsible: boolean
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a Sidebar')
  }
  return context
}

// Sidebar Root
export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Collapsible sidebar */
  collapsible?: boolean
  /** Default collapsed state */
  defaultCollapsed?: boolean
  /** Controlled collapsed state */
  collapsed?: boolean
  /** On collapsed change */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Sidebar width */
  width?: string
  /** Collapsed width */
  collapsedWidth?: string
}

/** Collapsible sidebar navigation panel with controlled or uncontrolled state. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      className,
      collapsible = true,
      defaultCollapsed = false,
      collapsed: controlledCollapsed,
      onCollapsedChange,
      width = '240px',
      collapsedWidth = '64px',
      children,
      style,
      ...props
    },
    ref
  ) => {
    const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed)

    const collapsed = controlledCollapsed ?? uncontrolledCollapsed
    const setCollapsed = (value: boolean) => {
      setUncontrolledCollapsed(value)
      onCollapsedChange?.(value)
    }

    return (
      <SidebarContext.Provider value={{ collapsed, setCollapsed, collapsible }}>
        <aside
          ref={ref}
          className={cn('bg-card flex flex-col border-r transition-all duration-300', className)}
          style={{
            width: collapsed ? collapsedWidth : width,
            minWidth: collapsed ? collapsedWidth : width,
            ...style,
          }}
          {...props}
        >
          {children}
        </aside>
      </SidebarContext.Provider>
    )
  }
)

Sidebar.displayName = 'Sidebar'

// Sidebar Header
export type SidebarHeaderProps = HTMLAttributes<HTMLDivElement>

/** Header area at the top of the sidebar. */
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-14 items-center border-b px-4',
          collapsed && 'justify-center px-2',
          className
        )}
        {...props}
      />
    )
  }
)

SidebarHeader.displayName = 'SidebarHeader'

// Sidebar Content
export type SidebarContentProps = HTMLAttributes<HTMLDivElement>

/** Scrollable main content area of the sidebar. */
export const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-auto py-2', className)} {...props} />
  )
)

SidebarContent.displayName = 'SidebarContent'

// Sidebar Footer
export type SidebarFooterProps = HTMLAttributes<HTMLDivElement>

/** Footer area at the bottom of the sidebar. */
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <div ref={ref} className={cn('border-t p-4', collapsed && 'px-2', className)} {...props} />
    )
  }
)

SidebarFooter.displayName = 'SidebarFooter'

// Sidebar Group
export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Group label */
  label?: ReactNode
}

/** Labeled group of sidebar items. */
export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, label, children, ...props }, ref) => {
    const { collapsed } = useSidebar()

    return (
      <div ref={ref} className={cn('px-2 py-2', className)} {...props}>
        {label && !collapsed && (
          <div className="text-muted-foreground mb-2 px-2 text-xs font-medium tracking-wider uppercase">
            {label}
          </div>
        )}
        <div className="space-y-1">{children}</div>
      </div>
    )
  }
)

SidebarGroup.displayName = 'SidebarGroup'

// Sidebar Item
export interface SidebarItemProps extends HTMLAttributes<HTMLButtonElement> {
  /** Item icon */
  icon?: ReactNode
  /** Active state */
  active?: boolean
  /** Disabled state */
  disabled?: boolean
  /** As link */
  href?: string
}

/** Clickable navigation item within the sidebar, rendered as a button or link. */
export const SidebarItem = forwardRef<HTMLButtonElement | HTMLAnchorElement, SidebarItemProps>(
  ({ className, icon, active, disabled, href, children, onClick, ...props }, ref) => {
    const { collapsed } = useSidebar()

    const content = (
      <>
        {icon && <span className={cn('shrink-0', collapsed ? '' : 'mr-3')}>{icon}</span>}
        {!collapsed && <span className="truncate">{children}</span>}
      </>
    )

    const itemClassName = cn(
      'flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
      'hover:bg-muted hover:text-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active && 'bg-primary/5 text-primary',
      disabled && 'pointer-events-none opacity-50',
      collapsed && 'justify-center px-2',
      className
    )

    if (href) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={itemClassName}
          onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
          {...(props as HTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      )
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={itemClassName}
        {...props}
      >
        {content}
      </button>
    )
  }
)

SidebarItem.displayName = 'SidebarItem'

// Sidebar Toggle
export type SidebarToggleProps = HTMLAttributes<HTMLButtonElement>

/** Button that toggles the sidebar between collapsed and expanded states. */
export const SidebarToggle = forwardRef<HTMLButtonElement, SidebarToggleProps>(
  ({ className, ...props }, ref) => {
    const locale = useLocale()
    const { collapsed, setCollapsed, collapsible } = useSidebar()

    if (!collapsible) return null

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'bg-background text-muted-foreground flex h-8 w-8 items-center justify-center rounded-md border',
          'hover:text-foreground hover:bg-muted',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
          className
        )}
        {...props}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        <span className="sr-only">{locale.sidebar.toggle}</span>
      </button>
    )
  }
)

SidebarToggle.displayName = 'SidebarToggle'
