import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Pagination } from '../../components/pagination'

const meta = {
  title: 'Data Display/Pagination',
  component: Pagination,
} satisfies Meta<typeof Pagination>

export default meta

const FullDemo = () => {
  const [page, setPage] = useState(1)
  return (
    <Pagination
      currentPage={page}
      totalPages={20}
      onPageChange={setPage}
      totalItems={200}
      pageSize={10}
    />
  )
}

export const Full: StoryFn = () => <FullDemo />

const CompactDemo = () => {
  const [page, setPage] = useState(1)
  return <Pagination currentPage={page} totalPages={20} onPageChange={setPage} variant="compact" />
}

export const Compact: StoryFn = () => <CompactDemo />

const WithPageSizeDemo = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalItems = 200
  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
      totalItems={totalItems}
      pageSize={pageSize}
      showPageSize
      onPageSizeChange={(size) => {
        setPageSize(size)
        setPage(1)
      }}
    />
  )
}

export const WithPageSize: StoryFn = () => <WithPageSizeDemo />

const FewPagesDemo = () => {
  const [page, setPage] = useState(1)
  return <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />
}

export const FewPages: StoryFn = () => <FewPagesDemo />
