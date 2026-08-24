import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { ImageUpload } from '../../components/file-upload/ImageUpload'

const meta: Meta<typeof ImageUpload> = {
  title: 'Form/ImageUpload',
  component: ImageUpload,
  parameters: { layout: 'padded' },
}

export default meta

// Sample placeholder images
const sampleUrls = [
  'https://picsum.photos/seed/a/200/200',
  'https://picsum.photos/seed/b/200/200',
  'https://picsum.photos/seed/c/200/200',
]

// ── Single Image ──

function SingleImageDemo() {
  const [urls, setUrls] = useState<string[]>([])

  const handleUpload = (files: File[]) => {
    // Simulate: create object URL as preview
    const newUrl = URL.createObjectURL(files[0])
    setUrls([newUrl])
  }

  return <ImageUpload max={1} value={urls} onChange={handleUpload} onRemove={() => setUrls([])} />
}

export const SingleImage: StoryFn = () => <SingleImageDemo />

// ── Single Image with Existing ──

export const SingleImageWithPreview: StoryFn = () => (
  <ImageUpload max={1} value={[sampleUrls[0]]} onRemove={() => {}} />
)

// ── Multi Image Grid ──

function MultiImageDemo() {
  const [urls, setUrls] = useState<string[]>(sampleUrls.slice(0, 2))

  const handleUpload = (files: File[]) => {
    const newUrls = files.map((f) => URL.createObjectURL(f))
    setUrls((prev) => [...prev, ...newUrls])
  }

  const handleRemove = (url: string) => {
    setUrls((prev) => prev.filter((u) => u !== url))
  }

  return <ImageUpload max={5} value={urls} onChange={handleUpload} onRemove={handleRemove} />
}

export const MultiImage: StoryFn = () => <MultiImageDemo />

// ── Full (at max) ──

export const AtMaxLimit: StoryFn = () => (
  <ImageUpload max={3} value={sampleUrls} onRemove={() => {}} />
)

// ── With Loading ──

export const WithLoading: StoryFn = () => (
  <ImageUpload
    max={5}
    value={sampleUrls.slice(0, 2)}
    loadingUrls={[sampleUrls[1]]}
    onRemove={() => {}}
  />
)

// ── With Error ──

export const WithError: StoryFn = () => (
  <ImageUpload max={1} error errorMessage="Upload failed: file too large" />
)

// ── Disabled ──

export const Disabled: StoryFn = () => (
  <ImageUpload max={3} value={sampleUrls.slice(0, 2)} disabled />
)

// ── With Max Size Hint ──

export const WithMaxSize: StoryFn = () => <ImageUpload max={1} maxSize={5 * 1024 * 1024} />

// ── Unlimited ──

function UnlimitedDemo() {
  const [urls, setUrls] = useState<string[]>([sampleUrls[0]])

  return (
    <ImageUpload
      value={urls}
      onChange={(files) => {
        const newUrls = files.map((f) => URL.createObjectURL(f))
        setUrls((prev) => [...prev, ...newUrls])
      }}
      onRemove={(url) => setUrls((prev) => prev.filter((u) => u !== url))}
    />
  )
}

export const Unlimited: StoryFn = () => <UnlimitedDemo />
