import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Modal } from '../../components/modal'
import { Button } from '../../components/button'

const meta = {
  title: 'Feedback/Modal',
  component: Modal,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
  },
} satisfies Meta<typeof Modal>

export default meta

const DefaultDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-muted-foreground text-sm">
          This action cannot be undone. This will permanently delete your account and remove your
          data from our servers.
        </p>
      </Modal>
    </>
  )
}

export const Default: StoryFn = () => <DefaultDemo />

const LargeDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Large Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Large Modal" size="lg">
        <p className="text-muted-foreground text-sm">
          This is a larger modal with more content space.
        </p>
      </Modal>
    </>
  )
}

export const Large: StoryFn = () => <LargeDemo />

const FormDialogDemo = () => {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  return (
    <>
      <Button onClick={() => setOpen(true)}>New list…</Button>
      {saved && <p className="text-muted-foreground mt-2 text-sm">Saved: {saved}</p>}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create list"
        description="onSubmit wraps the dialog in a real <form> — the footer submit button just works."
        onSubmit={(e) => {
          e.preventDefault()
          setSaved(new FormData(e.currentTarget).get('name') as string)
          setOpen(false)
        }}
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </>
        }
      >
        <label className="flex flex-col gap-1 text-sm">
          List name
          <input
            name="name"
            required
            className="border-input bg-background h-9 rounded-md border px-3"
          />
        </label>
      </Modal>
    </>
  )
}

export const FormDialog: StoryFn = () => <FormDialogDemo />

const LongContentDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open long content</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Terms of service"
        description="The panel caps at the viewport height; the body scrolls."
        footer={<Button onClick={() => setOpen(false)}>Done</Button>}
      >
        {Array.from({ length: 40 }, (_, i) => (
          <p key={i} className="text-muted-foreground mb-3 text-sm">
            Paragraph {i + 1} — long enough content to prove the body scrolls inside the dialog
            instead of growing past the viewport.
          </p>
        ))}
      </Modal>
    </>
  )
}

export const LongContent: StoryFn = () => <LongContentDemo />
