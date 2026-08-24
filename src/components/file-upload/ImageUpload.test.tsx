import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ImageUpload } from './ImageUpload'

function createImageFile(name = 'photo.png', size = 1024) {
  const file = new File(['x'.repeat(size)], name, { type: 'image/png' })
  return file
}

describe('ImageUpload', () => {
  // ── Single image mode ──

  it('renders empty single-image placeholder', () => {
    render(<ImageUpload max={1} />)
    expect(screen.getByText('Upload image')).toBeInTheDocument()
  })

  it('renders custom placeholder', () => {
    render(<ImageUpload max={1} placeholder="Add photo" />)
    expect(screen.getByText('Add photo')).toBeInTheDocument()
  })

  it('shows image preview when value has a URL', () => {
    render(<ImageUpload max={1} value={['https://example.com/img.jpg']} />)
    const img = screen.getByAltText('Preview')
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg')
  })

  it('shows Replace and Remove buttons on hover (single)', () => {
    render(<ImageUpload max={1} value={['https://example.com/img.jpg']} />)
    expect(screen.getByText('Replace')).toBeInTheDocument()
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('calls onRemove when Remove is clicked (single)', async () => {
    const onRemove = vi.fn()
    render(<ImageUpload max={1} value={['https://example.com/img.jpg']} onRemove={onRemove} />)
    await userEvent.click(screen.getByText('Remove'))
    expect(onRemove).toHaveBeenCalledWith('https://example.com/img.jpg')
  })

  it('calls onChange when file is selected (single)', async () => {
    const onChange = vi.fn()
    render(<ImageUpload max={1} onChange={onChange} />)
    const input = screen.getByTestId('image-upload-input')
    const file = createImageFile()
    await userEvent.upload(input, file)
    expect(onChange).toHaveBeenCalledWith([file])
  })

  it('does not show hover buttons when disabled (single)', () => {
    render(<ImageUpload max={1} value={['https://example.com/img.jpg']} disabled />)
    expect(screen.queryByText('Replace')).not.toBeInTheDocument()
    expect(screen.queryByText('Remove')).not.toBeInTheDocument()
  })

  // ── Multi-image mode ──

  it('renders add button in multi mode', () => {
    render(<ImageUpload max={5} />)
    expect(screen.getByText('Add image')).toBeInTheDocument()
  })

  it('renders all image previews', () => {
    const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg']
    render(<ImageUpload max={5} value={urls} />)
    const images = screen.getAllByAltText('Preview')
    expect(images).toHaveLength(2)
  })

  it('shows count indicator', () => {
    const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg']
    render(<ImageUpload max={5} value={urls} />)
    expect(screen.getByText('2 / 5')).toBeInTheDocument()
  })

  it('hides add button when at max', () => {
    const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg']
    render(<ImageUpload max={2} value={urls} />)
    expect(screen.queryByText('Add image')).not.toBeInTheDocument()
  })

  it('calls onRemove for specific URL in multi mode', async () => {
    const onRemove = vi.fn()
    const urls = ['https://example.com/1.jpg', 'https://example.com/2.jpg']
    render(<ImageUpload max={5} value={urls} onRemove={onRemove} />)
    const removeButtons = screen.getAllByLabelText('Remove image')
    await userEvent.click(removeButtons[1])
    expect(onRemove).toHaveBeenCalledWith('https://example.com/2.jpg')
  })

  it('limits files to remaining slots', async () => {
    const onChange = vi.fn()
    const urls = ['https://example.com/1.jpg']
    render(<ImageUpload max={2} value={urls} onChange={onChange} />)
    const input = screen.getByTestId('image-upload-input')
    const files = [createImageFile('a.png'), createImageFile('b.png')]
    await userEvent.upload(input, files)
    // Only 1 remaining slot
    expect(onChange).toHaveBeenCalledWith([files[0]])
  })

  // ── Validation ──

  it('filters non-image files', async () => {
    const onChange = vi.fn()
    render(<ImageUpload max={5} onChange={onChange} />)
    const input = screen.getByTestId('image-upload-input')
    const textFile = new File(['hello'], 'doc.txt', { type: 'text/plain' })
    await userEvent.upload(input, textFile)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows maxSize hint in single mode placeholder', () => {
    render(<ImageUpload max={1} maxSize={5 * 1024 * 1024} />)
    expect(screen.getByText(/Max 5 MB/)).toBeInTheDocument()
  })

  // ── Error display ──

  it('shows error message', () => {
    render(<ImageUpload max={1} errorMessage="Upload failed" />)
    expect(screen.getByText('Upload failed')).toBeInTheDocument()
  })

  it('deprecated `error` string alias still shows the message', () => {
    render(<ImageUpload max={1} error="Legacy upload error" />)
    expect(screen.getByText('Legacy upload error')).toBeInTheDocument()
  })

  it('errorMessage wins when both errorMessage and string error are provided', () => {
    render(<ImageUpload max={1} errorMessage="New error" error="Old error" />)
    expect(screen.getByText('New error')).toBeInTheDocument()
    expect(screen.queryByText('Old error')).not.toBeInTheDocument()
  })

  it('boolean error applies destructive border to the upload button', () => {
    render(<ImageUpload max={1} error />)
    const button = screen.getByText('Upload image').closest('button')!
    expect(button.className).toContain('border-destructive')
  })

  // ── Loading state ──

  it('shows loading overlay for loading URLs', () => {
    const { container } = render(
      <ImageUpload
        max={1}
        value={['https://example.com/img.jpg']}
        loadingUrls={['https://example.com/img.jpg']}
      />
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  // ── No max (unlimited) ──

  it('works without max prop', async () => {
    const onChange = vi.fn()
    render(<ImageUpload onChange={onChange} />)
    expect(screen.getByText('Add image')).toBeInTheDocument()
    const input = screen.getByTestId('image-upload-input')
    const file = createImageFile()
    await userEvent.upload(input, file)
    expect(onChange).toHaveBeenCalledWith([file])
  })

  it('does not show count when no max', () => {
    const urls = ['https://example.com/1.jpg']
    render(<ImageUpload value={urls} />)
    expect(screen.queryByText(/\//)).not.toBeInTheDocument()
  })
})
