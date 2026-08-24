import type { Meta, StoryFn } from '@storybook/react-vite'
import { Kbd } from '../../components/kbd'

const meta = {
  title: 'Primitives/Kbd',
  component: Kbd,
} satisfies Meta<typeof Kbd>

export default meta

export const Default: StoryFn = () => (
  <div className="flex items-center gap-4">
    <div className="flex items-center gap-1">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </div>
    <div className="flex items-center gap-1">
      <Kbd>Ctrl</Kbd>
      <Kbd>Shift</Kbd>
      <Kbd>P</Kbd>
    </div>
    <div className="flex items-center gap-1">
      <Kbd>Esc</Kbd>
    </div>
  </div>
)

export const Sizes: StoryFn = () => (
  <div className="flex items-center gap-6">
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground mr-2 text-sm">sm:</span>
      <Kbd size="sm">⌘</Kbd>
      <Kbd size="sm">S</Kbd>
    </div>
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground mr-2 text-sm">md:</span>
      <Kbd size="md">⌘</Kbd>
      <Kbd size="md">S</Kbd>
    </div>
  </div>
)

export const InContext: StoryFn = () => (
  <div className="space-y-3 text-sm">
    <p className="text-muted-foreground">
      Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the command palette
    </p>
    <p className="text-muted-foreground">
      Press <Kbd>Esc</Kbd> to close
    </p>
    <p className="text-muted-foreground">
      Press <Kbd size="md">Ctrl</Kbd> <Kbd size="md">Enter</Kbd> to submit
    </p>
  </div>
)
