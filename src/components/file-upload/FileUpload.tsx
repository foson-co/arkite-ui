import {
  forwardRef,
  useRef,
  useState,
  type DragEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'
import { Upload, X, File, Image, FileText, FileArchive } from 'lucide-react'
import { useLocale } from '../../locale'

export interface FileUploadProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'onError'
> {
  /** Accepted file types */
  accept?: string
  /** Allow multiple files */
  multiple?: boolean
  /** Max file size in bytes */
  maxSize?: number
  /** Max number of files */
  maxFiles?: number
  /** Uploaded files */
  value?: File[]
  /** On files change */
  onChange?: (files: File[]) => void
  /** On error */
  onError?: (error: string) => void
  /** Disabled state */
  disabled?: boolean
  /** Show file list */
  showFileList?: boolean
  /** Custom dropzone content */
  children?: React.ReactNode
  /** Dropzone class name */
  dropzoneClassName?: string
}

const fileTypeIcons: Record<string, typeof File> = {
  image: Image,
  text: FileText,
  application: FileArchive,
}

function getFileIcon(file: File) {
  const type = file.type.split('/')[0]
  return fileTypeIcons[type] || File
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** Drag-and-drop file upload zone with validation and a file list preview. */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      className,
      accept,
      multiple = false,
      maxSize,
      maxFiles,
      value = [],
      onChange,
      onError,
      disabled = false,
      showFileList = true,
      children,
      dropzoneClassName,
      ...props
    },
    ref
  ) => {
    const locale = useLocale()
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList || disabled) return

      const files = Array.from(fileList)
      let validFiles: File[] = []
      let error: string | null = null

      for (const file of files) {
        // Check file size
        if (maxSize && file.size > maxSize) {
          error = locale.fileUpload.fileTooLarge(file.name, formatFileSize(maxSize))
          continue
        }

        // Check file type
        if (accept) {
          const acceptedTypes = accept.split(',').map((t) => t.trim())
          const isAccepted = acceptedTypes.some((type) => {
            if (type.startsWith('.')) {
              return file.name.toLowerCase().endsWith(type.toLowerCase())
            }
            if (type.endsWith('/*')) {
              return file.type.startsWith(type.replace('/*', '/'))
            }
            return file.type === type
          })

          if (!isAccepted) {
            error = locale.fileUpload.fileNotAccepted(file.name)
            continue
          }
        }

        validFiles.push(file)
      }

      // Check max files
      if (maxFiles) {
        const totalFiles = value.length + validFiles.length
        if (totalFiles > maxFiles) {
          error = locale.fileUpload.tooManyFiles(maxFiles)
          validFiles = validFiles.slice(0, maxFiles - value.length)
        }
      }

      if (error) {
        onError?.(error)
      }

      if (validFiles.length > 0) {
        const newFiles = multiple ? [...value, ...validFiles] : validFiles
        onChange?.(newFiles)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragging(true)
      }
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

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click()
      }
    }

    const handleRemove = (index: number) => {
      const newFiles = value.filter((_, i) => i !== index)
      onChange?.(newFiles)
    }

    return (
      <div className={cn('space-y-4', className)}>
        {/* Hidden input */}
        <input
          ref={(node) => {
            ;(inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          aria-label={locale.fileUpload.uploadFile}
          onChange={(e) => handleFiles(e.target.files)}
          {...props}
        />

        {/* Dropzone */}
        <div
          role="button"
          aria-label={locale.fileUpload.uploadFiles}
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleClick()
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            disabled && 'pointer-events-none cursor-not-allowed',
            dropzoneClassName
          )}
        >
          {children || (
            <>
              <Upload className="text-muted-foreground mb-4 h-10 w-10" />
              <p className="mb-1 text-sm font-medium">{locale.fileUpload.dropzone}</p>
              <p className="text-muted-foreground text-xs">
                {accept ? locale.fileUpload.acceptedTypes(accept) : locale.fileUpload.anyFileType}
                {maxSize && ` \u2022 ${locale.fileUpload.maxSizeNote(formatFileSize(maxSize))}`}
              </p>
            </>
          )}
        </div>

        {/* File list */}
        {showFileList && value.length > 0 && (
          <ul className="space-y-2">
            {value.map((file, index) => {
              const Icon = getFileIcon(file)
              return (
                <li
                  key={`${file.name}-${index}`}
                  className="bg-card flex items-center gap-3 rounded-lg border p-3"
                >
                  <Icon className="text-muted-foreground h-8 w-8 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(index)
                    }}
                    className="text-muted-foreground hover:text-foreground shrink-0 rounded-md p-1"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">{locale.fileUpload.remove}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }
)

FileUpload.displayName = 'FileUpload'

// Compact variant
export interface FileUploadButtonProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Accepted file types */
  accept?: string
  /** Allow multiple files */
  multiple?: boolean
  /** On files change */
  onChange?: (files: File[]) => void
  /** Disabled state */
  disabled?: boolean
}

/** Compact button variant that opens a native file picker on click. */
export const FileUploadButton = forwardRef<HTMLButtonElement, FileUploadButtonProps>(
  (
    { className, accept, multiple = false, onChange, disabled = false, children, ...props },
    ref
  ) => {
    const locale = useLocale()
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
      inputRef.current?.click()
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files) {
        onChange?.(Array.from(files))
      }
    }

    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          aria-label={locale.fileUpload.uploadFile}
          onChange={handleChange}
        />
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            'bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
            'hover:bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            'disabled:pointer-events-none disabled:opacity-50',
            className
          )}
          {...props}
        >
          <Upload className="h-4 w-4" />
          {children || locale.fileUpload.upload}
        </button>
      </>
    )
  }
)

FileUploadButton.displayName = 'FileUploadButton'
