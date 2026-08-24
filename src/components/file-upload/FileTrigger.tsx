import { cloneElement, isValidElement, useRef, type MouseEvent, type ReactElement } from 'react'

export interface FileTriggerProps {
  /** Accepted file types (native `accept` attribute) */
  accept?: string
  /** Allow multiple files */
  multiple?: boolean
  /** Disabled — the trigger renders but clicking does nothing */
  disabled?: boolean
  /** Called with the picked files (empty selection is ignored) */
  onChange: (files: File[]) => void
  /** Exactly one element to use as the trigger — cloned with an `onClick` that opens the picker */
  children: ReactElement<{ onClick?: (e: MouseEvent) => void }>
}

/**
 * Headless file-picker trigger: makes ANY element open the native file dialog,
 * without imposing dropzone or button chrome. Use it when the trigger is a
 * thumbnail, an icon, a menu item — anything `FileUpload` (dropzone) and
 * `FileUploadButton` (styled button) don't fit:
 *
 * ```tsx
 * <FileTrigger accept="image/*" onChange={([file]) => setPhoto(file)}>
 *   <img src={photoUrl} alt="更換照片" className="h-16 w-16 rounded-full" />
 * </FileTrigger>
 * ```
 *
 * The child's own `onClick` still runs first. The child must be focusable
 * itself (button, or `tabIndex`) for keyboard access — FileTrigger adds no
 * wrapper element and no styling.
 */
export function FileTrigger({
  accept,
  multiple = false,
  disabled = false,
  onChange,
  children,
}: FileTriggerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  if (!isValidElement(children)) {
    throw new Error('[arkite-ui] FileTrigger expects exactly one element child.')
  }
  const childOnClick = children.props.onClick

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) onChange(Array.from(files))
          // Same file picked twice must still fire — reset the native value
          e.target.value = ''
        }}
      />
      {cloneElement(children, {
        onClick: (e: MouseEvent) => {
          childOnClick?.(e)
          if (disabled || e.defaultPrevented) return
          inputRef.current?.click()
        },
      })}
    </>
  )
}
