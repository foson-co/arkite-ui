import { createContext, forwardRef, useContext, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const DescriptionListContext = createContext<{ divider: boolean }>({
  divider: true,
})

// ---------------------------------------------------------------------------
// DescriptionList
// ---------------------------------------------------------------------------

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  /** Show a bottom border separator between items. @default true */
  divider?: boolean
}

/**
 * A definition list (`<dl>`) for horizontal label-value rows.
 *
 * Use `DescriptionItem` as direct children.
 * When `divider` is `true` (default), a border separates each item.
 */
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, divider = true, children, ...props }, ref) => {
    return (
      <DescriptionListContext.Provider value={{ divider }}>
        <dl ref={ref} className={cn(className)} {...props}>
          {children}
        </dl>
      </DescriptionListContext.Provider>
    )
  }
)

DescriptionList.displayName = 'DescriptionList'

// ---------------------------------------------------------------------------
// DescriptionItem
// ---------------------------------------------------------------------------

export interface DescriptionItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Label displayed on the left side. */
  label: string
  /** Value rendered on the right side. Use `children` for custom rendering. */
  value?: ReactNode
  /** Custom content rendered instead of `value`. */
  children?: ReactNode
}

/**
 * A single label-value row inside a `DescriptionList`.
 *
 * Renders a flex row with the label on the left and the value on the right.
 * When neither `value` nor `children` is provided, a dash placeholder is shown.
 */
export const DescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>(
  ({ className, label, value, children, ...props }, ref) => {
    const { divider } = useContext(DescriptionListContext)
    const content = children ?? value ?? '—'

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-baseline justify-between py-3',
          divider && 'border-border border-b last:border-b-0',
          className
        )}
        {...props}
      >
        <dt className="text-muted-foreground shrink-0 text-sm">{label}</dt>
        <dd className="text-foreground text-right text-sm font-medium">{content}</dd>
      </div>
    )
  }
)

DescriptionItem.displayName = 'DescriptionItem'
