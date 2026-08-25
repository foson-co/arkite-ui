import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TenantSwitcher, type TenantItem } from './TenantSwitcher'

const tenants: TenantItem[] = [
  {
    id: '1',
    name: 'Acme Corp',
    slug: 'acme',
    status: 'active',
    statusVariant: 'success',
    planLabel: 'Pro',
  },
  {
    id: '2',
    name: 'Beta Inc',
    slug: 'beta',
    status: 'trial',
    statusVariant: 'warning',
    planLabel: 'Free',
  },
  { id: '3', name: 'Gamma Ltd', slug: 'gamma' },
]

function getTrigger() {
  // The trigger is the first button in the component
  return screen.getAllByRole('button')[0]
}

describe('TenantSwitcher', () => {
  it('renders trigger with "All Tenants" when no tenant selected', () => {
    render(<TenantSwitcher tenants={tenants} />)
    expect(screen.getByText('All Tenants')).toBeInTheDocument()
  })

  it('renders trigger with current tenant name', () => {
    render(<TenantSwitcher tenants={tenants} value={tenants[0]} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('opens dropdown on click', async () => {
    render(<TenantSwitcher tenants={tenants} />)
    await userEvent.click(getTrigger())
    expect(screen.getByPlaceholderText('Search tenants...')).toBeInTheDocument()
  })

  it('shows all tenants in dropdown', async () => {
    render(<TenantSwitcher tenants={tenants} />)
    await userEvent.click(getTrigger())
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Beta Inc')).toBeInTheDocument()
    expect(screen.getByText('Gamma Ltd')).toBeInTheDocument()
  })

  it('filters tenants by search', async () => {
    render(<TenantSwitcher tenants={tenants} />)
    await userEvent.click(getTrigger())
    await userEvent.type(screen.getByPlaceholderText('Search tenants...'), 'acme')
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.queryByText('Beta Inc')).not.toBeInTheDocument()
  })

  it('calls onChange when a tenant is clicked', async () => {
    const onChange = vi.fn()
    render(<TenantSwitcher tenants={tenants} onChange={onChange} />)
    await userEvent.click(getTrigger())
    await userEvent.click(screen.getByText('Beta Inc'))
    expect(onChange).toHaveBeenCalledWith(tenants[1])
  })

  it('calls onChange with null when All Tenants option is clicked', async () => {
    const onChange = vi.fn()
    render(<TenantSwitcher tenants={tenants} value={tenants[0]} onChange={onChange} />)
    await userEvent.click(getTrigger())
    // Click the "Platform-wide view" text's parent button (the All Tenants dropdown option)
    await userEvent.click(screen.getByText('Platform-wide view'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('hides All Tenants option when showAllOption is false', async () => {
    render(<TenantSwitcher tenants={tenants} value={tenants[0]} showAllOption={false} />)
    await userEvent.click(getTrigger())
    expect(screen.queryByText('Platform-wide view')).not.toBeInTheDocument()
  })

  it('shows empty message when no tenants match search', async () => {
    render(<TenantSwitcher tenants={tenants} />)
    await userEvent.click(getTrigger())
    await userEvent.type(screen.getByPlaceholderText('Search tenants...'), 'zzzzz')
    expect(screen.getByText('No tenants found')).toBeInTheDocument()
  })

  it('shows loading state', async () => {
    render(<TenantSwitcher tenants={[]} loading />)
    await userEvent.click(getTrigger())
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  describe('deprecated aliases', () => {
    it('supports deprecated currentTenant as alias for value and warns', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      render(<TenantSwitcher tenants={tenants} currentTenant={tenants[0]} />)
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('`currentTenant` is deprecated'))
      warnSpy.mockRestore()
    })

    it('supports deprecated onSelect as alias for onChange and warns', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const onSelect = vi.fn()
      render(<TenantSwitcher tenants={tenants} onSelect={onSelect} />)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('`onSelect` is deprecated'))
      warnSpy.mockRestore()
      await userEvent.click(getTrigger())
      await userEvent.click(screen.getByText('Beta Inc'))
      expect(onSelect).toHaveBeenCalledWith(tenants[1])
    })

    it('prefers value over deprecated currentTenant when both provided', () => {
      render(<TenantSwitcher tenants={tenants} value={tenants[1]} currentTenant={tenants[0]} />)
      expect(screen.getByText('Beta Inc')).toBeInTheDocument()
      expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument()
    })

    it('prefers onChange over deprecated onSelect when both provided', async () => {
      const onChange = vi.fn()
      const onSelect = vi.fn()
      render(<TenantSwitcher tenants={tenants} onChange={onChange} onSelect={onSelect} />)
      await userEvent.click(getTrigger())
      await userEvent.click(screen.getByText('Beta Inc'))
      expect(onChange).toHaveBeenCalledWith(tenants[1])
      expect(onSelect).not.toHaveBeenCalled()
    })
  })
})
