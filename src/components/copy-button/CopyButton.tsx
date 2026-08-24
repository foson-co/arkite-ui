import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { ButtonVariant, ButtonSize } from '../button/Button'
import { useLocale } from '../../locale'

/* -------------------------------------------------------------------------- */
/*  Style Records (reused from Button / Input)                                */
/* -------------------------------------------------------------------------- */

const buttonVariantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-secondary hover:text-secondary-foreground',
  ghost: 'hover:bg-secondary hover:text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
  gradient: 'gradient-primary text-white hover:opacity-90 shadow-sm',
  link: 'text-primary underline-offset-4 hover:underline h-auto p-0 rounded-none',
}

const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-md',
  lg: 'h-12 px-6 text-base rounded-lg',
  icon: 'h-10 w-10 rounded-md',
}

type InputSize = 'sm' | 'md' | 'lg'

const inputSizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

const iconSizeMap: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
  icon: 16,
}

/* -------------------------------------------------------------------------- */
/*  useCopyToClipboard                                                        */
/* -------------------------------------------------------------------------- */

function useCopyToClipboard(value: string, feedbackDuration: number, onCopy?: () => void) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopy?.()

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), feedbackDuration)
    } catch {
      // Silently fail – environments without clipboard API (e.g. insecure
      // contexts) will simply not copy.
    }
  }, [value, feedbackDuration, onCopy])

  return { copied, copy }
}

/* -------------------------------------------------------------------------- */
/*  CopyButton                                                                */
/* -------------------------------------------------------------------------- */

export interface CopyButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** The text value to copy to the clipboard. */
  value: string
  /** Callback fired after a successful copy. */
  onCopy?: () => void
  /** Button size. */
  size?: ButtonSize
  /** Button style variant. */
  variant?: ButtonVariant
  /** Duration (ms) the "Copied!" feedback is shown. @default 2000 */
  feedbackDuration?: number
  /** Custom button content. Defaults to "Copy" / "Copied!" text. */
  children?: ReactNode
}

/**
 * A button that copies a given value to the clipboard and shows brief
 * visual feedback (check icon + "Copied!" label).
 *
 * Reuses the same variant / size tokens as the base `Button` component.
 */
export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      value,
      onCopy: onCopyProp,
      size = 'md',
      variant = 'outline',
      feedbackDuration = 2000,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const { copied, copy } = useCopyToClipboard(value, feedbackDuration, onCopyProp)

    const iconSize = iconSizeMap[size]

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        aria-label={copied ? locale.copyButton.copiedAria : locale.copyButton.copyAria}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-medium transition-all duration-200',
          'focus-visible:ring-ring/40 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          buttonVariantStyles[variant],
          buttonSizeStyles[size],
          className
        )}
        onClick={copy}
        {...props}
      >
        {copied ? (
          <>
            <Check size={iconSize} className="shrink-0" />
            {size !== 'icon' && <span>{children ?? locale.copyButton.copied}</span>}
          </>
        ) : (
          <>
            <Copy size={iconSize} className="shrink-0" />
            {size !== 'icon' && <span>{children ?? locale.copyButton.copy}</span>}
          </>
        )}
      </button>
    )
  }
)

CopyButton.displayName = 'CopyButton'

/* -------------------------------------------------------------------------- */
/*  CopyInput                                                                 */
/* -------------------------------------------------------------------------- */

export interface CopyInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value'
> {
  /** The text value displayed in the input and copied to the clipboard. */
  value: string
  /** Callback fired after a successful copy. */
  onCopy?: () => void
  /** Input / button size. */
  size?: InputSize
  /** Duration (ms) the "Copied!" feedback is shown. @default 2000 */
  feedbackDuration?: number
  /** Additional class names applied to the wrapper. */
  className?: string
}

/**
 * A read-only input field with an integrated copy button on the right side.
 *
 * Clicking the copy icon copies the displayed value to the clipboard and
 * briefly swaps the icon to a checkmark.
 */
export const CopyInput = forwardRef<HTMLInputElement, CopyInputProps>(
  (
    { value, onCopy: onCopyProp, size = 'md', feedbackDuration = 2000, className, ...props },
    ref
  ) => {
    const locale = useLocale()
    const { copied, copy } = useCopyToClipboard(value, feedbackDuration, onCopyProp)

    const iconSize = size === 'lg' ? 18 : size === 'sm' ? 14 : 16

    return (
      <div className={cn('relative', className)}>
        <input
          ref={ref}
          type="text"
          value={value}
          readOnly
          aria-label={locale.copyButton.copyValue}
          className={cn(
            'border-input bg-muted flex w-full rounded-md border',
            'text-muted-foreground',
            'focus-visible:ring-ring/40 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
            'cursor-default select-all',
            'transition-colors duration-200',
            inputSizeStyles[size],
            'pr-10'
          )}
          {...props}
        />
        <button
          type="button"
          aria-label={copied ? locale.copyButton.copiedAria : locale.copyButton.copyAria}
          className={cn(
            'absolute inset-y-0 right-0 flex items-center px-3',
            'text-muted-foreground hover:text-foreground',
            'transition-colors duration-200',
            'focus-visible:ring-ring/40 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
            'rounded-r-md'
          )}
          onClick={copy}
        >
          {copied ? (
            <Check size={iconSize} className="text-success shrink-0" />
          ) : (
            <Copy size={iconSize} className="shrink-0" />
          )}
        </button>
      </div>
    )
  }
)

CopyInput.displayName = 'CopyInput'
