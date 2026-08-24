import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'
import { useLocale } from '../../locale'
import { Button } from '../button/Button'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page (1-based) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Page change callback */
  onPageChange: (page: number) => void
  /** Total items count (for info display) */
  totalItems?: number
  /** Items per page (for info display) */
  pageSize?: number
  /** Display variant */
  variant?: 'compact' | 'full'
  /** @deprecated use `variant` instead — removed in v1.0 */
  mode?: 'compact' | 'full'
  /** Show page size selector */
  showPageSize?: boolean
  /** Page size options */
  pageSizeOptions?: number[]
  /** Page size change callback */
  onPageSizeChange?: (pageSize: number) => void
  /** Number of page buttons to show around current page */
  siblingCount?: number
}

function ChevronLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M6.15803 3.13514C5.95657 3.32401 5.94637 3.64042 6.13523 3.84188L9.56464 7.49991L6.13523 11.1579C5.94637 11.3594 5.95657 11.6758 6.15803 11.8647C6.35949 12.0535 6.67591 12.0433 6.86477 11.8419L10.6148 7.84188C10.7951 7.64955 10.7951 7.35027 10.6148 7.15794L6.86477 3.15794C6.67591 2.95648 6.35949 2.94628 6.15803 3.13514Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronsLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M6.84182 3.13514C7.04327 3.32401 7.05348 3.64042 6.86462 3.84188L3.43521 7.49991L6.86462 11.1579C7.05348 11.3594 7.04327 11.6758 6.84182 11.8647C6.64036 12.0535 6.32394 12.0433 6.13508 11.8419L2.38508 7.84188C2.20477 7.64955 2.20477 7.35027 2.38508 7.15794L6.13508 3.15794C6.32394 2.95648 6.64036 2.94628 6.84182 3.13514Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M12.8418 3.13514C13.0433 3.32401 13.0535 3.64042 12.8646 3.84188L9.43521 7.49991L12.8646 11.1579C13.0535 11.3594 13.0433 11.6758 12.8418 11.8647C12.6404 12.0535 12.3239 12.0433 12.1351 11.8419L8.38508 7.84188C8.20477 7.64955 8.20477 7.35027 8.38508 7.15794L12.1351 3.15794C12.3239 2.95648 12.6404 2.94628 12.8418 3.13514Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronsRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M2.15803 3.13514C1.95657 3.32401 1.94637 3.64042 2.13523 3.84188L5.56464 7.49991L2.13523 11.1579C1.94637 11.3594 1.95657 11.6758 2.15803 11.8647C2.35949 12.0535 2.67591 12.0433 2.86477 11.8419L6.61477 7.84188C6.79508 7.64955 6.79508 7.35027 6.61477 7.15794L2.86477 3.15794C2.67591 2.95648 2.35949 2.94628 2.15803 3.13514Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M8.15803 3.13514C7.95657 3.32401 7.94637 3.64042 8.13523 3.84188L11.5646 7.49991L8.13523 11.1579C7.94637 11.3594 7.95657 11.6758 8.15803 11.8647C8.35949 12.0535 8.67591 12.0433 8.86477 11.8419L12.6148 7.84188C12.7951 7.64955 12.7951 7.35027 12.6148 7.15794L8.86477 3.15794C8.67591 2.95648 8.35949 2.94628 8.15803 3.13514Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  )
}

function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  const totalButtons = siblingCount * 2 + 5 // siblings + first + last + current + 2 ellipsis
  if (totalPages <= totalButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSibling = Math.max(currentPage - siblingCount, 2)
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1)

  const showLeftEllipsis = leftSibling > 2
  const showRightEllipsis = rightSibling < totalPages - 1

  const pages: (number | 'ellipsis')[] = [1]

  if (showLeftEllipsis) {
    pages.push('ellipsis')
  } else {
    for (let i = 2; i < leftSibling; i++) pages.push(i)
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    pages.push(i)
  }

  if (showRightEllipsis) {
    pages.push('ellipsis')
  } else {
    for (let i = rightSibling + 1; i < totalPages; i++) pages.push(i)
  }

  pages.push(totalPages)
  return pages
}

/** Page navigation control with page buttons, size selector, and item count display. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      onPageChange,
      totalItems,
      pageSize,
      variant,
      mode,
      showPageSize = false,
      pageSizeOptions = [10, 20, 50, 100],
      onPageSizeChange,
      siblingCount = 1,
      className,
      ...props
    },
    ref
  ) => {
    if (mode && variant == null) {
      warnDeprecated('Pagination', 'mode', 'variant')
    }
    // `variant` wins when both are provided
    const resolvedVariant = variant ?? mode ?? 'full'

    const locale = useLocale()
    const canPrevious = currentPage > 1
    const canNext = currentPage < totalPages

    const info =
      totalItems != null && pageSize != null
        ? locale.pagination.rangeInfo(
            (currentPage - 1) * pageSize + 1,
            Math.min(currentPage * pageSize, totalItems),
            totalItems
          )
        : `${currentPage} / ${totalPages}`

    return (
      <nav
        ref={ref}
        aria-label={locale.pagination.label}
        className={cn('flex items-center justify-between', className)}
        {...props}
      >
        {/* Left: page size + info */}
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          {showPageSize && pageSize != null && onPageSizeChange && (
            <>
              <span>{locale.pagination.rowsPerPage}</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="border-input bg-background focus:ring-ring h-8 w-16 cursor-pointer rounded-md border px-2 text-sm focus:ring-2 focus:outline-none"
                aria-label={locale.pagination.rowsPerPage}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </>
          )}
          <span>{info}</span>
        </div>

        {/* Right: navigation */}
        <div className="flex items-center gap-1">
          {resolvedVariant === 'full' && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(1)}
              disabled={!canPrevious}
              aria-label={locale.pagination.firstPage}
            >
              <ChevronsLeftIcon />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPrevious}
            aria-label={locale.pagination.previousPage}
          >
            <ChevronLeftIcon />
          </Button>

          {resolvedVariant === 'full' && totalPages > 0 && (
            <div className="flex items-center gap-1">
              {getPageRange(currentPage, totalPages, siblingCount).map((page, i) =>
                page === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(page)}
                    aria-label={locale.pagination.pageLabel(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
          )}

          {resolvedVariant === 'compact' && (
            <span className="flex h-8 min-w-[4rem] items-center justify-center text-sm">
              {currentPage} / {totalPages}
            </span>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNext}
            aria-label={locale.pagination.nextPage}
          >
            <ChevronRightIcon />
          </Button>
          {resolvedVariant === 'full' && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages)}
              disabled={!canNext}
              aria-label={locale.pagination.lastPage}
            >
              <ChevronsRightIcon />
            </Button>
          )}
        </div>
      </nav>
    )
  }
)

Pagination.displayName = 'Pagination'
