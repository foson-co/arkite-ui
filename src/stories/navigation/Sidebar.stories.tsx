import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarToggle,
} from '../../components/sidebar'

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    collapsible: { control: 'boolean' },
    defaultCollapsed: { control: 'boolean' },
  },
  args: {
    collapsible: true,
    defaultCollapsed: false,
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <div className="flex h-[500px]">
      <Sidebar {...args}>
        <SidebarHeader>
          <span className="px-2 text-sm font-semibold">Arkite</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup label="Main">
            <SidebarItem active>Dashboard</SidebarItem>
            <SidebarItem>Projects</SidebarItem>
            <SidebarItem>Analytics</SidebarItem>
          </SidebarGroup>
          <SidebarGroup label="Settings">
            <SidebarItem>General</SidebarItem>
            <SidebarItem>Team</SidebarItem>
            <SidebarItem disabled>Billing</SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarToggle />
        </SidebarFooter>
      </Sidebar>
      <div className="bg-muted flex-1 p-6">
        <p className="text-muted-foreground">Main content area</p>
      </div>
    </div>
  ),
}
