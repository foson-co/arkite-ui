import { forwardRef } from 'react'
import { warnDeprecated } from '../../utils/deprecate'
import { ToastContainer, type ToastContainerProps } from './Toast'

/** @deprecated Use `ToastContainerProps` instead — removed in v1.0. */
export type ImperativeToastContainerProps = ToastContainerProps

/**
 * @deprecated Use `ToastContainer` instead — removed in v1.0. Both containers
 * now render from the same store; this alias only exists for back-compat.
 */
export const ImperativeToastContainer = forwardRef<HTMLDivElement, ImperativeToastContainerProps>(
  function ImperativeToastContainer(props, ref) {
    warnDeprecated('ToastContainer', 'ImperativeToastContainer', 'ToastContainer')
    return <ToastContainer ref={ref} {...props} />
  }
)
