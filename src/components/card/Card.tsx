import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { cn } from '../../utils/cn'

export type CardDensity = 'default' | 'compact'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card padding */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Card shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  /** Hover effect */
  hoverable?: boolean
  /** Card border */
  bordered?: boolean
  /**
   * Whole-card clickable: with `onClick` present, adds button semantics
   * (`role="button"`, `tabIndex`, Enter/Space activation) plus hover/focus
   * styling. Stays a `<div>` so the card can contain its own interactive
   * children — Enter/Space only activates when the card itself is focused.
   * This is the supported alternative to wrapping a card in a raw `<button>`.
   */
  interactive?: boolean
  /** Content density — `compact` tightens header/content/footer padding and typography for dashboard widgets. Inherited by CardHeader/CardContent/CardFooter. */
  density?: CardDensity
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Header title */
  title?: ReactNode
  /** Header description */
  description?: ReactNode
  /** Header action (button, etc.) */
  action?: ReactNode
  /** Right-aligned row of actions (e.g. multiple icon buttons) */
  actions?: ReactNode
  /** Density override — defaults to the parent Card's `density` */
  density?: CardDensity
  /**
   * Heading level of the `title` element (visual style is unchanged).
   * Defaults to 3; set to match the document outline — e.g. `2` when the
   * card sits directly under a PageHeader's `h1`.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Density override — defaults to the parent Card's `density` */
  density?: CardDensity
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Density override — defaults to the parent Card's `density` */
  density?: CardDensity
}

const CardDensityContext = createContext<CardDensity>('default')

/**
 * Lets descendants know they are inside a Card's surface. `DataTable` uses it
 * to warn about double-border nesting — reading React context rather than
 * inspecting parent DOM nodes, which would be slower and wrong under portals.
 */
export const CardSurfaceContext = createContext(false)

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

/** Styled container surface with configurable padding, shadow, and hover effects. */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      padding = 'none',
      shadow = 'sm',
      hoverable = false,
      bordered = true,
      interactive = false,
      density = 'default',
      children,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive && onClick != null
    return (
      <CardDensityContext.Provider value={density}>
        <CardSurfaceContext.Provider value={true}>
          {/* role / tabIndex / Enter-Space 三者是跟著 isInteractive 一起上的，
              規則看不出這個連動（它只看到 onClick 掛在 div 上）。
              ⚠️ 已知缺口，非本次 lint 整理的範圍：只傳 onClick 而不傳
              `interactive` 時，點擊仍會觸發但沒有鍵盤路徑。那個組合沒有文件、
              沒有測試（prop 說明寫的是「with onClick present, adds button
              semantics」），要不要收斂成「無 interactive 就不掛 onClick」是
              公開 API 的行為決定，應另案處理。 */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            ref={ref}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onClick={onClick}
            onKeyDown={
              isInteractive
                ? (e) => {
                    onKeyDown?.(e)
                    // Only when the card itself is focused — Enter/Space on
                    // inner interactive children must not double-activate.
                    if (e.target !== e.currentTarget || e.defaultPrevented) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onClick?.(e as unknown as MouseEvent<HTMLDivElement>)
                    }
                  }
                : onKeyDown
            }
            className={cn(
              'bg-card text-card-foreground rounded-lg',
              bordered && 'border',
              paddingStyles[padding],
              shadowStyles[shadow],
              hoverable && 'cursor-pointer transition-shadow hover:shadow-md',
              isInteractive &&
                'focus-visible:ring-ring/40 cursor-pointer transition-shadow hover:shadow-md focus-visible:ring-1 focus-visible:outline-none',
              className
            )}
            {...props}
          >
            {children}
          </div>
        </CardSurfaceContext.Provider>
      </CardDensityContext.Provider>
    )
  }
)

Card.displayName = 'Card'

/** Card header section with title, description, and optional action slots. */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      className,
      title,
      description,
      action,
      actions,
      density,
      headingLevel = 3,
      children,
      ...props
    },
    ref
  ) => {
    const contextDensity = useContext(CardDensityContext)
    const compact = (density ?? contextDensity) === 'compact'
    const Heading = `h${headingLevel}` as const
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          compact ? 'px-4 py-3' : 'p-4',
          className
        )}
        {...props}
      >
        <div className={compact ? 'min-w-0 space-y-1' : 'space-y-1.5'}>
          {title && (
            <Heading
              className={cn(
                'leading-none font-semibold tracking-tight',
                compact ? 'text-sm' : 'text-lg'
              )}
            >
              {title}
            </Heading>
          )}
          {description && (
            <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>
              {description}
            </p>
          )}
          {children}
        </div>
        {action && <div className="shrink-0">{action}</div>}
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

/** Main body section of a Card. */
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, density, ...props }, ref) => {
    const contextDensity = useContext(CardDensityContext)
    const compact = (density ?? contextDensity) === 'compact'
    return (
      <div
        ref={ref}
        className={cn(
          // `pt-0` only when something sits above (CardHeader, another section):
          // as the Card's first child it must keep its own top padding, or the
          // content sits flush against the top border while the other three
          // sides stay inset — asymmetric and immediately visible.
          compact ? 'px-4 py-3' : 'p-4',
          '[&:not(:first-child)]:pt-0',
          className
        )}
        {...props}
      />
    )
  }
)

CardContent.displayName = 'CardContent'

/** Bottom section of a Card, typically used for actions or metadata. */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, density, ...props }, ref) => {
    const contextDensity = useContext(CardDensityContext)
    const compact = (density ?? contextDensity) === 'compact'
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          // Same first-child rule as CardContent — a footer-only Card keeps its
          // top padding instead of collapsing onto the border.
          compact ? 'px-4 py-3' : 'p-4',
          '[&:not(:first-child)]:pt-0',
          className
        )}
        {...props}
      />
    )
  }
)

CardFooter.displayName = 'CardFooter'
