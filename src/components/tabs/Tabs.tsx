import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'

export type TabsVariant = 'default' | 'pills' | 'underline'
export type TabsSize = 'sm' | 'md' | 'lg'
export type TabsOrientation = 'horizontal' | 'vertical'

interface TabsContextValue {
  value: string
  onChange: (value: string) => void
  variant: TabsVariant
  size: TabsSize
  orientation: TabsOrientation
  /** Unique prefix so tab/panel ids stay unique across multiple Tabs instances */
  idPrefix: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Currently active tab value */
  value?: string
  /** Default active tab (uncontrolled) */
  defaultValue?: string
  /** Callback when tab changes */
  onChange?: (value: string) => void
  /** @deprecated use `onChange` instead — removed in v1.0 */
  onValueChange?: (value: string) => void
  /** Tab style variant */
  variant?: TabsVariant
  /** Tab size */
  size?: TabsSize
  /**
   * Layout axis of the tab strip. `'vertical'` stacks the triggers down the
   * side — the standard shape when vertical space is scarce (landscape phones)
   * and the content panel should scroll on its own.
   *
   * This is not just layout: it moves the `underline` variant's active rule to
   * the inline edge, sets `aria-orientation` on the tablist, and switches
   * keyboard navigation to the up/down axis. A `className`-only vertical strip
   * gets none of those.
   *
   * @default 'horizontal'
   */
  orientation?: TabsOrientation
}

/** Tabbed navigation container supporting default, pill, and underline variants. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      onChange,
      onValueChange,
      variant = 'default',
      size = 'md',
      orientation = 'horizontal',
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '')
    const idPrefix = useId()

    const value = controlledValue ?? uncontrolledValue
    const handleChange = (newValue: string) => {
      setUncontrolledValue(newValue)
      if (onChange) {
        onChange(newValue)
      } else if (onValueChange) {
        warnDeprecated('Tabs', 'onValueChange', 'onChange')
        onValueChange(newValue)
      }
    }

    return (
      <TabsContext.Provider
        value={{ value, onChange: handleChange, variant, size, orientation, idPrefix }}
      >
        <div
          ref={ref}
          className={cn('w-full', orientation === 'vertical' && 'flex gap-4', className)}
          data-orientation={orientation}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

export type TabsListProps = HTMLAttributes<HTMLDivElement>

const listVariantStyles: Record<TabsVariant, Record<TabsOrientation, string>> = {
  default: {
    horizontal: 'bg-muted rounded-lg p-1',
    vertical: 'bg-muted rounded-lg p-1',
  },
  pills: {
    horizontal: 'gap-1',
    vertical: 'gap-1',
  },
  underline: {
    // The rule the active trigger sits on moves to the inline edge when the
    // strip runs vertically — a bottom border would leave the indicator
    // pointing across the reading direction instead of at the panel.
    horizontal: 'border-b gap-4',
    vertical: 'border-e gap-1',
  },
}

/** Container for tab trigger buttons. */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => {
    const { variant, orientation } = useTabsContext()
    const isVertical = orientation === 'vertical'

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        data-orientation={orientation}
        className={cn(
          'inline-flex',
          isVertical ? 'flex-col items-stretch self-start' : 'items-center',
          listVariantStyles[variant][orientation],
          className
        )}
        {...props}
      />
    )
  }
)

TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Tab value */
  value: string
  /** Disabled state */
  disabled?: boolean
  /** Icon to show before label */
  icon?: ReactNode
}

const triggerSizeStyles: Record<TabsSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

const triggerVariantStyles: Record<
  TabsVariant,
  Record<TabsOrientation, { base: string; active: string }>
> = {
  default: {
    horizontal: {
      base: 'rounded-md text-muted-foreground hover:text-foreground',
      active: 'bg-background text-foreground shadow-sm',
    },
    vertical: {
      base: 'rounded-md text-muted-foreground hover:text-foreground',
      active: 'bg-background text-foreground shadow-sm',
    },
  },
  pills: {
    horizontal: {
      base: 'rounded-full text-muted-foreground hover:text-foreground hover:bg-muted',
      active: 'bg-primary text-primary-foreground',
    },
    vertical: {
      base: 'rounded-full text-muted-foreground hover:text-foreground hover:bg-muted',
      active: 'bg-primary text-primary-foreground',
    },
  },
  underline: {
    horizontal: {
      base: 'text-muted-foreground hover:text-foreground border-b-2 border-transparent -mb-px',
      active: 'text-foreground border-primary',
    },
    vertical: {
      base: 'text-muted-foreground hover:text-foreground border-e-2 border-transparent -me-px',
      active: 'text-foreground border-primary',
    },
  },
}

/** Arrow keys move along the strip's own axis; Home/End jump to the ends. */
function moveFocus(event: ReactKeyboardEvent<HTMLButtonElement>, orientation: TabsOrientation) {
  const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  if (
    event.key !== nextKey &&
    event.key !== prevKey &&
    event.key !== 'Home' &&
    event.key !== 'End'
  ) {
    return
  }

  const list = event.currentTarget.closest('[role="tablist"]')
  if (!list) return
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'))
  if (tabs.length === 0) return

  const current = tabs.indexOf(event.currentTarget)
  const last = tabs.length - 1
  let next: number
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  else if (event.key === nextKey) next = current === last ? 0 : current + 1
  else next = current === 0 ? last : current - 1

  event.preventDefault()
  // Activation follows focus (the ARIA tabs pattern's automatic mode): the
  // click handler is what commits the value, so reuse it rather than
  // duplicating the state update here.
  tabs[next].focus()
  tabs[next].click()
}

/** Clickable tab button that activates its associated content panel. */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, disabled, icon, children, onKeyDown, ...props }, ref) => {
    const {
      value: selectedValue,
      onChange,
      variant,
      size,
      orientation,
      idPrefix,
    } = useTabsContext()
    const isActive = selectedValue === value
    const styles = triggerVariantStyles[variant][orientation]

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${idPrefix}tab-${value}`}
        aria-selected={isActive}
        aria-controls={`${idPrefix}tabpanel-${value}`}
        // Roving tabindex: Tab enters the strip at the active tab, then the
        // arrow keys move within it — one stop for the whole tablist.
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        onClick={() => onChange(value)}
        className={cn(
          'inline-flex items-center gap-2 font-medium transition-all',
          orientation === 'vertical' ? 'justify-start text-start' : 'justify-center',
          'focus-visible:ring-ring/40 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          triggerSizeStyles[size],
          styles.base,
          isActive && styles.active,
          className
        )}
        {...props}
        onKeyDown={(e) => {
          moveFocus(e, orientation)
          onKeyDown?.(e)
        }}
      >
        {icon}
        {children}
      </button>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Tab value */
  value: string
  /** Force render even when not active */
  forceMount?: boolean
}

/** Panel that displays content for the currently active tab. */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const { value: selectedValue, orientation, idPrefix } = useTabsContext()
    const isActive = selectedValue === value

    if (!forceMount && !isActive) return null

    return (
      <div
        ref={ref}
        id={`${idPrefix}tabpanel-${value}`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}tab-${value}`}
        tabIndex={0}
        hidden={!isActive}
        className={cn(
          // Horizontal: the panel sits under the strip. Vertical: it sits
          // beside it and the Tabs root's flex gap already separates them, so
          // a top margin would only knock it out of line with the first tab.
          orientation === 'vertical' ? 'min-w-0 flex-1' : 'mt-2',
          'focus-visible:ring-ring/40 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsContent.displayName = 'TabsContent'
