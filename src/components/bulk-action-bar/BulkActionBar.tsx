import { forwardRef, type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export interface BulkActionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Number of selected items */
  selectedCount: number
  /** Left slot — typically displays selection count */
  left?: ReactNode
  /** Center slot — action buttons */
  children?: ReactNode
  /** Right slot — typically a close/deselect button */
  right?: ReactNode
  /** Called when close/deselect is clicked */
  onClose?: () => void
}

/**
 * Floating overlay bar that appears at the bottom of the viewport
 * when rows are selected. Provides left / center / right slots
 * for count display, bulk actions, and close.
 *
 * Renders nothing when `selectedCount` is 0.
 *
 * **In context:** [CRUD List Page](https://ui.foson.co/storybook/?path=/docs/recipes-crud-list-page--docs)
 *
 * @example
 * ```tsx
 * <BulkActionBar
 *   selectedCount={selected.size}
 *   onClose={() => setSelected(new Set())}
 * >
 *   <Button size="sm" variant="secondary">Export</Button>
 *   <Button size="sm" variant="destructive">Delete</Button>
 * </BulkActionBar>
 * ```
 */
export const BulkActionBar = forwardRef<HTMLDivElement, BulkActionBarProps>(
  ({ className, selectedCount, left, children, right, onClose, ...props }, ref) => {
    const locale = useLocale()
    if (selectedCount <= 0) return null

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label={locale.bulkActionBar.selected(selectedCount)}
        className={cn(
          'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
          'flex items-center gap-4 rounded-lg border bg-card px-4 py-3 shadow-lg',
          'animate-in fade-in slide-in-from-bottom-4 duration-200',
          className
        )}
        {...props}
      >
        {/* Left: selection count */}
        <div className="flex items-center gap-2 text-sm font-medium whitespace-nowrap">
          {left ?? (
            <span>{locale.bulkActionBar.selected(selectedCount)}</span>
          )}
        </div>

        {/* Center: action buttons */}
        {children && (
          <div className="flex items-center gap-2 border-l pl-4">
            {children}
          </div>
        )}

        {/* Right: close / deselect */}
        <div className="flex items-center border-l pl-4">
          {right ?? (
            onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                aria-label={locale.bulkActionBar.deselectAll}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )
          )}
        </div>
      </div>
    )
  }
)

BulkActionBar.displayName = 'BulkActionBar'
