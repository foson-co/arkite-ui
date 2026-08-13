import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Drawer } from '../../components/drawer'
import { Button } from '../../components/button'

const meta = {
  title: 'Feedback/Drawer',
  component: Drawer,
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof Drawer>

export default meta

const RightDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Drawer Title"
        description="This is a side panel"
      >
        <p className="text-muted-foreground p-4 text-sm">Drawer content goes here.</p>
      </Drawer>
    </>
  )
}

export const Right: StoryFn = () => <RightDemo />

const LeftDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Left Drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Navigation" position="left">
        <p className="text-muted-foreground p-4 text-sm">Left side content.</p>
      </Drawer>
    </>
  )
}

export const Left: StoryFn = () => <LeftDemo />

const BottomDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Bottom Drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Details" position="bottom">
        <p className="text-muted-foreground p-4 text-sm">Bottom panel content.</p>
      </Drawer>
    </>
  )
}

export const Bottom: StoryFn = () => <BottomDemo />
