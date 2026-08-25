import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type InputHTMLAttributes,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useLocale } from '../../locale'

export type TagInputSize = 'sm' | 'md' | 'lg'

export interface TagInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'onChange'
> {
  /** Current tag values */
  value: string[]
  /** Called when tags change */
  onChange: (tags: string[]) => void
  /** Placeholder text shown when no input */
  placeholder?: string
  /** Maximum number of tags allowed */
  max?: number
  /** Maximum character length per tag */
  maxLength?: number
  /** Whether the input is disabled */
  disabled?: boolean
  /** Error state */
  error?: boolean
  /** Error message */
  errorMessage?: string
  /** Input size variant */
  size?: TagInputSize
  /** Additional class name for the container */
  className?: string
  /** Allow duplicate tag values (default false) */
  allowDuplicates?: boolean
}

const containerSizeStyles: Record<TagInputSize, string> = {
  sm: 'min-h-8 px-2 py-1 text-xs gap-1',
  md: 'min-h-10 px-3 py-1.5 text-sm gap-1.5',
  lg: 'min-h-12 px-4 py-2 text-base gap-2',
}

const tagSizeStyles: Record<TagInputSize, string> = {
  sm: 'px-1.5 py-0 text-2xs leading-none',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-0.5 text-sm',
}

const removeBtnSizeStyles: Record<TagInputSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

/** Text input that converts entries into removable tag chips. Press Enter or comma to add, Backspace to remove. */
export const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      max,
      maxLength,
      disabled = false,
      error = false,
      errorMessage,
      size = 'md',
      className,
      allowDuplicates = false,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const [inputValue, setInputValue] = useState('')
    const internalRef = useRef<HTMLInputElement | null>(null)

    const focusInput = useCallback(() => {
      internalRef.current?.focus()
    }, [])

    const addTag = useCallback(
      (raw: string) => {
        const tag = raw.trim()
        if (!tag) return
        if (maxLength && tag.length > maxLength) return
        if (max && value.length >= max) return
        if (!allowDuplicates && value.includes(tag)) return

        onChange([...value, tag])
        setInputValue('')
      },
      [value, onChange, max, maxLength, allowDuplicates]
    )

    const removeTag = useCallback(
      (index: number) => {
        onChange(value.filter((_, i) => i !== index))
        focusInput()
      },
      [value, onChange, focusInput]
    )

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault()
          addTag(inputValue)
        } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
          removeTag(value.length - 1)
        }
      },
      [inputValue, value, addTag, removeTag]
    )

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        // If the user pastes or types a comma, split and add tags
        if (val.includes(',')) {
          const parts = val.split(',')
          // Add all complete segments as tags
          for (let i = 0; i < parts.length - 1; i++) {
            addTag(parts[i])
          }
          // Keep the last segment (after the last comma) as input
          setInputValue(parts[parts.length - 1])
        } else {
          setInputValue(val)
        }
      },
      [addTag]
    )

    const container = (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div
        className={cn(
          'bg-background flex flex-wrap items-center rounded-md border',
          'transition-colors duration-200',
          'has-[:focus-visible]:ring-ring/40 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-offset-0 has-[:focus-visible]:outline-none',
          error ? 'border-destructive has-[:focus-visible]:ring-destructive' : 'border-input',
          disabled && 'cursor-not-allowed',
          containerSizeStyles[size],
          className
        )}
        onClick={focusInput}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className={cn(
              'bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-full font-medium transition-colors',
              disabled && 'cursor-not-allowed',
              tagSizeStyles[size]
            )}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                aria-label={locale.tagInput.remove(tag)}
                className="hover:bg-secondary-foreground/20 focus-visible:ring-ring rounded-full outline-none focus-visible:ring-1"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(index)
                }}
              >
                <X className={removeBtnSizeStyles[size]} />
              </button>
            )}
          </span>
        ))}
        <input
          ref={(node) => {
            internalRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : undefined}
          disabled={disabled}
          className={cn(
            'min-w-[80px] flex-1 bg-transparent outline-none',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-60'
          )}
          {...props}
        />
      </div>
    )

    if (!errorMessage) {
      return container
    }

    return (
      <div>
        {container}
        <p className="text-destructive mt-1.5 text-xs">{errorMessage}</p>
      </div>
    )
  }
)

TagInput.displayName = 'TagInput'
