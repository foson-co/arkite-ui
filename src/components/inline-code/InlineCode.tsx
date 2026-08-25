import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface InlineCodeProps extends HTMLAttributes<HTMLElement> {
  /** Render as a different element (e.g. "span"). @default "code" */
  as?: 'code' | 'span'
}

/**
 * Styled inline code snippet for displaying IDs, keys, short values, etc.
 */
export const InlineCode = forwardRef<HTMLElement, InlineCodeProps>(
  ({ className, as: Tag = 'code', ...props }, ref) => (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={cn('bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-xs', className)}
      {...props}
    />
  )
)

InlineCode.displayName = 'InlineCode'
