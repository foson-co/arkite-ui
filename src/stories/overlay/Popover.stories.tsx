import type { Meta, StoryFn } from '@storybook/react-vite'
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '../../components/popover'
import { Button } from '../../components/button'
import { Input } from '../../components/input'
import { Label } from '../../components/label'

const meta: Meta = {
  title: 'Overlay/Popover',
  component: Popover,
}

export default meta

export const Default: StoryFn = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">Open Popover</Button>
    </PopoverTrigger>
    <PopoverContent className="w-80">
      <div className="grid gap-4">
        <div className="space-y-2">
          <h4 className="leading-none font-medium">Dimensions</h4>
          <p className="text-muted-foreground text-sm">Set the dimensions for the layer.</p>
        </div>
        <div className="grid gap-2">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label>Width</Label>
            <Input defaultValue="100%" className="col-span-2 h-8" />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label>Height</Label>
            <Input defaultValue="25px" className="col-span-2 h-8" />
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
)

export const WithArrow: StoryFn = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">With Arrow</Button>
    </PopoverTrigger>
    <PopoverContent showArrow>
      <p className="text-sm">This popover has an arrow pointing to the trigger.</p>
    </PopoverContent>
  </Popover>
)

export const WithClose: StoryFn = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button>Notification Settings</Button>
    </PopoverTrigger>
    <PopoverContent className="w-72">
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Notifications</h4>
        <p className="text-muted-foreground text-xs">Choose what you want to be notified about.</p>
        <div className="flex justify-end">
          <PopoverClose asChild>
            <Button size="sm" variant="primary">
              Done
            </Button>
          </PopoverClose>
        </div>
      </div>
    </PopoverContent>
  </Popover>
)
