import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface StepItem {
  /** Step label */
  label: string
  /** Optional description */
  description?: string
  /** Optional icon */
  icon?: ReactNode
}

export type StepsStatus = 'complete' | 'current' | 'upcoming'

export interface StepsProps extends HTMLAttributes<HTMLDivElement> {
  /** Step definitions */
  steps: StepItem[]
  /** Current step index (0-based) */
  currentStep: number
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Size */
  size?: 'sm' | 'md'
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11.6 3.7a.7.7 0 0 1 0 1l-5.6 5.6a.7.7 0 0 1-1 0l-2.8-2.8a.7.7 0 1 1 1-1L5.5 8.8l5.1-5.1a.7.7 0 0 1 1 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** Multi-step progress indicator with horizontal or vertical orientation. */
export const Steps = forwardRef<HTMLDivElement, StepsProps>(
  ({ steps, currentStep, orientation = 'horizontal', size = 'md', className, ...props }, ref) => {
    const isVertical = orientation === 'vertical'

    return (
      <div
        ref={ref}
        className={cn('flex', isVertical ? 'flex-col gap-0' : 'items-center gap-0', className)}
        {...props}
      >
        {steps.map((step, index) => {
          const status: StepsStatus =
            index < currentStep ? 'complete' : index === currentStep ? 'current' : 'upcoming'

          const isLast = index === steps.length - 1
          const dotSize = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'

          return (
            <div
              key={index}
              className={cn(
                'flex',
                isVertical ? 'flex-row gap-3' : 'flex-1 flex-col items-center gap-2'
              )}
            >
              <div
                className={cn('flex', isVertical ? 'flex-col items-center' : 'w-full items-center')}
              >
                {/* Dot */}
                <div
                  className={cn(
                    'flex shrink-0 items-center justify-center rounded-full font-medium transition-colors',
                    dotSize,
                    status === 'complete' && 'bg-primary text-primary-foreground',
                    status === 'current' && 'border-primary text-primary bg-background border-2',
                    status === 'upcoming' &&
                      'border-muted-foreground/30 text-muted-foreground bg-background border-2'
                  )}
                >
                  {status === 'complete' ? (step.icon ?? <CheckIcon />) : (step.icon ?? index + 1)}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'transition-colors',
                      isVertical ? 'mx-auto my-1 min-h-[24px] w-0.5 flex-1' : 'mx-2 h-0.5 flex-1',
                      index < currentStep ? 'bg-primary' : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <div className={cn(isVertical ? 'pt-0.5 pb-4' : 'text-center')}>
                <p
                  className={cn(
                    'text-sm leading-tight font-medium',
                    status === 'upcoming' && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-muted-foreground mt-0.5 text-xs">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
)

Steps.displayName = 'Steps'
