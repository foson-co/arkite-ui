import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Combobox } from '../../components/combobox'

const frameworks = [
  { value: 'react', label: 'React', description: 'A JavaScript library for building UIs' },
  { value: 'vue', label: 'Vue', description: 'The progressive JavaScript framework' },
  {
    value: 'angular',
    label: 'Angular',
    description: 'Platform for building mobile & desktop apps',
  },
  { value: 'svelte', label: 'Svelte', description: 'Cybernetically enhanced web apps' },
  { value: 'next', label: 'Next.js', description: 'The React framework for the web' },
  { value: 'nuxt', label: 'Nuxt', description: 'The intuitive Vue framework' },
  { value: 'remix', label: 'Remix', description: 'Full stack web framework', disabled: true },
]

const meta: Meta = {
  title: 'Overlay/Combobox',
  component: Combobox,
}

export default meta

const SingleDemo = () => {
  const [value, setValue] = useState<string>('')
  return (
    <div className="w-72">
      <Combobox
        options={frameworks}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Select framework..."
      />
    </div>
  )
}

export const Single: StoryFn = () => <SingleDemo />

const MultipleDemo = () => {
  const [value, setValue] = useState<string[]>([])
  return (
    <div className="w-80">
      <Combobox
        options={frameworks}
        value={value}
        onChange={(v) => setValue(v as string[])}
        placeholder="Select frameworks..."
        multiple
      />
    </div>
  )
}

export const Multiple: StoryFn = () => <MultipleDemo />

const WithErrorDemo = () => {
  const [value, setValue] = useState<string>('')
  return (
    <div className="w-72">
      <Combobox
        options={frameworks}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Select framework..."
        error
      />
    </div>
  )
}

export const WithError: StoryFn = () => <WithErrorDemo />

const LoadingDemo = () => {
  const [value, setValue] = useState<string>('')
  return (
    <div className="w-72">
      <Combobox
        options={[]}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Fetching options..."
        loading
      />
    </div>
  )
}

export const Loading: StoryFn = () => <LoadingDemo />

const NoResultsDemo = () => {
  const [value, setValue] = useState<string>('')
  return (
    <div className="w-72">
      <Combobox
        options={[]}
        value={value}
        onChange={(v) => setValue(v as string)}
        placeholder="Search..."
        emptyMessage="No matching frameworks found."
      />
    </div>
  )
}

export const NoResults: StoryFn = () => <NoResultsDemo />

const DisabledDemo = () => (
  <div className="w-72">
    <Combobox
      options={frameworks}
      value="react"
      onChange={() => {}}
      placeholder="Select framework..."
      disabled
    />
  </div>
)

export const Disabled: StoryFn = () => <DisabledDemo />
