import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Tree, type TreeNode } from '../../components/tree'
import { FolderOpen, File, Settings, Users, Shield } from 'lucide-react'

const meta: Meta = {
  title: 'Data Display/Tree',
  component: Tree,
  parameters: { layout: 'padded' },
}

export default meta

const fileTree: TreeNode[] = [
  {
    key: 'src',
    label: 'src',
    icon: <FolderOpen className="text-muted-foreground h-4 w-4" />,
    children: [
      {
        key: 'components',
        label: 'components',
        icon: <FolderOpen className="text-muted-foreground h-4 w-4" />,
        children: [
          {
            key: 'button',
            label: 'Button.tsx',
            icon: <File className="text-muted-foreground h-4 w-4" />,
          },
          {
            key: 'input',
            label: 'Input.tsx',
            icon: <File className="text-muted-foreground h-4 w-4" />,
          },
          {
            key: 'modal',
            label: 'Modal.tsx',
            icon: <File className="text-muted-foreground h-4 w-4" />,
          },
        ],
      },
      {
        key: 'utils',
        label: 'utils',
        icon: <FolderOpen className="text-muted-foreground h-4 w-4" />,
        children: [
          { key: 'cn', label: 'cn.ts', icon: <File className="text-muted-foreground h-4 w-4" /> },
        ],
      },
      { key: 'index', label: 'index.ts', icon: <File className="text-muted-foreground h-4 w-4" /> },
    ],
  },
  {
    key: 'package',
    label: 'package.json',
    icon: <File className="text-muted-foreground h-4 w-4" />,
  },
  { key: 'readme', label: 'README.md', icon: <File className="text-muted-foreground h-4 w-4" /> },
]

export const Default: StoryFn = () => (
  <div className="w-80">
    <Tree data={fileTree} defaultExpandedKeys={['src', 'components']} />
  </div>
)

export const WithSelection: StoryFn = () => {
  const [selected, setSelected] = useState<string | undefined>('button')
  return (
    <div className="w-80">
      <Tree
        data={fileTree}
        defaultExpandedKeys={['src', 'components']}
        selectedKey={selected}
        onSelect={(key) => setSelected(key)}
      />
      <p className="text-muted-foreground mt-3 text-xs">Selected: {selected ?? 'none'}</p>
    </div>
  )
}

const permissionTree: TreeNode[] = [
  {
    key: 'admin',
    label: 'Admin',
    icon: <Shield className="h-4 w-4" />,
    children: [
      {
        key: 'users',
        label: 'User Management',
        icon: <Users className="h-4 w-4" />,
        children: [
          { key: 'users-read', label: 'View users' },
          { key: 'users-write', label: 'Edit users' },
          { key: 'users-delete', label: 'Delete users' },
        ],
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        children: [
          { key: 'settings-read', label: 'View settings' },
          { key: 'settings-write', label: 'Edit settings' },
        ],
      },
    ],
  },
]

export const Checkable: StoryFn = () => {
  const [checked, setChecked] = useState<string[]>(['users-read'])
  return (
    <div className="w-80">
      <Tree
        data={permissionTree}
        checkable
        checkedKeys={checked}
        onSelectionChange={setChecked}
        defaultExpandedKeys={['admin', 'users', 'settings']}
      />
      <p className="text-muted-foreground mt-3 text-xs">
        Checked: {checked.length > 0 ? checked.join(', ') : 'none'}
      </p>
    </div>
  )
}

const withDisabled: TreeNode[] = [
  {
    key: 'root',
    label: 'Root',
    children: [
      { key: 'enabled', label: 'Enabled node' },
      { key: 'disabled', label: 'Disabled node', disabled: true },
      { key: 'another', label: 'Another enabled node' },
    ],
  },
]

export const DisabledNodes: StoryFn = () => (
  <div className="w-80">
    <Tree data={withDisabled} defaultExpandedKeys={['root']} />
  </div>
)
