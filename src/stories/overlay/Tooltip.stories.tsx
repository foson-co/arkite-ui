import type { Meta, StoryFn } from '@storybook/react-vite'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  SimpleTooltip,
} from '../../components/tooltip'
import { Button } from '../../components/button'

const meta: Meta = {
  component: SimpleTooltip,
  subcomponents: { TooltipTrigger, TooltipContent },
  title: 'Overlay/Tooltip',
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
}

export default meta

export const Default: StoryFn = () => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a tooltip</p>
    </TooltipContent>
  </Tooltip>
)

export const Positions: StoryFn = () => (
  <div className="flex gap-4">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Top
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">Top tooltip</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Right
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">Right tooltip</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Bottom
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Bottom tooltip</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Left
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">Left tooltip</TooltipContent>
    </Tooltip>
  </div>
)

export const Simple: StoryFn = () => (
  <div className="flex gap-4">
    <SimpleTooltip content="Save your changes">
      <Button>Save</Button>
    </SimpleTooltip>
    <SimpleTooltip content="Delete this item" side="bottom">
      <Button variant="destructive">Delete</Button>
    </SimpleTooltip>
  </div>
)

export const CustomOffset: StoryFn = () => (
  <div className="flex gap-8">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Default (4px)
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={4}>sideOffset: 4</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Relaxed (10px)
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={10}>sideOffset: 10</TooltipContent>
    </Tooltip>
  </div>
)

/** Radix auto-flips when hitting viewport edges */
export const BoundaryAware: StoryFn = () => (
  <div className="flex w-full justify-between px-0">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Left edge
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" collisionPadding={8}>
        Auto-flips when clipped
      </TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm">
          Right edge
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" collisionPadding={8}>
        Auto-flips when clipped
      </TooltipContent>
    </Tooltip>
  </div>
)
BoundaryAware.parameters = { layout: 'padded' }
