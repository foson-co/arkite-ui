import { type ReactNode } from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  SidebarToggle,
  useSidebar,
} from '../sidebar/Sidebar'
import { Navbar, NavbarContent, NavbarSpacer } from '../navbar/Navbar'
import { Avatar } from '../avatar/Avatar'
import { Badge, type BadgeVariant } from '../badge/Badge'
import { ToastContainer } from '../toast/Toast'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

// --- Types ---

export interface AdminNavItem {
  /** Route path */
  path: string
  /** Display label */
  label: string
  /** Icon element */
  icon?: ReactNode
  /** Badge content (e.g., notification count) */
  badge?: ReactNode
  /** Required permissions (any match grants access) */
  permissions?: string[]
  /** External link (opens new tab) */
  external?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Additional path patterns that should highlight this item (supports /stores/:id/appointments style) */
  activeMatch?: string[]
}

export interface AdminNavGroup {
  /** Group heading label */
  label: string
  /** Navigation items in this group */
  items: AdminNavItem[]
  /** Only visible when `visibleWhen` returns true */
  visibleWhen?: (context: AdminLayoutContext) => boolean
  /** Group icon (used by `sidebarVariant="rail"`; ignored in classic) */
  icon?: ReactNode
  /** Optional group-level route (used by `sidebarVariant="rail"` when the rail item is clicked; falls back to the first visible item's path) */
  path?: string
}

export interface AdminBrandConfig {
  /** Brand name */
  name: string
  /** Short name or letter for collapsed state */
  shortName?: string
  /** Logo element (replaces default letter icon) */
  logo?: ReactNode
  /** Collapsed logo element */
  collapsedLogo?: ReactNode
}

export interface AdminUserConfig {
  /** User display name */
  name?: string
  /** User email */
  email?: string
  /** Avatar fallback (initials) */
  avatarFallback?: string
  /** Avatar image URL */
  avatarSrc?: string
  /** Role display name */
  roleLabel?: string
  /** Role badge variant */
  roleBadgeVariant?: BadgeVariant
}

export interface AdminLayoutContext {
  /** Current path */
  currentPath: string
  /** Check if user has any of the given permissions */
  hasPermission?: (permissions: string[]) => boolean
}

export interface AdminLayoutProps {
  /** Current pathname for active state */
  currentPath: string
  /** Navigation groups */
  navigation: AdminNavGroup[]
  /** Brand configuration */
  brand: AdminBrandConfig
  /** User info for navbar display */
  user?: AdminUserConfig
  /** Base path prefix for all routes */
  basePath?: string
  /** Navigate callback */
  onNavigate: (path: string) => void
  /** Custom link renderer for framework integration (React Router, Next.js) */
  renderLink?: (props: {
    href: string
    children: ReactNode
    className?: string
    active?: boolean
  }) => ReactNode
  /** Permission check function */
  hasPermission?: (permissions: string[]) => boolean
  /** Logout handler */
  onLogout?: () => void
  /** Extra content in the navbar (left side, after brand area) */
  navbarLeft?: ReactNode
  /** Extra content in the navbar (right side, before user info) */
  navbarRight?: ReactNode
  /** Sidebar footer content (replaces default logout button) */
  sidebarFooter?: ReactNode
  /** Sidebar visual variant: `"classic"` (default, 240/64px collapsible with labels) or `"rail"` (72px fixed icon rail where each nav group becomes one item). */
  sidebarVariant?: 'classic' | 'rail'
  /** Optional sub-navigation slot rendered between the navbar and main content. Intended for the rail variant's "sub pill" row, but works with any variant. */
  subNav?: ReactNode
  /** Toast position */
  toastPosition?:
    | 'top-right'
    | 'top-left'
    | 'top-center'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
  /** Hide toast container (if consumer manages their own) */
  hideToast?: boolean
  /**
   * Class overrides for the internal regions — the supported way to restyle
   * parts AdminLayout renders itself. Use this instead of global CSS that
   * targets internal DOM (aria-labels, utility-class combos): those selectors
   * break silently on any markup change, with no build-time signal.
   */
  classNames?: {
    root?: string
    sidebar?: string
    navbar?: string
    subNav?: string
    main?: string
    bottomNav?: string
  }
  /** Hide the sidebar: `true` removes it, `'mobile'` hides it below the `md` breakpoint */
  hideSidebar?: boolean | 'mobile'
  /** Hide the navbar: `true` removes it, `'mobile'` hides it below the `md` breakpoint */
  hideNavbar?: boolean | 'mobile'
  /**
   * Mobile bottom navigation slot — rendered as a fixed bar below the `md`
   * breakpoint with safe-area padding built in on all three exposed edges
   * (home indicator plus the side notch in landscape); the main
   * area gets matching bottom padding so content is never hidden behind it.
   * Pair with `hideSidebar="mobile"` for the sidebar-on-desktop /
   * bottom-tabs-on-mobile pattern.
   */
  bottomNav?: ReactNode
  /** Main content */
  children: ReactNode
  className?: string
}

