import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum width */
  size?: ContainerSize
  /** Center content horizontally */
  centered?: boolean
  /** Add horizontal padding */
  padded?: boolean
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: 'max-w-screen-sm', // 640px
  md: 'max-w-screen-md', // 768px
  lg: 'max-w-screen-lg', // 1024px
  xl: 'max-w-screen-xl', // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  full: 'max-w-full',
}

/** Responsive container with configurable max-width and padding. */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', centered = true, padded = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          sizeStyles[size],
          centered && 'mx-auto',
          padded && 'px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'
