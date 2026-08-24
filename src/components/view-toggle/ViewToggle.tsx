import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export type ViewMode = 'table' | 'card'

export interface ViewToggleProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Current view mode (controlled) */
  value?: ViewMode
  /** Initial view mode for uncontrolled usage */
  defaultValue?: ViewMode
  /** View change callback */
  onChange?: (mode: ViewMode) => void
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional class name */
  className?: string
}

interface ViewOption {
  mode: ViewMode
  icon: ReactNode
  label: string
}

const sizeStyles = {
  sm: { wrapper: 'h-8', button: 'h-6 w-6', icon: 'h-3.5 w-3.5' },
  md: { wrapper: 'h-9', button: 'h-7 w-7', icon: 'h-4 w-4' },
}

/** Toggle between table and card view layouts. */
export const ViewToggle = forwardRef<HTMLDivElement, ViewToggleProps>(
  ({ value, defaultValue, onChange, size = 'md', className, ...rest }, ref) => {
    const locale = useLocale()
    const styles = sizeStyles[size]
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue)
    const currentValue = isControlled ? value : internalValue

    const options: ViewOption[] = [
      {
        mode: 'table',
        icon: <LayoutList className={styles.icon} />,
        label: locale.viewToggle.tableView,
      },
      {
        mode: 'card',
        icon: <LayoutGrid className={styles.icon} />,
        label: locale.viewToggle.cardView,
      },
    ]

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={locale.viewToggle.label}
        className={cn(
          'border-input bg-background inline-flex items-center gap-1 rounded-md border p-1',
          styles.wrapper,
          className
        )}
        {...rest}
      >
        {options.map(({ mode, icon, label }) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={currentValue === mode}
            aria-label={label}
            onClick={() => {
              if (!isControlled) setInternalValue(mode)
              onChange?.(mode)
            }}
            className={cn(
              'inline-flex items-center justify-center rounded-sm transition-colors',
              styles.button,
              currentValue === mode
                ? 'bg-secondary text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {icon}
          </button>
        ))}
      </div>
    )
  }
)

ViewToggle.displayName = 'ViewToggle'
