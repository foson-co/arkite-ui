import { forwardRef, type ReactNode } from 'react'
import { Modal, type ModalSize } from '../modal/Modal'
import { Button } from '../button/Button'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when dialog should close */
  onClose: () => void
  /** Dialog variant */
  variant?: 'default' | 'destructive' | 'warning'
  /** Dialog title */
  title: ReactNode
  /** Dialog description */
  description?: ReactNode
  /** Confirm button label */
  confirmLabel?: string
  /** Cancel button label */
  cancelLabel?: string
  /** Confirm callback */
  onConfirm: () => void
  /** Loading state (disables buttons during async operation) */
  loading?: boolean
  /** Close on escape key (ignored while loading) */
  closeOnEscape?: boolean
  /** Close on backdrop click (ignored while loading) */
  closeOnBackdropClick?: boolean
  /** Modal size */
  size?: ModalSize
  /** Custom icon */
  icon?: ReactNode
  /** Additional class name applied to the dialog content */
  className?: string
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

/** Modal dialog prompting the user to confirm or cancel an action. */
export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      open,
      onClose,
      variant = 'default',
      title,
      description,
      confirmLabel,
      cancelLabel,
      onConfirm,
      loading = false,
      closeOnEscape = true,
      closeOnBackdropClick = true,
      size = 'sm',
      icon,
      className,
    },
    ref
  ) => {
    const locale = useLocale()
    const isDestructive = variant === 'destructive'
    const isWarning = variant === 'warning'
    const hasIcon = variant !== 'default'
    const resolvedConfirmLabel =
      confirmLabel ??
      (isDestructive ? locale.confirmDialog.deleteLabel : locale.confirmDialog.confirmLabel)

    return (
      <Modal
        ref={ref}
        open={open}
        onClose={onClose}
        className={className}
        size={size}
        showCloseButton={false}
        closeOnBackdropClick={closeOnBackdropClick && !loading}
        closeOnEscape={closeOnEscape && !loading}
      >
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          {(icon || hasIcon) && (
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                isDestructive && 'bg-destructive/10 text-destructive',
                isWarning && 'bg-warning/10 text-warning',
                !isDestructive && !isWarning && 'bg-primary/10 text-primary'
              )}
            >
              {icon ?? <WarningIcon className="h-5 w-5" />}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg leading-none font-semibold">{title}</h3>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel ?? locale.confirmDialog.cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {resolvedConfirmLabel}
          </Button>
        </div>
      </Modal>
    )
  }
)

ConfirmDialog.displayName = 'ConfirmDialog'

/* ─── Presets ─── */

export interface DeleteConfirmDialogProps extends Omit<
  ConfirmDialogProps,
  'variant' | 'title' | 'description' | 'confirmLabel'
> {
  /** Item name to display in the dialog (e.g. "this user") */
  itemName?: string
  /** Custom title (overrides preset) */
  title?: ReactNode
  /** Custom description (overrides preset) */
  description?: ReactNode
  /** Custom confirm label (overrides preset) */
  confirmLabel?: string
}

/** Pre-configured destructive ConfirmDialog for delete operations. */
export const DeleteConfirmDialog = forwardRef<HTMLDivElement, DeleteConfirmDialogProps>(
  ({ itemName, title, description, confirmLabel, ...props }, ref) => {
    const locale = useLocale()
    return (
      <ConfirmDialog
        ref={ref}
        variant="destructive"
        title={
          title ??
          locale.confirmDialog.deleteTitle(itemName ?? locale.confirmDialog.deleteFallbackItem)
        }
        description={description ?? locale.confirmDialog.deleteDescription}
        confirmLabel={confirmLabel ?? locale.confirmDialog.deleteLabel}
        {...props}
      />
    )
  }
)

DeleteConfirmDialog.displayName = 'DeleteConfirmDialog'
