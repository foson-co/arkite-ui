import type { Meta, StoryFn } from '@storybook/react-vite'
import { CopyButton, CopyInput } from '../../components/copy-button/CopyButton'

const meta: Meta<typeof CopyButton> = {
  title: 'Primitives/CopyButton',
  component: CopyButton,
  parameters: { layout: 'padded' },
}

export default meta

// ── Default ──

export const Default: StoryFn = () => <CopyButton value="npm install @arkite-ui/core" />

// ── Icon Only ──

export const IconOnly: StoryFn = () => <CopyButton value="secret-api-key-12345" size="icon" />

// ── CopyInput (Default) ──

export const CopyInputDefault: StoryFn = () => (
  <div className="w-96">
    <CopyInput value="https://api.example.com/v1/users" aria-label="API endpoint URL" />
  </div>
)

// ── Variants ──

export const Variants: StoryFn = () => (
  <div className="flex flex-wrap items-center gap-4">
    <CopyButton value="primary" variant="primary" />
    <CopyButton value="secondary" variant="secondary" />
    <CopyButton value="outline" variant="outline" />
    <CopyButton value="ghost" variant="ghost" />
    <CopyButton value="destructive" variant="destructive" />
    <CopyButton value="gradient" variant="gradient" />
  </div>
)