// --- Internal components ---

function SidebarBrand({ brand }: { brand: AdminBrandConfig }) {
  const locale = useLocale()
  const { collapsed, setCollapsed } = useSidebar()

  if (collapsed) {
    return (
      <SidebarHeader className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold transition-colors"
          title={locale.adminLayout.expandMenu}
        >
          {brand.collapsedLogo || brand.shortName || brand.name.charAt(0)}
        </button>
      </SidebarHeader>
    )
  }

  return (
    <SidebarHeader className="flex items-center justify-between">
      <div className="flex items-center gap-2 px-2">
        {brand.logo || (
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold">
            {brand.shortName || brand.name.charAt(0)}
          </div>
        )}
        <span className="font-semibold">{brand.name}</span>
      </div>
      <SidebarToggle />
    </SidebarHeader>
  )
}

function NavItemContent({ item }: { item: AdminNavItem }) {
  return (
    <>
      {item.label}
      {item.badge && <span className="ml-auto">{item.badge}</span>}
    </>
  )
}

// --- Main component ---

/**
 * Full admin page layout with a collapsible sidebar, top navbar, and
 * permission-aware navigation.
 *
 * **In context:** [Tenant Admin Shell](https://ui.foson.co/storybook/?path=/docs/recipes-tenant-admin-shell--docs)
 */
