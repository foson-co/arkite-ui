import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '../../utils/cn'

export interface PopoverProps extends ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  children: ReactNode
}

export const Popover = PopoverPrimitive.Root

export const PopoverTrigger = PopoverPrimitive.Trigger

export const PopoverAnchor = PopoverPrimitive.Anchor

export const PopoverClose = PopoverPrimitive.Close

export interface PopoverContentProps extends ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {
  /** Show arrow pointing to trigger */
  showArrow?: boolean
}

/** Positioned popover content panel with optional arrow indicator. */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'center', sideOffset = 4, showArrow = false, children, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-card text-card-foreground z-50 w-72 rounded-lg border p-4 shadow-lg outline-none',
          // Animation
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      >
        {children}
        {showArrow && <PopoverPrimitive.Arrow className="fill-card stroke-border stroke-[1.5px]" />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
)

PopoverContent.displayName = 'PopoverContent'
