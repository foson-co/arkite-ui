import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../../utils/cn'

export const TooltipProvider = TooltipPrimitive.Provider

export interface TooltipProps extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> {
  children: ReactNode
}

export const Tooltip = TooltipPrimitive.Root

export const TooltipTrigger = TooltipPrimitive.Trigger

export type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>

/** Styled tooltip content panel with enter/exit animations. */
export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, children, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'bg-foreground z-50 overflow-hidden rounded-md px-3 py-1.5',
          'text-background text-xs shadow-md',
          // Animation
          'animate-in fade-in-0 zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
)

TooltipContent.displayName = 'TooltipContent'

/** Convenient wrapper: wraps children with tooltip on hover */
export interface SimpleTooltipProps {
  /** Tooltip text */
  content: ReactNode
  /** Side to show tooltip */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /** Delay before showing (ms) */
  delayDuration?: number
  /** Additional class name applied to the tooltip content */
  className?: string
  children: ReactNode
}

/** Convenient wrapper that adds a tooltip to any child element on hover. */
export function SimpleTooltip({
  content,
  side = 'top',
  delayDuration = 200,
  className,
  children,
}: SimpleTooltipProps) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  )
}
