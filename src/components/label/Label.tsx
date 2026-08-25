import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Required indicator */
  required?: boolean
  /** Optional text to show */
  optional?: boolean
  /** Description text */
  description?: string
}

/** Form label with optional required/optional indicators and description text. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, optional, description, ...props }, ref) => {
    const locale = useLocale()
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={cn(
            'text-sm leading-none font-medium',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            className
          )}
          {...props}
        >
          {children}
          {required && (
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          )}
          {optional && (
            <span className="text-muted-foreground ml-1 font-normal">{locale.label.optional}</span>
          )}
        </label>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
    )
  }
)

Label.displayName = 'Label'
