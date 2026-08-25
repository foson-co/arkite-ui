import { useMemo, useState } from 'react'
import {
  Badge,
  BulkActionBar,
  Button,
  DataTable,
  DeleteConfirmDialog,
  FilterBar,
  FilterBarActions,
  FilterBarFilters,
  FilterBarSearch,
  FilterSelect,
  PageHeader,
  ToastContainer,
  toast,
  type Column,
} from '../../index'

interface Order {
  id: number
  number: string
  customer: string
  status: 'paid' | 'pending' | 'refunded'
  amount: number
}

const STATUS_META: Record<
  Order['status'],
  { label: string; variant: 'success' | 'warning' | 'secondary' }
> = {
  paid: { label: 'Paid', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  refunded: { label: 'Refunded', variant: 'secondary' },
}

const INITIAL_ORDERS: Order[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  number: `ORD-${2100 + i}`,
  customer: ['Northwind', 'Acme Corp', 'Globex', 'Initech'][i % 4],
  status: (['paid', 'pending', 'refunded'] as const)[i % 3],
  amount: 1200 + i * 340,
}))

/**
 * Recipe: a complete CRUD list page.
 *
 * Composition: PageHeader → FilterBar (search + status filter) →
 * DataTable (sortable, selectable, paginated) → BulkActionBar appears on
 * selection → DeleteConfirmDialog guards the destructive action → toast
 * confirms the outcome. Search/filter state lives in the page; the
 * table's sorting and pagination stay uncontrolled (see the server-side
 * pagination recipe for the controlled variant).
 */
export function CrudListPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<Set<string | number>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (!status || o.status === status) &&
          (!search ||
            o.number.toLowerCase().includes(search.toLowerCase()) ||
            o.customer.toLowerCase().includes(search.toLowerCase()))
      ),
    [orders, search, status]
  )

  const columns: Column<Order>[] = [
    { key: 'number', header: 'Order', sortable: true },
    { key: 'customer', header: 'Customer', sortable: true },
    {
      key: 'status',
      header: 'Status',
      cell: (o) => (
        <Badge variant={STATUS_META[o.status].variant}>{STATUS_META[o.status].label}</Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortable: true,
      cell: (o) => <span className="tabular-nums">${o.amount.toLocaleString()}</span>,
    },
  ]

  const deleteSelected = () => {
    setOrders((prev) => prev.filter((o) => !selected.has(o.id)))
    toast.success('Orders deleted', { description: `${selected.size} orders removed.` })
    setSelected(new Set())
    setConfirmOpen(false)
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <PageHeader title="Orders" description="Search, filter, and manage customer orders." />

        <FilterBar>
          <FilterBarSearch placeholder="Search orders..." value={search} onChange={setSearch} />
          <FilterBarFilters>
            <FilterSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
                { value: 'refunded', label: 'Refunded' },
              ]}
            />
          </FilterBarFilters>
          <FilterBarActions>
            <Button size="sm">New order</Button>
          </FilterBarActions>
        </FilterBar>

        <DataTable
          data={filtered}
          columns={columns}
          getRowKey={(o) => o.id}
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
          defaultPageSize={10}
        />
      </div>

      <BulkActionBar selectedCount={selected.size} onClose={() => setSelected(new Set())}>
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          Delete selected
        </Button>
      </BulkActionBar>

      <DeleteConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteSelected}
        itemName={`${selected.size} orders`}
      />

      <ToastContainer />
    </div>
  )
}
