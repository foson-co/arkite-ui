import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type StackDirection = 'row' | 'column'
export type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Stack direction */
  direction?: StackDirection
  /** Gap between items */
  spacing?: StackSpacing
  /** Align items */
  align?: StackAlign
  /** Justify content */
  justify?: StackJustify
  /** Allow wrapping */
  wrap?: boolean
  /** Full width */
  fullWidth?: boolean
}

const spacingStyles: Record<StackSpacing, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

const alignStyles: Record<StackAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyStyles: Record<StackJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

/** Flexbox layout component for arranging children with consistent spacing. */
export const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = 'column',
      spacing = 'md',
      align = 'stretch',
      justify = 'start',
      wrap = false,
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'row' ? 'flex-row' : 'flex-col',
          spacingStyles[spacing],
          alignStyles[align],
          justifyStyles[justify],
          wrap && 'flex-wrap',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stack.displayName = 'Stack'

// Convenience components
/** Horizontal stack that arranges children in a row. */
export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="row" {...props} />
))

HStack.displayName = 'HStack'

/** Vertical stack that arranges children in a column. */
export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>((props, ref) => (
  <Stack ref={ref} direction="column" {...props} />
))

VStack.displayName = 'VStack'
