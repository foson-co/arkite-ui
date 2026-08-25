import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export type PageHeaderSize = 'sm' | 'md' | 'lg'

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Page title */
  title: ReactNode
  /** Typography scale — `md` (default) matches the original rendering; `sm` for sub-pages, `lg` for dashboards / detail pages */
  size?: PageHeaderSize
  /** Optional description below the title */
  description?: ReactNode
  /** Actions slot (right side) */
  actions?: ReactNode
  /** Breadcrumb or back link slot (above title) */
  breadcrumb?: ReactNode
  /** Badge or status slot (next to title) */
  badge?: ReactNode
  /** Back button callback — renders a ← button before the title */
  onBack?: () => void
  /** Back button aria-label */
  backLabel?: string
}

function ArrowLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

const sizeStyles: Record<PageHeaderSize, { title: string; description: string }> = {
  sm: { title: 'text-xl', description: 'text-sm' },
  md: { title: 'text-2xl', description: 'text-sm' },
  lg: { title: 'text-3xl', description: 'text-base' },
}

/** Page header with title, description, breadcrumb, and action slots. */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      size = 'md',
      description,
      actions,
      breadcrumb,
      badge,
      onBack,
      backLabel,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  aria-label={backLabel ?? locale.pageHeader.back}
                >
                  <ArrowLeftIcon />
                </button>
              )}
              <h1 className={cn(sizeStyles[size].title, 'font-bold tracking-tight')}>{title}</h1>
              {badge}
            </div>
            {description && (
              <p className={cn(sizeStyles[size].description, 'text-muted-foreground')}>
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    )
  }
)

PageHeader.displayName = 'PageHeader'
