import {
  forwardRef,
  useRef,
  useState,
  type ClipboardEvent,
  type HTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export type PinInputSize = 'sm' | 'md' | 'lg'

export interface PinInputProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  /** Number of characters @default 6 */
  length?: number
  /** Value (controlled) */
  value?: string
  /** Initial value (uncontrolled) */
  defaultValue?: string
  /** Fires with the joined string on every edit */
  onChange?: (value: string) => void
  /** Fires once when all cells are filled */
  onComplete?: (value: string) => void
  /** Accepted characters @default "numeric" */
  type?: 'numeric' | 'alphanumeric'
  /** Mask the entered characters (one-time passwords usually should NOT be masked) */
  masked?: boolean
  /** Cell size @default "md" */
  size?: PinInputSize
  /** Disabled state */
  disabled?: boolean
  /** Error state styling */
  error?: boolean
  /** Focus the first cell on mount */
  autoFocus?: boolean
}

const sizeStyles: Record<PinInputSize, string> = {
  sm: 'h-8 w-8 text-sm rounded-md',
  md: 'h-10 w-10 text-base rounded-md',
  lg: 'h-12 w-12 text-lg rounded-lg',
}

const CHAR_RE = {
  numeric: /[0-9]/,
  alphanumeric: /[0-9a-zA-Z]/,
}

/**
 * One-time-code input (OTP / verification codes): one cell per character with
 * auto-advance, Backspace/arrow navigation, and paste distribution. Numeric
 * mode sets `inputMode="numeric"` and `autocomplete="one-time-code"` so mobile
 * keyboards and SMS autofill behave.
 */
export const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  (
    {
      length = 6,
      value: controlledValue,
      defaultValue = '',
      onChange,
      onComplete,
      type = 'numeric',
      masked = false,
      size = 'md',
      disabled = false,
      error = false,
      autoFocus = false,
      className,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const isControlled = controlledValue !== undefined
    const [uncontrolled, setUncontrolled] = useState(defaultValue.slice(0, length))
    const value = (isControlled ? controlledValue : uncontrolled).slice(0, length)
    const cellRefs = useRef<Array<HTMLInputElement | null>>([])
    const charRe = CHAR_RE[type]

    const commit = (next: string) => {
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
      if (next.length === length && value.length !== length) onComplete?.(next)
    }

    const focusCell = (index: number) => {
      cellRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus()
    }

    const setChar = (index: number, char: string) => {
      const chars = value.split('')
      // Cells beyond the current value stay empty — writes always append at
      // the boundary so the value has no holes
      const target = Math.min(index, value.length)
      chars[target] = char
      commit(chars.join(''))
      focusCell(target + 1)
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (value.length === 0) return
        const target = index < value.length ? index : value.length - 1
        commit(value.slice(0, target) + value.slice(target + 1))
        focusCell(target === index ? index - 1 : target)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        focusCell(index - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        focusCell(index + 1)
      } else if (e.key.length === 1 && charRe.test(e.key)) {
        e.preventDefault()
        setChar(index, e.key)
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault() // reject characters outside the allowed set
      }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData('text')
        .split('')
        .filter((c) => charRe.test(c))
        .slice(0, length)
        .join('')
      if (pasted === '') return
      commit(pasted)
      focusCell(pasted.length)
    }

    return (
      <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el
            }}
            type={masked ? 'password' : 'text'}
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={value[i] ?? ''}
            aria-label={locale.pinInput.charLabel(i + 1, length)}
            disabled={disabled}
            // 這是把元件對外的 `autoFocus` prop 轉給第一格，不是寫死自動聚焦。
            // 要不要自動聚焦由呼叫端決定（OTP 欄位是這個 prop 的主要用途），
            // 元件無權替它拿掉。
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus && i === 0}
            // Editing is fully handled in onKeyDown/onPaste; the controlled
            // value silences the React warning
            onChange={() => {}}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              'border-input bg-background border text-center font-medium transition-colors',
              'focus:ring-ring/40 focus:border-ring focus:ring-1 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/40',
              sizeStyles[size]
            )}
          />
        ))}
      </div>
    )
  }
)

PinInput.displayName = 'PinInput'
