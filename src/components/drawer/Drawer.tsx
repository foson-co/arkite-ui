import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { X } from 'lucide-react'

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom'
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the drawer is open */
  open: boolean
  /** Callback when drawer should close */
  onClose: () => void
  /** Drawer position */
  position?: DrawerPosition
  /** Drawer size */
  size?: DrawerSize
  /** Drawer title */
  title?: ReactNode
  /** Drawer description */
  description?: ReactNode
  /** Show close button */
  showCloseButton?: boolean
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean
  /** Close on escape key */
  closeOnEscape?: boolean
  /** Footer content */
  footer?: ReactNode
}

const positionStyles: Record<DrawerPosition, string> = {
  left: 'inset-y-0 left-0',
  right: 'inset-y-0 right-0',
  top: 'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
}

const sizeStyles: Record<DrawerPosition, Record<DrawerSize, string>> = {
  left: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[480px]',
    '2xl': 'w-[600px]',
    '3xl': 'w-[720px]',
    '4xl': 'w-[900px]',
    '5xl': 'w-[1024px]',
    '6xl': 'w-[1200px]',
    full: 'w-screen',
  },
  right: {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[480px]',
    '2xl': 'w-[600px]',
    '3xl': 'w-[720px]',
    '4xl': 'w-[900px]',
    '5xl': 'w-[1024px]',
    '6xl': 'w-[1200px]',
    full: 'w-screen',
  },
  top: {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-96',
    '2xl': 'h-[400px]',
    '3xl': 'h-[500px]',
    '4xl': 'h-[600px]',
    '5xl': 'h-[700px]',
    '6xl': 'h-[800px]',
    full: 'h-screen',
  },
  bottom: {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    xl: 'h-96',
    '2xl': 'h-[400px]',
    '3xl': 'h-[500px]',
    '4xl': 'h-[600px]',
    '5xl': 'h-[700px]',
    '6xl': 'h-[800px]',
    full: 'h-screen',
  },
}

const translateStyles: Record<DrawerPosition, { open: string; closed: string }> = {
  left: { open: 'translate-x-0', closed: '-translate-x-full' },
  right: { open: 'translate-x-0', closed: 'translate-x-full' },
  top: { open: 'translate-y-0', closed: '-translate-y-full' },
  bottom: { open: 'translate-y-0', closed: 'translate-y-full' },
}

/**
 * Sliding panel overlay that opens from any edge of the viewport.
 *
 * **In context:** [Detail + Drawer Edit](https://ui.foson.co/storybook/?path=/docs/recipes-detail-drawer-edit--docs)
 */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      position = 'right',
      size = 'md',
      title,
      description,
      showCloseButton = true,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      footer,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const drawerRef = useRef<HTMLDivElement>(null)
    const locale = useLocale()
    const titleId = useId()
    const descriptionId = useId()
    const [isVisible, setIsVisible] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    // Handle mount/unmount with animation
    useEffect(() => {
      if (open) {
        // Mount first, then animate in
        setIsVisible(true) // eslint-disable-line react-hooks/set-state-in-effect -- coordinating mount/animation with DOM
        // Use requestAnimationFrame to ensure DOM is ready before animating
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsAnimating(true)
          })
        })
      } else {
        // Animate out first, then unmount
        setIsAnimating(false)
      }
    }, [open])

    // Handle unmount after animation completes
    const handleTransitionEnd = () => {
      if (!open) {
        setIsVisible(false)
      }
    }

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, closeOnEscape, onClose])

    // Lock body scroll when drawer is open
    useEffect(() => {
      if (open) {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = originalOverflow
        }
      }
    }, [open])

    // Focus trap
    useEffect(() => {
      if (!open || !isVisible) return

      const drawer = drawerRef.current
      if (!drawer) return

      const previouslyFocused = document.activeElement as HTMLElement | null

      const focusableElements = drawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }

      drawer.addEventListener('keydown', handleTab)
      firstElement?.focus()

      return () => {
        drawer.removeEventListener('keydown', handleTab)
        previouslyFocused?.focus?.()
      }
    }, [open, isVisible])

    if (!isVisible) return null

    const drawerContent = (
      <div
        className="fixed inset-0 z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 transition-opacity duration-300 ease-out',
            isAnimating ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeOnBackdropClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          ref={(node) => {
            ;(drawerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          className={cn(
            'bg-card fixed flex flex-col shadow-xl transition-transform duration-300 ease-out',
            positionStyles[position],
            sizeStyles[position][size],
            isAnimating ? translateStyles[position].open : translateStyles[position].closed,
            className
          )}
          onTransitionEnd={handleTransitionEnd}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div className="space-y-1">
                {title && (
                  <h2 id={titleId} className="text-lg leading-none font-semibold">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="text-muted-foreground text-sm">
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground focus:ring-ring shrink-0 rounded-md p-1 focus:ring-2 focus:outline-none"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">{locale.drawer.close}</span>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-auto p-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t p-4">{footer}</div>
          )}
        </div>
      </div>
    )

    return createPortal(drawerContent, document.body)
  }
)

Drawer.displayName = 'Drawer'

// Convenience components for custom layouts
export type DrawerHeaderProps = HTMLAttributes<HTMLDivElement>

/** Header section for a custom Drawer layout. */
export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-shrink-0 border-b p-4', className)} {...props} />
  )
)

DrawerHeader.displayName = 'DrawerHeader'

export type DrawerBodyProps = HTMLAttributes<HTMLDivElement>

/** Scrollable body section for a custom Drawer layout. */
export const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex-1 overflow-y-auto p-4', className)} {...props} />
  )
)

DrawerBody.displayName = 'DrawerBody'

export type DrawerFooterProps = HTMLAttributes<HTMLDivElement>

/** Footer section for a custom Drawer layout with right-aligned actions. */
export const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-shrink-0 items-center justify-end gap-2 border-t p-4', className)}
      {...props}
    />
  )
)

DrawerFooter.displayName = 'DrawerFooter'