export function AdminLayout({
  currentPath,
  navigation,
  brand,
  user,
  basePath = '',
  onNavigate,
  renderLink,
  hasPermission,
  onLogout,
  navbarLeft,
  navbarRight,
  sidebarFooter,
  sidebarVariant = 'classic',
  subNav,
  toastPosition = 'top-right',
  hideToast = false,
  classNames,
  hideSidebar = false,
  hideNavbar = false,
  bottomNav,
  children,
  className,
}: AdminLayoutProps) {
  const locale = useLocale()
  const context: AdminLayoutContext = { currentPath, hasPermission }

  // Filter navigation based on permissions and visibility
  const visibleGroups = navigation
    .filter((group) => {
      if (group.visibleWhen && !group.visibleWhen(context)) return false
      return true
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.permissions && item.permissions.length > 0 && hasPermission) {
          return hasPermission(item.permissions)
        }
        return true
      }),
    }))
    .filter((group) => group.items.length > 0)

  const resolvePath = (path: string) => `${basePath}${path}`

  const handleItemClick = (item: AdminNavItem) => {
    if (item.external) {
      window.open(resolvePath(item.path), '_blank', 'noopener,noreferrer')
    } else {
      onNavigate(resolvePath(item.path))
    }
  }

  const isActive = (item: AdminNavItem) => {
    // Check activeMatch first (more specific patterns take priority)
    if (item.activeMatch) {
      const matched = item.activeMatch.some((pattern) => {
        const regex = new RegExp(`^${resolvePath(pattern).replace(/:[^/]+/g, '[^/]+')}(/|$)`)
        return regex.test(currentPath)
      })
      if (matched) return true
    }
    // Check if any OTHER item's activeMatch claims this path (avoid double highlight)
    const claimedByOther = visibleGroups.some((group) =>
      group.items.some(
        (other) =>
          other.path !== item.path &&
          other.activeMatch?.some((pattern) => {
            const regex = new RegExp(`^${resolvePath(pattern).replace(/:[^/]+/g, '[^/]+')}(/|$)`)
            return regex.test(currentPath)
          })
      )
    )
    if (claimedByOther) return false
    // Default: exact match or startsWith
    const resolved = resolvePath(item.path)
    return currentPath === resolved || currentPath.startsWith(`${resolved}/`)
  }

  const isGroupActive = (group: AdminNavGroup) => {
    if (group.path) {
      const resolved = resolvePath(group.path)
      if (currentPath === resolved || currentPath.startsWith(`${resolved}/`)) return true
    }
    return group.items.some((item) => isActive(item))
  }

  const handleGroupClick = (group: AdminNavGroup) => {
    const target = group.path ?? group.items[0]?.path
    if (!target) return
    onNavigate(resolvePath(target))
  }

  return (
    <div className={cn('bg-background flex h-screen', classNames?.root, className)}>
      {/* Sidebar */}
      {hideSidebar === true ? null : sidebarVariant === 'rail' ? (
        <aside
          className={cn(
            'bg-card flex w-[72px] min-w-[72px] flex-col border-r',
            hideSidebar === 'mobile' && 'hidden md:flex',
            classNames?.sidebar
          )}
          aria-label={locale.adminLayout.primaryNavigation}
        >
          <div className="flex h-14 items-center justify-center border-b">
            {brand.collapsedLogo || (
              <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold">
                {brand.shortName || brand.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-x-hidden overflow-y-auto py-2">
            <div className="flex flex-col items-stretch gap-1 px-2">
              {visibleGroups.map((group) => {
                const active = isGroupActive(group)
                const itemClassName = cn(
                  'flex flex-col items-center gap-1 rounded-md px-1 py-2 text-xs font-medium leading-tight transition-colors',
                  'hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
                )
                const itemContent = (
                  <>
                    <span className="flex h-6 w-6 items-center justify-center">
                      {group.icon || (
                        <span className="text-sm font-semibold">{group.label.charAt(0)}</span>
                      )}
                    </span>
                    <span className="w-full truncate text-center">{group.label}</span>
                  </>
                )

                if (renderLink && group.path) {
                  return (
                    <div key={group.label}>
                      {renderLink({
                        href: resolvePath(group.path),
                        active,
                        className: itemClassName,
                        children: itemContent,
                      })}
                    </div>
                  )
                }

                return (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => handleGroupClick(group)}
                    aria-label={group.label}
                    aria-current={active ? 'page' : undefined}
                    className={itemClassName}
                  >
                    {itemContent}
                  </button>
                )
              })}
            </div>
          </div>
          {(sidebarFooter || onLogout) && (
            <div className="border-t p-2">
              {sidebarFooter ||
                (onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    aria-label={locale.adminLayout.logout}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {locale.adminLayout.logout}
                  </button>
                ))}
            </div>
          )}
        </aside>
      ) : (
        <Sidebar
          collapsible
          defaultCollapsed={false}
          className={cn(hideSidebar === 'mobile' && 'hidden md:flex', classNames?.sidebar)}
        >
          <SidebarBrand brand={brand} />

          <SidebarContent>
            {visibleGroups.map((group) => (
              <SidebarGroup key={group.label} label={group.label}>
                {group.items.map((item) => {
                  const active = isActive(item)

                  if (renderLink && !item.external) {
                    return (
                      <div key={item.path}>
                        {renderLink({
                          href: resolvePath(item.path),
                          active,
                          className: 'block',
                          children: (
                            <SidebarItem icon={item.icon} active={active} disabled={item.disabled}>
                              <NavItemContent item={item} />
                            </SidebarItem>
                          ),
                        })}
                      </div>
                    )
                  }

                  return (
                    <SidebarItem
                      key={item.path}
                      icon={item.icon}
                      active={active}
                      disabled={item.disabled}
                      onClick={() => handleItemClick(item)}
                    >
                      <NavItemContent item={item} />
                      {item.external && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 15 15"
                          fill="none"
                          className="ml-1 opacity-50"
                        >
                          <path
                            d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3H6.5C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </SidebarItem>
                  )
                })}
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter>
            {sidebarFooter ||
              (onLogout && (
                <SidebarItem onClick={onLogout}>{locale.adminLayout.logout}</SidebarItem>
              ))}
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        {hideNavbar !== true && (
          <Navbar
            sticky
            bordered
            className={cn(hideNavbar === 'mobile' && 'hidden md:flex', classNames?.navbar)}
          >
            <NavbarContent align="left">{navbarLeft}</NavbarContent>
            <NavbarSpacer />
            <NavbarContent align="right">
              {navbarRight}
              {user && (
                <div className="flex items-center gap-3">
                  <Avatar
                    fallback={user.avatarFallback || user.name?.charAt(0) || 'U'}
                    src={user.avatarSrc}
                    size="sm"
                  />
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      {user.roleLabel && (
                        <Badge variant={user.roleBadgeVariant || 'secondary'} className="text-xs">
                          {user.roleLabel}
                        </Badge>
                      )}
                    </div>
                    {user.email && user.name && (
                      <p className="text-muted-foreground text-xs">{user.email}</p>
                    )}
                  </div>
                </div>
              )}
            </NavbarContent>
          </Navbar>
        )}

        {/* Sub-navigation slot (e.g., rail variant's sub pill row) */}
        {subNav && (
          <div className={cn('bg-card/50 border-b px-6 py-2', classNames?.subNav)}>{subNav}</div>
        )}

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 overflow-auto p-6',
            bottomNav != null && 'max-md:pb-24',
            classNames?.main
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {bottomNav != null && (
        <nav
          aria-label={locale.adminLayout.bottomNavigation}
          className={cn(
            'bg-card fixed inset-x-0 bottom-0 z-40 border-t md:hidden',
            'pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]',
            classNames?.bottomNav
          )}
        >
          {bottomNav}
        </nav>
      )}

      {/* Toast Container */}
      {!hideToast && <ToastContainer position={toastPosition} />}
    </div>
  )
}
