import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { Check } from 'lucide-react'

export interface CheckboxCardProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Card title / label */
  label: string
  /** Optional description below the label */
  description?: string
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
}

/**
 * Checkbox presented as a selectable card with label and description.
 *
 * Useful for feature toggles, permission lists, onboarding options, etc.
 */
export const CheckboxCard = forwardRef<HTMLInputElement, CheckboxCardProps>(
  ({ className, label, description, error = false, errorMessage, disabled, id, ...props }, ref) => {
    const stableId = useId()
    const inputId = id || stableId

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'bg-background relative flex items-start gap-3 rounded-lg border p-4',
          'transition-colors duration-200',
          'has-[:checked]:bg-primary/5',
          'has-[:focus-visible]:ring-ring/40 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-offset-0',
          error ? 'border-destructive' : 'border-input has-[:checked]:border-primary',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:border-muted-foreground/50 cursor-pointer',
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          disabled={disabled}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
            'transition-colors duration-200',
            'peer-checked:[&>svg]:opacity-100',
            error
              ? 'border-destructive'
              : 'border-input peer-checked:border-primary peer-checked:bg-primary'
          )}
        >
          <Check className="text-primary-foreground h-3.5 w-3.5 opacity-0 transition-opacity" />
        </div>
        <div className="space-y-1">
          <div className="text-sm leading-none font-medium">{label}</div>
          {description && (
            <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
          )}
          {errorMessage && <p className="text-destructive text-xs">{errorMessage}</p>}
        </div>
      </label>
    )
  }
)

CheckboxCard.displayName = 'CheckboxCard'
