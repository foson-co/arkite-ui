import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'
import { warnDeprecated } from '../../utils/deprecate'

// --- Command (root) ---

/** Root container for a cmdk-powered command menu. */
export const Command = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'bg-card text-card-foreground flex h-full w-full flex-col overflow-hidden rounded-lg',
      className
    )}
    {...props}
  />
))
Command.displayName = 'Command'

// --- Input ---

/** Search input field for filtering command palette items. */
export const CommandInput = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3">
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className="mr-2 h-4 w-4 shrink-0 opacity-50"
    >
      <path
        d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none',
        'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = 'CommandInput'

// --- List ---

/** Scrollable list container for command palette items. */
export const CommandList = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-x-hidden overflow-y-auto', className)}
    {...props}
  />
))
CommandList.displayName = 'CommandList'

// --- Empty ---

/** Empty state placeholder shown when no command palette results match. */
export const CommandEmpty = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('text-muted-foreground py-6 text-center text-sm', className)}
    {...props}
  />
))
CommandEmpty.displayName = 'CommandEmpty'

// --- Group ---

/** Labeled group of related items within the command palette. */
export const CommandGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'text-foreground overflow-hidden p-1',
      '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5',
      '[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold',
      '[&_[cmdk-group-heading]]:text-muted-foreground',
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = 'CommandGroup'

// --- Separator ---

/** Horizontal divider line between command palette groups. */
export const CommandSeparator = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    role="none"
    className={cn('bg-border -mx-1 h-px', className)}
    {...props}
  />
))
CommandSeparator.displayName = 'CommandSeparator'

// --- Item ---

/** Selectable action item within the command palette. */
export const CommandItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none',
      'data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground',
      'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
      className
    )}
    {...props}
  />
))
CommandItem.displayName = 'CommandItem'

// --- Shortcut ---

/** Displays keyboard shortcut hints alongside a command item. */
export function CommandShortcut({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('ml-auto flex items-center gap-1', className)} {...props}>
      {typeof children === 'string'
        ? children.split('+').map((key, i) => (
            <kbd
              key={i}
              className="border-border bg-muted text-2xs text-muted-foreground inline-flex min-w-5 items-center justify-center rounded border px-1 py-0.5 font-sans leading-none font-medium shadow-xs select-none"
            >
              {key.trim()}
            </kbd>
          ))
        : children}
    </span>
  )
}

// --- Dialog (Cmd+K modal) ---

export interface CommandDialogProps {
  /** Controlled open state */
  open: boolean
  /** Called when the dialog requests to close (Escape, backdrop click) */
  onClose?: () => void
  /** @deprecated use `onClose` instead — removed in v1.0 */
  onOpenChange?: (open: boolean) => void
  /** Close on escape key */
  closeOnEscape?: boolean
  /** Close on backdrop click */
  closeOnBackdropClick?: boolean
  /** Additional class name applied to the dialog content element */
  className?: string
  children: ReactNode
}

/** Modal overlay that wraps a Command component for use as a Cmd+K palette. */
export const CommandDialog = forwardRef<HTMLDivElement, CommandDialogProps>(
  (
    {
      open,
      onClose,
      onOpenChange,
      closeOnEscape = true,
      closeOnBackdropClick = true,
      className,
      children,
    },
    ref
  ) => {
    const locale = useLocale()
    const dialogRef = useRef<HTMLDivElement>(null)
    const requestClose = useCallback(() => {
      if (onClose) {
        onClose()
      } else if (onOpenChange) {
        warnDeprecated('CommandDialog', 'onOpenChange', 'onClose')
        onOpenChange(false)
      }
    }, [onClose, onOpenChange])

    // Close on escape
    useEffect(() => {
      if (!open || !closeOnEscape) return
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          requestClose()
        }
      }
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }, [open, closeOnEscape, requestClose])

    // Focus the search input on open — cmdk's Input doesn't autofocus
    useEffect(() => {
      if (!open) return
      dialogRef.current?.querySelector<HTMLInputElement>('[cmdk-input]')?.focus()
    }, [open])

    if (!open) return null

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- backdrop dismiss handled by Escape key listener */}
        <div
          className="animate-in fade-in-0 fixed inset-0 bg-black/50"
          onClick={closeOnBackdropClick ? requestClose : undefined}
        />
        {/* Dialog */}
        <div
          ref={(node) => {
            ;(dialogRef as React.MutableRefObject<HTMLDivElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          role="dialog"
          aria-label={locale.commandPalette.label}
          className={cn(
            'animate-in fade-in-0 zoom-in-95 fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            className
          )}
        >
          <Command className="rounded-lg border shadow-2xl">{children}</Command>
        </div>
      </div>
    )
  }
)
CommandDialog.displayName = 'CommandDialog'

// --- useCommandPalette hook ---

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen }
}
