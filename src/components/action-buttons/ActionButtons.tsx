import {
  Fragment,
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'
import { cn } from '../../utils/cn'
import { Button, type ButtonVariant } from '../button/Button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../dropdown-menu/DropdownMenu'
import { ConfirmDialog } from '../confirm-dialog/ConfirmDialog'
import { useLocale } from '../../locale'

export interface ActionItem {
  /** Action key (for React key) */
  key?: string
  /** Display label */
  label: string
  /** Icon */
  icon?: ReactNode
  /** Button variant (inline mode) / destructive styling (dropdown mode) */
  variant?: ButtonVariant
  /** Show confirmation dialog before executing */
  confirm?:
    | boolean
    | {
        title?: string
        description?: string
        confirmLabel?: string
      }
  /** Click handler */
  onClick: () => void | Promise<void>
  /** Disabled state */
  disabled?: boolean
  /** Hide this action */
  hidden?: boolean
  /** Separator before this item (dropdown mode only) */
  separator?: boolean
}

export interface ActionButtonsProps extends HTMLAttributes<HTMLElement> {
  /** Action definitions */
  actions: ActionItem[]
  /** Display mode */
  mode?: 'inline' | 'dropdown'
  /** Dropdown trigger label */
  triggerLabel?: string
  /** Dropdown trigger icon (overrides label) */
  triggerIcon?: ReactNode
  /** Button size for inline mode */
  size?: 'sm' | 'md'
  /** Additional class name */
  className?: string
}

function MoreHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className={className}>
      <path
        d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Renders a list of actions as inline buttons or a dropdown menu with optional confirmation dialogs. */
export const ActionButtons = forwardRef<HTMLElement, ActionButtonsProps>(function ActionButtons(
  { actions, mode = 'dropdown', triggerLabel, triggerIcon, size = 'sm', className, ...rest },
  ref
) {
  const locale = useLocale()
  const [confirmAction, setConfirmAction] = useState<ActionItem | null>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const visibleActions = actions.filter((a) => !a.hidden)

  const handleConfirm = async () => {
    if (!confirmAction) return
    setConfirmLoading(true)
    try {
      await confirmAction.onClick()
    } finally {
      setConfirmLoading(false)
      setConfirmAction(null)
    }
  }

  const handleAction = (action: ActionItem) => {
    if (action.confirm) {
      setConfirmAction(action)
    } else {
      action.onClick()
    }
  }

  const confirmConfig = confirmAction?.confirm
  const confirmTitle = typeof confirmConfig === 'object' ? confirmConfig.title : undefined
  const confirmDescription =
    typeof confirmConfig === 'object' ? confirmConfig.description : undefined
  const confirmLabel = typeof confirmConfig === 'object' ? confirmConfig.confirmLabel : undefined
  const isDestructiveAction = confirmAction?.variant === 'destructive'

  const dialog = (
    <ConfirmDialog
      open={!!confirmAction}
      onClose={() => setConfirmAction(null)}
      variant={isDestructiveAction ? 'destructive' : 'default'}
      title={confirmTitle ?? locale.confirmDialog.confirmTitle}
      description={confirmDescription ?? locale.confirmDialog.confirmDescription}
      confirmLabel={confirmLabel}
      onConfirm={handleConfirm}
      loading={confirmLoading}
    />
  )

  if (mode === 'inline') {
    return (
      <>
        <div
          ref={ref as Ref<HTMLDivElement>}
          className={cn('flex items-center gap-1', className)}
          {...rest}
        >
          {visibleActions.map((action, index) => (
            <Button
              key={action.key ?? index}
              variant={action.variant ?? 'ghost'}
              size={size === 'sm' ? 'icon' : 'sm'}
              onClick={() => handleAction(action)}
              disabled={action.disabled}
              className={size === 'sm' ? 'h-8 w-8' : undefined}
              title={action.label}
            >
              {action.icon ?? action.label}
            </Button>
          ))}
        </div>
        {dialog}
      </>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref as Ref<HTMLButtonElement>}
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', className)}
            {...rest}
          >
            {triggerIcon ?? <MoreHorizontalIcon className="h-4 w-4" />}
            {triggerLabel && <span className="sr-only">{triggerLabel}</span>}
            {!triggerLabel && <span className="sr-only">{locale.actionButtons.label}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {visibleActions.map((action, index) => (
            <Fragment key={action.key ?? index}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => handleAction(action)}
                disabled={action.disabled}
                destructive={action.variant === 'destructive'}
              >
                {action.icon && <span className="mr-2 h-4 w-4 shrink-0">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {dialog}
    </>
  )
})
