import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { warnDeprecated } from '../../utils/deprecate'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Data shape for one breadcrumb trail entry.
 *
 * Renamed from `BreadcrumbItem` in v1.0 — `BreadcrumbItem` is now the
 * compound `<li>` component (formerly `BreadcrumbItemComponent`).
 */
export interface BreadcrumbItemData {
  /** Item label */
  label: ReactNode
  /** Item href */
  href?: string
  /** Item icon */
  icon?: ReactNode
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Breadcrumb items */
  items: BreadcrumbItemData[]
  /** Custom separator */
  separator?: ReactNode
  /** Show home icon */
  showHomeIcon?: boolean
  /** Max items to show (others collapsed) */
  maxItems?: number
  /**
   * Custom link renderer for framework integration (React Router, Next.js).
   *
   * Called for every item that has an `href` with `{ href, children, className, active }`
   * (`active` is true for the last item); items without an `href` keep the default
   * non-interactive rendering. Breaking change in v1.0: the old
   * `(item, isLast) => ReactNode` signature is no longer supported.
   */
  renderLink?: (props: {
    href: string
    children: ReactNode
    className?: string
    active?: boolean
  }) => ReactNode
}

/** Navigation breadcrumb trail with collapsible items, custom separators, and link rendering. */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, separator, showHomeIcon = false, maxItems, renderLink, ...props }, ref) => {
    const locale = useLocale()
    const separatorElement = separator || <ChevronRight className="text-muted-foreground h-4 w-4" />

    // Handle collapsed items
    let displayItems = items
    let hasEllipsis = false

    if (maxItems && items.length > maxItems) {
      const firstItem = items[0]
      const lastItems = items.slice(-(maxItems - 1))
      displayItems = [firstItem, ...lastItems]
      hasEllipsis = true
    }

    const renderItem = (item: BreadcrumbItemData, index: number, isLast: boolean) => {
      const content = (
        <>
          {index === 0 && showHomeIcon && !item.icon && <Home className="h-4 w-4" />}
          {item.icon}
          <span>{item.label}</span>
        </>
      )

      if (renderLink && item.href) {
        return renderLink({
          href: item.href,
          children: content,
          className: cn(
            'inline-flex items-center gap-1.5',
            isLast
              ? 'font-medium text-foreground'
              : 'text-muted-foreground hover:text-foreground transition-colors'
          ),
          active: isLast,
        })
      }

      if (isLast || !item.href) {
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5',
              isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
            aria-current={isLast ? 'page' : undefined}
          >
            {content}
          </span>
        )
      }

      return (
        <a
          href={item.href}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
        >
          {content}
        </a>
      )
    }

    return (
      <nav ref={ref} aria-label={locale.breadcrumb.label} className={className} {...props}>
        <ol className="flex items-center gap-2 text-sm">
          {displayItems.map((item, index) => {
            const isLast = index === displayItems.length - 1
            const showEllipsis = hasEllipsis && index === 0

            return (
              <li key={index} className="flex items-center gap-2">
                {renderItem(item, index, isLast)}
                {showEllipsis && (
                  <>
                    <span className="text-muted-foreground">{separatorElement}</span>
                    <span className="text-muted-foreground">...</span>
                  </>
                )}
                {!isLast && !showEllipsis && (
                  <span className="text-muted-foreground">{separatorElement}</span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'

// Compound component approach
export type BreadcrumbRootProps = HTMLAttributes<HTMLElement>

/** Root nav wrapper for composing breadcrumb parts individually. */
export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbRootProps>(
  ({ className, ...props }, ref) => {
    const locale = useLocale()
    return <nav ref={ref} aria-label={locale.breadcrumb.label} className={className} {...props} />
  }
)

BreadcrumbRoot.displayName = 'BreadcrumbRoot'

export type BreadcrumbListProps = HTMLAttributes<HTMLOListElement>

/** Ordered list container for breadcrumb items. */
export const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => (
    <ol ref={ref} className={cn('flex items-center gap-2 text-sm', className)} {...props} />
  )
)

BreadcrumbList.displayName = 'BreadcrumbList'

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement>

/**
 * Individual list item within a breadcrumb list.
 *
 * Renamed from `BreadcrumbItemComponent` in v1.0 — the `BreadcrumbItem` name
 * previously referred to the item data shape, now `BreadcrumbItemData`.
 */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn('flex items-center gap-2', className)} {...props} />
  )
)

BreadcrumbItem.displayName = 'BreadcrumbItem'

/** @deprecated Renamed to `BreadcrumbItem` — will be removed in v1.0. */
export const BreadcrumbItemComponent = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  (props, ref) => {
    warnDeprecated('Breadcrumb', 'BreadcrumbItemComponent', 'BreadcrumbItem')
    return <BreadcrumbItem ref={ref} {...props} />
  }
)

BreadcrumbItemComponent.displayName = 'BreadcrumbItemComponent'

export interface BreadcrumbLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href?: string
  asChild?: boolean
}

/** Clickable anchor link within a breadcrumb item. */
export const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, children, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={cn('text-muted-foreground hover:text-foreground transition-colors', className)}
      {...props}
    >
      {children}
    </a>
  )
)

BreadcrumbLink.displayName = 'BreadcrumbLink'

export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement>

/** Non-interactive span representing the current page in a breadcrumb trail. */
export const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="link"
      aria-current="page"
      aria-disabled="true"
      className={cn('text-foreground font-medium', className)}
      {...props}
    />
  )
)

BreadcrumbPage.displayName = 'BreadcrumbPage'

export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLSpanElement>

/** Visual separator between breadcrumb items, defaults to a chevron icon. */
export const BreadcrumbSeparator = forwardRef<HTMLSpanElement, BreadcrumbSeparatorProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn('text-muted-foreground', className)}
      {...props}
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </span>
  )
)

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export type BreadcrumbEllipsisProps = HTMLAttributes<HTMLSpanElement>

/** Ellipsis indicator for collapsed breadcrumb items. */
export const BreadcrumbEllipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn('text-muted-foreground', className)}
      {...props}
    >
      ...
    </span>
  )
)

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis'
