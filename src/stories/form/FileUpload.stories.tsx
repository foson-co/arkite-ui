import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FileTrigger, FileUpload, FileUploadButton } from '../../components/file-upload'

const meta = {
  title: 'Form/FileUpload',
  component: FileUpload,
  argTypes: {
    multiple: { control: 'boolean' },
    showFileList: { control: 'boolean' },
  },
  args: {
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024,
  },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
}

export const MultipleFiles: Story = {
  args: { multiple: true, maxFiles: 5 },
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
}

export const ButtonVariant: Story = {
  render: () => <FileUploadButton accept="image/*">Upload Image</FileUploadButton>,
}

export const Disabled: Story = {
  args: { disabled: true },
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
}

export const WithErrorCallback: Story = {
  args: {
    maxSize: 1024, // 1KB — easy to trigger error
    onError: (error: string) => alert(error),
  },
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
}

export const SmallMaxFiles: Story = {
  args: {
    multiple: true,
    maxFiles: 2,
    onError: (error: string) => alert(error),
  },
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
}

const FileTriggerDemo = () => {
  const [name, setName] = useState<string | null>(null)
  return (
    <div className="flex items-center gap-4">
      {/* Headless: ANY element opens the picker — here an avatar thumbnail */}
      <FileTrigger accept="image/*" onChange={([file]) => setName(file.name)}>
        <button
          type="button"
          className="border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed text-xs"
        >
          {name ? '✓' : '照片'}
        </button>
      </FileTrigger>
      <p className="text-muted-foreground text-sm">
        {name
          ? `Picked: ${name}`
          : 'Click the avatar to pick an image — no dropzone chrome, no wrapper element.'}
      </p>
    </div>
  )
}

export const HeadlessTrigger: Story = {
  render: () => <FileTriggerDemo />,
}
