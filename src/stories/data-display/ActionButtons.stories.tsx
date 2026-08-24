import type { Meta, StoryFn } from '@storybook/react-vite'
import { ActionButtons, type ActionItem } from '../../components/action-buttons'

const meta = {
  title: 'Data Display/ActionButtons',
  component: ActionButtons,
} satisfies Meta<typeof ActionButtons>

export default meta

function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1465 1.14645L3.71455 8.57836C3.62459 8.66832 3.55263 8.77461 3.50251 8.89155L2.04044 12.303C1.9599 12.4922 2.00189 12.709 2.14646 12.8536C2.29103 12.9981 2.50784 13.0401 2.69704 12.9596L6.10847 11.4975C6.22541 11.4474 6.3317 11.3754 6.42166 11.2855L13.8536 3.85355C14.0488 3.65829 14.0488 3.34171 13.8536 3.14645L11.8536 1.14645Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM6 6V11H7V6H6ZM8 6V11H9V6H8Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

const actions: ActionItem[] = [
  { key: 'edit', label: 'Edit', icon: <EditIcon />, onClick: () => alert('Edit') },
  { key: 'copy', label: 'Duplicate', icon: <CopyIcon />, onClick: () => alert('Duplicate') },
  {
    key: 'delete',
    label: 'Delete',
    icon: <TrashIcon />,
    variant: 'destructive',
    confirm: { title: 'Delete item?', description: 'This action cannot be undone.' },
    onClick: () => alert('Deleted!'),
    separator: true,
  },
]

export const Dropdown: StoryFn = () => (
  <div className="flex justify-center p-8">
    <ActionButtons actions={actions} mode="dropdown" />
  </div>
)

export const Inline: StoryFn = () => (
  <div className="flex justify-center p-8">
    <ActionButtons actions={actions} mode="inline" />
  </div>
)

export const WithDisabled: StoryFn = () => (
  <div className="flex justify-center p-8">
    <ActionButtons
      actions={[
        { key: 'edit', label: 'Edit', icon: <EditIcon />, onClick: () => {} },
        { key: 'delete', label: 'Delete', icon: <TrashIcon />, onClick: () => {}, disabled: true },
      ]}
      mode="dropdown"
    />
  </div>
)
