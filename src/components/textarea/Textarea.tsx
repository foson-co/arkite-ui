import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type TextareaSize = 'sm' | 'md' | 'lg'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Size variant */
  size?: TextareaSize
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Auto-resize to fit content */
  autoResize?: boolean
}

const sizeStyles: Record<TextareaSize, string> = {
  sm: 'min-h-[60px] px-3 py-1.5 text-xs',
  md: 'min-h-[80px] px-3 py-2 text-sm',
  lg: 'min-h-[120px] px-4 py-3 text-base',
}

/** Multi-line text input with optional auto-resize and error state. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, size = 'md', error = false, errorMessage, autoResize = false, disabled, ...props },
    ref
  ) => {
    const handleInput = autoResize
      ? (e: React.FormEvent<HTMLTextAreaElement>) => {
          const target = e.currentTarget
          target.style.height = 'auto'
          target.style.height = `${target.scrollHeight}px`
        }
      : undefined

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          disabled={disabled}
          onInput={handleInput}
          className={cn(
            'bg-background flex w-full rounded-md border',
            'placeholder:text-muted-foreground',
            'focus-visible:border-primary focus-visible:ring-ring/30 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-200',
            sizeStyles[size],
            autoResize && 'resize-none overflow-hidden',
            error ? 'border-destructive focus-visible:ring-destructive' : 'border-input',
            className
          )}
          {...props}
        />
        {errorMessage && <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
