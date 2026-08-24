import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PageHeader } from './PageHeader'

describe('PageHeader', () => {
  it('renders back button when onBack is provided', () => {
    render(<PageHeader title="Detail" onBack={vi.fn()} />)
    expect(screen.getByLabelText('Go back')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn()
    render(<PageHeader title="Detail" onBack={onBack} />)
    await userEvent.click(screen.getByLabelText('Go back'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('does not render back button without onBack', () => {
    render(<PageHeader title="List" />)
    expect(screen.queryByLabelText('Go back')).not.toBeInTheDocument()
  })

  it('uses custom backLabel', () => {
    render(<PageHeader title="Detail" onBack={vi.fn()} backLabel="返回列表" />)
    expect(screen.getByLabelText('返回列表')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<PageHeader title="Users" />)
    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<PageHeader title="Users" description="Manage users." />)
    expect(screen.getByText('Manage users.')).toBeInTheDocument()
  })

  it('renders actions slot', () => {
    render(<PageHeader title="Users" actions={<button>Add User</button>} />)
    expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument()
  })

  it('renders badge slot', () => {
    render(<PageHeader title="Users" badge={<span data-testid="badge">Active</span>} />)
    expect(screen.getByTestId('badge')).toBeInTheDocument()
  })

  it('renders breadcrumb slot', () => {
    render(<PageHeader title="Users" breadcrumb={<nav data-testid="crumbs">Home / Users</nav>} />)
    expect(screen.getByTestId('crumbs')).toBeInTheDocument()
  })

  it('defaults to md size (text-2xl title, unchanged from before)', () => {
    render(<PageHeader title="Users" description="Manage users." />)
    expect(screen.getByRole('heading', { name: 'Users' }).className).toContain('text-2xl')
    expect(screen.getByText('Manage users.').className).toContain('text-sm')
  })

  it('scales title and description with size', () => {
    const { rerender } = render(<PageHeader title="Users" description="Desc" size="sm" />)
    expect(screen.getByRole('heading', { name: 'Users' }).className).toContain('text-xl')

    rerender(<PageHeader title="Users" description="Desc" size="lg" />)
    expect(screen.getByRole('heading', { name: 'Users' }).className).toContain('text-3xl')
    expect(screen.getByText('Desc').className).toContain('text-base')
  })

  it('renders children', () => {
    render(
      <PageHeader title="Users">
        <div data-testid="extra">Extra content</div>
      </PageHeader>
    )
    expect(screen.getByTestId('extra')).toBeInTheDocument()
  })
})
