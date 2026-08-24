import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { TagInput } from '../../components/tag-input/TagInput'

const meta: Meta<typeof TagInput> = {
  title: 'Form/TagInput',
  component: TagInput,
  parameters: { layout: 'padded' },
}

export default meta

// ── Default (interactive) ──

function DefaultDemo() {
  const [tags, setTags] = useState<string[]>([])

  return (
    <div className="w-96">
      <TagInput
        value={tags}
        onChange={setTags}
        placeholder="Type and press Enter to add tags..."
        aria-label="Tags"
      />
    </div>
  )
}

export const Default: StoryFn = () => <DefaultDemo />

// ── With Initial Tags ──

function WithInitialTagsDemo() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind'])

  return (
    <div className="w-96">
      <TagInput value={tags} onChange={setTags} placeholder="Add more tags..." aria-label="Tags" />
    </div>
  )
}

export const WithInitialTags: StoryFn = () => <WithInitialTagsDemo />

// ── Max Tags (max=3) ──

function MaxTagsDemo() {
  const [tags, setTags] = useState(['Design', 'Frontend'])

  return (
    <div className="w-96">
      <TagInput
        value={tags}
        onChange={setTags}
        max={3}
        placeholder="Max 3 tags allowed..."
        aria-label="Tags"
      />
    </div>
  )
}

export const MaxTags: StoryFn = () => <MaxTagsDemo />

// ── Disabled ──

export const Disabled: StoryFn = () => (
  <div className="w-96">
    <TagInput value={['React', 'TypeScript']} onChange={() => {}} disabled aria-label="Tags" />
  </div>
)

// ── With Error ──

function WithErrorDemo() {
  const [tags, setTags] = useState<string[]>([])

  return (
    <div className="w-96">
      <TagInput
        value={tags}
        onChange={setTags}
        error
        placeholder="At least one tag is required"
        aria-label="Tags"
      />
    </div>
  )
}

export const WithError: StoryFn = () => <WithErrorDemo />
