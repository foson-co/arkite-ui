import { forwardRef, useState, useCallback } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Input, type InputProps } from './Input'
import { useLocale } from '../../locale'

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightAddon'> {
  /** Control visibility externally (uncontrolled by default) */
  visible?: boolean
  /** Visibility change callback */
  onVisibleChange?: (visible: boolean) => void
}

/**
 * Password input with a toggle button to show/hide the value.
 *
 * Wraps `<Input>` — all Input props (size, error, leftAddon, etc.) are supported.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ visible: controlledVisible, onVisibleChange, disabled, ...props }, ref) => {
    const locale = useLocale()
    const [internalVisible, setInternalVisible] = useState(false)
    const isControlled = controlledVisible !== undefined
    const visible = isControlled ? controlledVisible : internalVisible

    const toggle = useCallback(() => {
      const next = !visible
      if (!isControlled) setInternalVisible(next)
      onVisibleChange?.(next)
    }, [visible, isControlled, onVisibleChange])

    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        rightAddon={
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            onClick={toggle}
            aria-label={visible ? locale.passwordInput.hide : locale.passwordInput.show}
            className={cn(
              'text-muted-foreground hover:text-foreground pointer-events-auto transition-colors',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
