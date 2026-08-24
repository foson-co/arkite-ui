import { forwardRef, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { X } from 'lucide-react'
import { useReducedMotion } from './use-reduced-motion'
import type { ModalSize } from '../modal/Modal'

// framer-motion redefines these handlers with its own signatures on motion.div,
// so they are excluded from the passthrough props
type MotionConflictProps = 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'

export interface AnimatedModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | MotionConflictProps
> {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  size?: ModalSize
  showCloseButton?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  footer?: ReactNode
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

/** Modal dialog with framer-motion scale and fade animations. */
export const AnimatedModal = forwardRef<HTMLDivElement, AnimatedModalProps>(
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
      children,
      className,
      ...rest
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null)
    const locale = useLocale()
    const titleId = useId()
    const descriptionId = useId()
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
      if (!open || !closeOnEscape) return
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open, closeOnEscape, onClose])

    useEffect(() => {
      if (open) {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = originalOverflow
        }
      }
    }, [open])

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

    const duration = prefersReducedMotion ? 0 : 0.2

    const modalContent = (
      <AnimatePresence>
        {open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeOnBackdropClick ? onClose : undefined}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              ref={(node) => {
                ;(modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
              }}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'bg-card relative z-50 w-full rounded-lg shadow-xl',
                sizeStyles[size],
                className
              )}
              {...rest}
            >
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
                      <span className="sr-only">{locale.modal.close}</span>
                    </button>
                  )}
                </div>
              )}
              <div className="p-4">{children}</div>
              {footer && (
                <div className="flex items-center justify-end gap-2 border-t p-4">{footer}</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )

    return createPortal(modalContent, document.body)
  }
)

AnimatedModal.displayName = 'AnimatedModal'
