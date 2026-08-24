import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type FormEventHandler,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { X } from 'lucide-react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onSubmit'> {
  /** Whether the modal is open */
  open: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal title */
  title?: ReactNode
  /** Modal description */
  description?: ReactNode
  /** Modal size */
  size?: ModalSize
  /** Show close button */
  showCloseButton?: boolean
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean
  /** Close on escape key */
  closeOnEscape?: boolean
  /** Footer content */
  footer?: ReactNode
  /**
   * Form dialogs: wraps header/body/footer in a `<form>` and fires on submit,
   * so a `type="submit"` button in `footer` submits the fields in `children`
   * without `form="<id>"` attribute plumbing. Call `e.preventDefault()`
   * yourself (or use a server action) as with any React form.
   */
  onSubmit?: FormEventHandler<HTMLFormElement>
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
}

/** Modal dialog overlay with title, description, and action footer. */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      size = 'md',
      showCloseButton = true,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      footer,
      onSubmit,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const locale = useLocale()
    const titleId = useId()
    const descriptionId = useId()

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

    // Lock body scroll when modal is open
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
      if (!open) return

      const modal = modalRef.current
      if (!modal) return

      const previouslyFocused = document.activeElement as HTMLElement | null

      const focusableElements = modal.querySelectorAll(
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

      modal.addEventListener('keydown', handleTab)
      firstElement?.focus()

      return () => {
        modal.removeEventListener('keydown', handleTab)
        previouslyFocused?.focus?.()
      }
    }, [open])

    if (!open) return null

    const modalContent = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeOnBackdropClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={(node) => {
            ;(modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          className={cn(
            'bg-card relative z-50 flex w-full flex-col rounded-lg shadow-xl',
            // Hard height cap: without it, long content grows past the
            // viewport while the body scroll-lock makes the page unscrollable
            'max-h-[calc(100vh-2rem)]',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            sizeStyles[size],
            className
          )}
          {...props}
        >
          <PanelLayout onSubmit={onSubmit}>
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex shrink-0 items-start justify-between gap-4 border-b p-4">
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
                    <span className="sr-only">{locale.modal.close}</span>
                  </button>
                )}
              </div>
            )}

            {/* Body — scrolls when the panel hits its height cap */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-t p-4">
                {footer}
              </div>
            )}
          </PanelLayout>
        </div>
      </div>
    )

    return createPortal(modalContent, document.body)
  }
)

Modal.displayName = 'Modal'

/**
 * With `onSubmit` the header/body/footer are wrapped in a real `<form>`, so a
 * `type="submit"` button in `footer` submits the fields in `children` — no
 * `form="<id>"` attribute plumbing needed for the most common admin dialog.
 */
function PanelLayout({
  onSubmit,
  children,
}: {
  onSubmit?: FormEventHandler<HTMLFormElement>
  children: ReactNode
}) {
  if (!onSubmit) return <>{children}</>
  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
      {children}
    </form>
  )
}

// Convenience components
export type ModalHeaderProps = HTMLAttributes<HTMLDivElement>

/** Header section for a modal with border separator. */
export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('border-b p-4', className)} {...props} />
  )
)

ModalHeader.displayName = 'ModalHeader'

export type ModalBodyProps = HTMLAttributes<HTMLDivElement>

/** Body content area of a modal. */
export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-4', className)} {...props} />
)

ModalBody.displayName = 'ModalBody'

export type ModalFooterProps = HTMLAttributes<HTMLDivElement>

/** Footer section of a modal, typically used for action buttons. */
export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 border-t p-4', className)}
      {...props}
    />
  )
)

ModalFooter.displayName = 'ModalFooter'
