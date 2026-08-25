import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FileUpload } from './FileUpload'

function createFile(name: string, size: number, type: string): File {
  const content = new Array(size).fill('a').join('')
  return new File([content], name, { type })
}

describe('FileUpload', () => {
  it('renders dropzone area', () => {
    render(<FileUpload />)
    expect(screen.getByText('Drop files here or click to upload')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('accepts files via input', async () => {
    const onChange = vi.fn()
    render(<FileUpload onChange={onChange} />)

    const file = createFile('document.pdf', 1024, 'application/pdf')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, file)

    expect(onChange).toHaveBeenCalledWith([file])
  })

  it('rejects files exceeding maxSize', async () => {
    const onChange = vi.fn()
    const onError = vi.fn()
    const maxSize = 1024 // 1 KB

    render(<FileUpload onChange={onChange} onError={onError} maxSize={maxSize} />)

    const largeFile = createFile('big.pdf', 2048, 'application/pdf')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, largeFile)

    expect(onError).toHaveBeenCalledWith(expect.stringContaining('exceeds maximum size'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejects files exceeding maxFiles', async () => {
    const onChange = vi.fn()
    const onError = vi.fn()
    const existingFile = createFile('existing.txt', 100, 'text/plain')

    render(
      <FileUpload
        multiple
        onChange={onChange}
        onError={onError}
        maxFiles={2}
        value={[existingFile]}
      />
    )

    const file1 = createFile('file1.txt', 100, 'text/plain')
    const file2 = createFile('file2.txt', 100, 'text/plain')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, [file1, file2])

    expect(onError).toHaveBeenCalledWith('Maximum 2 files allowed')
    // Should still add files up to the limit (1 more allowed)
    expect(onChange).toHaveBeenCalledWith([existingFile, file1])
  })

  it('disables interaction when disabled', async () => {
    const onChange = vi.fn()
    render(<FileUpload onChange={onChange} disabled />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()

    const dropzone = screen.getByRole('button')
    expect(dropzone.className).toContain('pointer-events-none')
    expect(dropzone.className).toContain('cursor-not-allowed')
  })

  it('shows file list after upload', () => {
    const files = [
      createFile('photo.png', 2048, 'image/png'),
      createFile('readme.txt', 512, 'text/plain'),
    ]

    render(<FileUpload value={files} showFileList />)

    expect(screen.getByText('photo.png')).toBeInTheDocument()
    expect(screen.getByText('readme.txt')).toBeInTheDocument()
    expect(screen.getByText('2 KB')).toBeInTheDocument()
    expect(screen.getByText('512 Bytes')).toBeInTheDocument()
  })

  it('removes a file when remove button is clicked', async () => {
    const onChange = vi.fn()
    const files = [createFile('a.txt', 100, 'text/plain'), createFile('b.txt', 200, 'text/plain')]

    render(<FileUpload value={files} onChange={onChange} showFileList />)

    const removeButtons = screen.getAllByText('Remove')
    await userEvent.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledWith([files[1]])
  })

  it('applies custom className', () => {
    const { container } = render(<FileUpload className="my-custom-class" />)
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('respects accept prop for file types', async () => {
    const onChange = vi.fn()
    const onError = vi.fn()

    render(<FileUpload accept=".pdf" onChange={onChange} onError={onError} />)

    const textFile = createFile('notes.txt', 100, 'text/plain')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    // Fire change event directly to bypass browser-level accept filtering
    // so the component's JS validation logic is exercised
    Object.defineProperty(input, 'files', { value: [textFile], configurable: true })
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(onError).toHaveBeenCalledWith(expect.stringContaining('not an accepted file type'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('accepts files matching the accept prop', async () => {
    const onChange = vi.fn()
    const onError = vi.fn()

    render(<FileUpload accept="image/*" onChange={onChange} onError={onError} />)

    const imageFile = createFile('photo.png', 100, 'image/png')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await userEvent.upload(input, imageFile)

    expect(onError).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith([imageFile])
  })

  it('displays accepted file types text', () => {
    render(<FileUpload accept=".pdf,.doc" />)
    expect(screen.getByText('Accepted: .pdf,.doc')).toBeInTheDocument()
  })
})
