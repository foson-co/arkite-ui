import { useEffect, useState } from 'react'
import {
  Badge,
  DataTable,
  PageHeader,
  useServerTable,
  type Column,
  type ServerTableQuery,
} from '../../index'

interface Deployment {
  id: number
  service: string
  environment: 'production' | 'staging'
  status: 'success' | 'failed' | 'running'
  duration: number
}

const STATUS_META: Record<
  Deployment['status'],
  { label: string; variant: 'success' | 'destructive' | 'info' }
> = {
  success: { label: 'Success', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  running: { label: 'Running', variant: 'info' },
}

// ─── Mock server ───────────────────────────────────────────────────────
// Stands in for a real API: sorting and slicing happen HERE, not in the
// table. Replace with your endpoint, keeping the same page/sort inputs.

const DB: Deployment[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  service: ['gateway', 'billing', 'auth', 'reports', 'webhooks'][i % 5],
  environment: i % 3 === 0 ? 'staging' : 'production',
  status: (['success', 'success', 'running', 'failed'] as const)[i % 4],
  duration: 40 + ((i * 37) % 300),
}))

interface PageResult {
  rows: Deployment[]
  total: number
}

function fetchDeployments({ page, pageSize, sort }: ServerTableQuery): Promise<PageResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...DB]
      if (sort?.direction) {
        sorted.sort((a, b) => {
          const aValue = a[sort.key as keyof Deployment]
          const bValue = b[sort.key as keyof Deployment]
          if (aValue === bValue) return 0
          const comparison = aValue < bValue ? -1 : 1
          return sort.direction === 'asc' ? comparison : -comparison
        })
      }
      const start = (page - 1) * pageSize
      resolve({ rows: sorted.slice(start, start + pageSize), total: DB.length })
    }, 300)
  })
}

// ─── Page ──────────────────────────────────────────────────────────────

/**
 * Recipe: a fully server-driven table.
 *
 * `useServerTable` owns the query state — page, page size, sort, filters —
 * and hands DataTable its six controlled props via `{...table.props}`.
 * The page just fetches whenever `table.query` changes and passes the
 * slice back with `totalRows`. Sort and page-size changes reset to page 1
 * automatically (page N of a re-sorted result set is a different page N).
 */
export function ServerSideTable() {
  const table = useServerTable({ initialPageSize: 10 })
  const [rows, setRows] = useState<Deployment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchDeployments(table.query).then((result) => {
      if (cancelled) return // a newer request superseded this one
      setRows(result.rows)
      setTotal(result.total)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [table.query])

  const columns: Column<Deployment>[] = [
    { key: 'service', header: 'Service', sortable: true },
    {
      key: 'environment',
      header: 'Environment',
      cell: (d) => (
        <Badge variant={d.environment === 'production' ? 'default' : 'secondary'}>
          {d.environment}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (d) => (
        <Badge variant={STATUS_META[d.status].variant}>{STATUS_META[d.status].label}</Badge>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      align: 'right',
      sortable: true,
      cell: (d) => <span className="tabular-nums">{d.duration}s</span>,
    },
  ]

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <PageHeader
          title="Deployments"
          description="Sorting and pagination round-trip to the server."
          badge={total > 0 ? <Badge variant="secondary">{total} total</Badge> : undefined}
        />

        <DataTable
          data={rows}
          columns={columns}
          getRowKey={(d) => d.id}
          loading={loading}
          totalRows={total}
          {...table.props}
        />
      </div>
    </div>
  )
}
