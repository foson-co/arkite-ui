import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  DataTable,
  PageHeader,
  Sparkline,
  StatCard,
  StatGroup,
  type Column,
} from '../../index'

interface Kpi {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  history: number[]
}

const KPIS: Kpi[] = [
  {
    label: 'Monthly revenue',
    value: '$48,290',
    change: '+8.2%',
    trend: 'up',
    history: [31, 34, 33, 37, 36, 40, 42, 41, 45, 48],
  },
  {
    label: 'Active users',
    value: '2,841',
    change: '+3.4%',
    trend: 'up',
    history: [21, 22, 24, 23, 25, 26, 26, 27, 28, 28],
  },
  {
    label: 'Conversion rate',
    value: '4.6%',
    change: '0.0%',
    trend: 'neutral',
    history: [4.5, 4.7, 4.6, 4.5, 4.6, 4.7, 4.6, 4.6, 4.5, 4.6],
  },
  {
    label: 'Deploy frequency',
    value: '18/wk',
    change: '-5.1%',
    trend: 'down',
    history: [24, 23, 25, 22, 21, 22, 20, 19, 19, 18],
  },
]

interface ServiceTrend {
  name: string
  requests: string
  history: number[]
}

const SERVICE_TRENDS: ServiceTrend[] = [
  { name: 'gateway', requests: '1.2M', history: [40, 42, 45, 44, 48, 52, 55, 58, 57, 62] },
  { name: 'billing', requests: '384K', history: [22, 21, 23, 22, 24, 23, 25, 24, 26, 25] },
  { name: 'auth', requests: '917K', history: [50, 48, 47, 49, 46, 44, 45, 42, 41, 39] },
  { name: 'reports', requests: '128K', history: [8, 9, 8, 10, 11, 10, 12, 13, 12, 14] },
]

interface Activity {
  id: number
  actor: string
  action: string
  target: string
  status: 'success' | 'failed'
  time: string
}

const RECENT_ACTIVITY: Activity[] = [
  {
    id: 1,
    actor: 'mira',
    action: 'deployed',
    target: 'gateway v2.14.0',
    status: 'success',
    time: '2 min ago',
  },
  {
    id: 2,
    actor: 'jonas',
    action: 'updated env',
    target: 'billing / staging',
    status: 'success',
    time: '11 min ago',
  },
  {
    id: 3,
    actor: 'ci-bot',
    action: 'deployed',
    target: 'auth v1.9.3',
    status: 'failed',
    time: '24 min ago',
  },
  {
    id: 4,
    actor: 'sofia',
    action: 'invited',
    target: 'lee@acme.dev',
    status: 'success',
    time: '1 hr ago',
  },
  {
    id: 5,
    actor: 'ci-bot',
    action: 'deployed',
    target: 'reports v0.8.1',
    status: 'success',
    time: '2 hrs ago',
  },
  {
    id: 6,
    actor: 'mira',
    action: 'rotated key',
    target: 'webhooks',
    status: 'success',
    time: '3 hrs ago',
  },
]

const ACTIVITY_COLUMNS: Column<Activity>[] = [
  { key: 'actor', header: 'Actor' },
  {
    key: 'action',
    header: 'Event',
    cell: (a) => (
      <span>
        {a.action} <span className="text-muted-foreground">{a.target}</span>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (a) => (
      <Badge variant={a.status === 'success' ? 'success' : 'destructive'}>{a.status}</Badge>
    ),
  },
  {
    key: 'time',
    header: 'When',
    align: 'right',
    cell: (a) => <span className="text-muted-foreground">{a.time}</span>,
  },
]

/**
 * Recipe: a dashboard overview page.
 *
 * Information hierarchy top-down: PageHeader → StatGroup of StatCards
 * (the at-a-glance KPI row, each pairing trend text with a Sparkline in
 * the icon slot) → detail widgets in compact Cards — a recent-activity
 * DataTable and a per-service trend list. Sparklines next to redundant
 * trend text stay decorative (no aria-label); the standalone ones in the
 * service list carry one because they are the only trend signal.
 */
export function DashboardPage() {
  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <PageHeader
          size="lg"
          title="Overview"
          description="Key metrics and activity across all services."
        />

        <StatGroup columns={4}>
          {KPIS.map((kpi) => (
            <StatCard
              key={kpi.label}
              variant="bordered"
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              trend={kpi.trend}
              icon={<Sparkline data={kpi.history} trend={kpi.trend} />}
            />
          ))}
        </StatGroup>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card density="compact" className="lg:col-span-2">
            <CardHeader
              title="Recent activity"
              description="Latest changes across the workspace."
              headingLevel={2}
            />
            {/* The Card already frames this section, so the table drops its
                own border rather than stacking a second one inside it. */}
            <CardContent>
              <DataTable
                data={RECENT_ACTIVITY}
                columns={ACTIVITY_COLUMNS}
                getRowKey={(a) => a.id}
                pagination={false}
                bordered={false}
              />
            </CardContent>
          </Card>

          <Card density="compact">
            <CardHeader title="Requests by service" description="Last 10 days." headingLevel={2} />
            <CardContent>
              <ul className="divide-y">
                {SERVICE_TRENDS.map((service) => (
                  <li
                    key={service.name}
                    className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium">{service.name}</span>
                    <Sparkline
                      data={service.history}
                      aria-label={`${service.name} 10-day request trend`}
                    />
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {service.requests}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
