import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarLink,
  NavbarDivider,
  NavbarSpacer,
} from '../../components/navbar'
import { Avatar } from '../../components/avatar'
import { Button } from '../../components/button'

const meta = {
  title: 'Navigation/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Navbar>
      <NavbarBrand name="Arkite" />
      <NavbarContent>
        <NavbarLink active>Dashboard</NavbarLink>
        <NavbarLink>Projects</NavbarLink>
        <NavbarLink>Settings</NavbarLink>
      </NavbarContent>
      <NavbarSpacer />
      <NavbarContent align="right">
        <NavbarItem>
          <Avatar size="sm" fallback="WC" status="online" />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  ),
}

export const WithActions: Story = {
  render: () => (
    <Navbar bordered>
      <NavbarBrand name="Admin Panel" />
      <NavbarSpacer />
      <NavbarContent align="right">
        <NavbarItem>
          <Button size="sm" variant="outline">
            Docs
          </Button>
        </NavbarItem>
        <NavbarDivider />
        <NavbarItem>
          <Button size="sm" variant="primary">
            Sign In
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  ),
}
