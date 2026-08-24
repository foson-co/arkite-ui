import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'
import { Label } from '../label/Label'

// Form Context
interface FormContextValue {
  disabled?: boolean
}

const FormContext = createContext<FormContextValue>({})

export function useFormContext() {
  return useContext(FormContext)
}

// Form component
export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** Disable all form fields */
  disabled?: boolean
}

/**
 * Form wrapper that provides shared disabled state to all child fields.
 *
 * **In context:** [Form Page](https://ui.foson.co/storybook/?path=/docs/recipes-form-page--docs)
 * · [Detail + Drawer Edit](https://ui.foson.co/storybook/?path=/docs/recipes-detail-drawer-edit--docs)
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, disabled, children, ...props }, ref) => (
    <FormContext.Provider value={{ disabled }}>
      <form ref={ref} className={cn('space-y-6', className)} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  )
)

Form.displayName = 'Form'

// FormField Context
interface FormFieldContextValue {
  id: string
  name?: string
  /** @deprecated use `errorMessage` instead — removed in v1.0 */
  error?: string
  errorMessage?: string
  disabled?: boolean
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)

export function useFormFieldContext() {
  const context = useContext(FormFieldContext)
  if (!context) {
    throw new Error('FormField components must be used within a FormField')
  }
  return context
}

// FormField component
export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Field name */
  name?: string
  /**
   * Field label — renders a `FormLabel` above the control. Equivalent to
   * composing `<FormLabel>` yourself; use composition when you need the
   * label's extra props.
   */
  label?: ReactNode
  /** Required indicator on the built-in `label` */
  required?: boolean
  /** Error message */
  errorMessage?: string
  /** @deprecated use `errorMessage` instead — removed in v1.0 */
  error?: string
  /** Disable field */
  disabled?: boolean
}

/** Form field container that provides id, name, and error context to its children. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { className, name, label, required, errorMessage, error, disabled, children, ...props },
    ref
  ) => {
    const id = useId()
    const formContext = useFormContext()
    const isDisabled = disabled || formContext.disabled

    if (error !== undefined && errorMessage === undefined) {
      warnDeprecated('FormField', 'error', 'errorMessage')
    }
    const resolvedError = errorMessage ?? error

    return (
      <FormFieldContext.Provider
        value={{
          id,
          name,
          error: resolvedError,
          errorMessage: resolvedError,
          disabled: isDisabled,
        }}
      >
        <div ref={ref} className={cn('space-y-2', className)} {...props}>
          {label != null && <FormLabel required={required}>{label}</FormLabel>}
          {children}
        </div>
      </FormFieldContext.Provider>
    )
  }
)

FormField.displayName = 'FormField'

// FormLabel component
export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Required indicator */
  required?: boolean
  /** Optional indicator */
  optional?: boolean
}

/** Label that auto-links to its parent FormField input via context. */
export const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, required, optional, children, ...props }, ref) => {
    const { id, disabled } = useFormFieldContext()

    return (
      <Label
        ref={ref}
        htmlFor={id}
        required={required}
        optional={optional}
        className={cn(disabled && 'opacity-70', className)}
        {...props}
      >
        {children}
      </Label>
    )
  }
)

FormLabel.displayName = 'FormLabel'

// FormControl component - wrapper for form inputs
export type FormControlProps = HTMLAttributes<HTMLDivElement>

/** Wrapper for form input elements within a FormField. Injects field id into the first child element. */
export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, children, ...props }, ref) => {
    const context = useContext(FormFieldContext)
    const id = context?.id

    // Inject id into the first valid element child so label htmlFor connects properly
    const enhancedChildren = id
      ? Children.map(children, (child, index) => {
          if (index === 0 && isValidElement(child)) {
            return cloneElement(child as React.ReactElement<{ id?: string }>, { id })
          }
          return child
        })
      : children

    return (
      <div ref={ref} className={className} {...props}>
        {enhancedChildren}
      </div>
    )
  }
)

FormControl.displayName = 'FormControl'

// FormDescription component
export type FormDescriptionProps = HTMLAttributes<HTMLParagraphElement>

/** Helper text displayed below a form field. */
export const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
)

FormDescription.displayName = 'FormDescription'

// FormMessage component - for error messages
export interface FormMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Error message (overrides context) */
  errorMessage?: string
  /** @deprecated use `errorMessage` instead — removed in v1.0 */
  error?: string
}

/** Validation error message displayed below a form field. */
export const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, errorMessage, error: errorProp, children, ...props }, ref) => {
    const context = useContext(FormFieldContext)

    if (errorProp !== undefined && errorMessage === undefined) {
      warnDeprecated('FormMessage', 'error', 'errorMessage')
    }
    const error = errorMessage ?? errorProp ?? context?.errorMessage

    if (!error && !children) return null

    return (
      <p ref={ref} className={cn('text-destructive text-sm', className)} {...props}>
        {error || children}
      </p>
    )
  }
)

FormMessage.displayName = 'FormMessage'

// FormSection component - for grouping fields
export interface FormSectionProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'title'> {
  /** Section title */
  title?: ReactNode
  /** Section description */
  description?: ReactNode
}

/** Fieldset grouping related form fields under an optional title and description. */
export const FormSection = forwardRef<HTMLFieldSetElement, FormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <fieldset ref={ref} className={cn('space-y-4', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <legend className="text-base font-medium">{title}</legend>}
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      )}
      {children}
    </fieldset>
  )
)

FormSection.displayName = 'FormSection'

// FormActions component - for form buttons
export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Alignment */
  align?: 'left' | 'center' | 'right' | 'between'
}

/** Row of action buttons at the bottom of a form. */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, align = 'right', children, ...props }, ref) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2 pt-4', alignStyles[align], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FormActions.displayName = 'FormActions'
