import { forwardRef, useRef, useState, type DragEvent } from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'
import { Plus, X, ImageIcon } from 'lucide-react'
import { useLocale } from '../../locale'

export interface ImageUploadProps {
  /** Already-uploaded image URLs */
  value?: string[]
  /** Called when user selects new files to upload */
  onChange?: (files: File[]) => void
  /** Called when user removes an existing image URL */
  onRemove?: (url: string) => void
  /** Maximum number of images (1 = single-image mode) */
  max?: number
  /** Accepted file types (default: "image/*") */
  accept?: string
  /** Max file size in bytes */
  maxSize?: number
  /** Disabled state */
  disabled?: boolean
  /** Show uploading overlay on specific URLs */
  loadingUrls?: string[]
  /**
   * Error state. Passing a string (the message itself) is deprecated —
   * use `errorMessage` instead; string support is removed in v1.0.
   */
  error?: boolean | string
  /** Error message */
  errorMessage?: string
  /** Container class name */
  className?: string
  /** Placeholder text */
  placeholder?: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** Image upload zone with preview grid. Manages URL display and emits File objects for new uploads. */
export const ImageUpload = forwardRef<HTMLInputElement, ImageUploadProps>(
  (
    {
      value = [],
      onChange,
      onRemove,
      max,
      accept = 'image/*',
      maxSize,
      disabled = false,
      loadingUrls = [],
      error,
      errorMessage,
      className,
      placeholder,
    },
    ref
  ) => {
    const locale = useLocale()
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    if (typeof error === 'string' && errorMessage === undefined) {
      warnDeprecated('ImageUpload', 'error', 'errorMessage')
    }
    const resolvedErrorMessage = errorMessage ?? (typeof error === 'string' ? error : undefined)
    const hasError = Boolean(error)

    const isSingle = max === 1
    const isFull = max != null && value.length >= max

    const defaultPlaceholder = isSingle ? locale.fileUpload.uploadImage : locale.fileUpload.addImage

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList || disabled) return

      const files = Array.from(fileList)
      const valid: File[] = []

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue
        if (maxSize && file.size > maxSize) continue
        valid.push(file)
      }

      // Respect max limit
      if (max != null) {
        const remaining = max - value.length
        if (remaining <= 0) return
        onChange?.(valid.slice(0, remaining))
      } else {
        onChange?.(valid)
      }

      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (!disabled && !isFull) setIsDragging(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    }

    const openPicker = () => {
      if (!disabled) inputRef.current?.click()
    }

    // Hidden input
    const hiddenInput = (
      <input
        ref={(node) => {
          ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type="file"
        accept={accept}
        multiple={!isSingle}
        disabled={disabled}
        className="sr-only"
        aria-label={locale.fileUpload.uploadImage}
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="image-upload-input"
      />
    )

    // ── Single image mode ──
    if (isSingle) {
      const url = value[0]

      return (
        <div className={cn('space-y-1', className)}>
          {hiddenInput}
          {url ? (
            <div className="group relative inline-block overflow-hidden rounded-lg border">
              <img src={url} alt={locale.fileUpload.preview} className="h-32 w-32 object-cover" />
              {loadingUrls.includes(url) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {!disabled && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={openPicker}
                    className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-black hover:bg-white"
                  >
                    {locale.fileUpload.replace}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove?.(url)}
                    className="text-destructive rounded-md bg-white/90 px-2 py-1 text-xs font-medium hover:bg-white"
                  >
                    {locale.fileUpload.remove}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openPicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              disabled={disabled}
              className={cn(
                'flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : hasError
                    ? 'border-destructive'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled && 'pointer-events-none opacity-50'
              )}
            >
              <ImageIcon className="text-muted-foreground h-6 w-6" />
              <span className="text-muted-foreground text-xs">
                {placeholder || defaultPlaceholder}
              </span>
              {maxSize && (
                <span className="text-2xs text-muted-foreground">
                  {locale.fileUpload.maxSizeHint(formatFileSize(maxSize))}
                </span>
              )}
            </button>
          )}
          {resolvedErrorMessage && (
            <p className="text-destructive text-xs">{resolvedErrorMessage}</p>
          )}
        </div>
      )
    }

    // ── Multi-image grid mode ──
    return (
      <div className={cn('space-y-1', className)}>
        {hiddenInput}
        <div className="flex flex-wrap gap-3">
          {value.map((url) => (
            <div key={url} className="group relative overflow-hidden rounded-lg border">
              <img src={url} alt={locale.fileUpload.preview} className="h-24 w-24 object-cover" />
              {loadingUrls.includes(url) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove?.(url)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                  aria-label={locale.fileUpload.removeImage}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          {!isFull && (
            <button
              type="button"
              onClick={openPicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              disabled={disabled}
              className={cn(
                'flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : hasError
                    ? 'border-destructive'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled && 'pointer-events-none opacity-50'
              )}
            >
              <Plus className="text-muted-foreground h-5 w-5" />
              <span className="text-2xs text-muted-foreground">
                {placeholder || defaultPlaceholder}
              </span>
            </button>
          )}
        </div>
        {max && (
          <p className="text-muted-foreground text-xs">
            {value.length} / {max}
          </p>
        )}
        {resolvedErrorMessage && <p className="text-destructive text-xs">{resolvedErrorMessage}</p>}
      </div>
    )
  }
)

ImageUpload.displayName = 'ImageUpload'
