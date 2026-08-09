import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable, type Column } from '../../components/data-table/DataTable'
import { Card, CardHeader, CardContent } from '../../components/card/Card'

/**
 * Wide tables — the failure mode that `minWidth` exists to prevent.
 *
 * `table { width: 100% }` with auto layout shrinks columns to their min-content
 * width *before* it overflows. Dense financial tables (many columns) and CJK
 * headers (which break between characters, so min-content is one glyph) hit
 * this hard: columns collapse to ~30px, headers stack vertically, and
 * `Column.pinned` never engages because the table technically "fits".
 */
const meta: Meta<typeof DataTable> = {
  title: 'Data Display/DataTable/Wide',
  component: DataTable,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof DataTable>

interface Holding {
  ticker: string
  name: string
  foreign: number
  trust: number
  dealer: number
  total: number
  amount: string
  close: number
}

const holdings: Holding[] = [
  { ticker: '2330', name: '台積電', foreign: 12345, trust: -6789, dealer: 1024, total: 6580, amount: '1.23 億', close: 1085 },
  { ticker: '2454', name: '聯發科', foreign: 8420, trust: 2130, dealer: -540, total: 10010, amount: '9.80 千萬', close: 1420 },
  { ticker: '2317', name: '鴻海', foreign: -4210, trust: 980, dealer: 320, total: -2910, amount: '-4.55 千萬', close: 205 },
  { ticker: '2882', name: '國泰金', foreign: 3105, trust: -220, dealer: 45, total: 2930, amount: '1.90 千萬', close: 62 },
  { ticker: '00940', name: '元大臺灣價值高息', foreign: 15200, trust: 4300, dealer: -1200, total: 18300, amount: '2.10 億', close: 9.8 },
]

const money = (v: number) => (
  <span className={`font-mono ${v >= 0 ? 'text-success' : 'text-destructive'}`}>
    {v.toLocaleString()}
  </span>
)

const columns: Column<Holding>[] = [
  { key: 'ticker', header: '代號', pinned: 'left', cell: (r) => <span className="font-mono font-medium">{r.ticker}</span> },
  { key: 'name', header: '名稱' },
  { key: 'foreign', header: '外資 (張)', align: 'right', cell: (r) => money(r.foreign) },
  { key: 'trust', header: '投信 (張)', align: 'right', cell: (r) => money(r.trust) },
  { key: 'dealer', header: '自營商 (張)', align: 'right', cell: (r) => money(r.dealer) },
  { key: 'total', header: '三大法人合計 (張)', align: 'right', cell: (r) => money(r.total) },
  { key: 'amount', header: '外資估算金額', align: 'right', cell: (r) => <span className="font-mono">{r.amount}</span> },
  { key: 'close', header: '最新收盤', align: 'right', cell: (r) => <span className="text-muted-foreground font-mono">{r.close}</span> },
]

/**
 * The fix: declare the width the table needs to stay readable. Below it the
 * wrapper scrolls, the pinned 代號 column freezes, and edge fades advertise the
 * hidden columns (on automatically with `minWidth`).
 */
export const WithMinWidth: Story = {
  name: 'Wide table (minWidth + pinned)',
  render: () => (
    <div className="max-w-[560px]">
      <DataTable
        columns={columns}
        data={holdings}
        getRowKey={(r) => r.ticker}
        minWidth={840}
        pagination={false}
        compact
      />
    </div>
  ),
}

/**
 * Anti-pattern, kept as the visual diff: the same table without `minWidth`.
 * Every column squeezes to min-content, the header row triples in height, and
 * the pinned column is inert.
 */
export const SquashedWithoutMinWidth: Story = {
  name: 'Anti-pattern: no minWidth',
  render: () => (
    <div className="max-w-[560px]">
      <DataTable
        columns={columns}
        data={holdings}
        getRowKey={(r) => r.ticker}
        pagination={false}
        compact
      />
    </div>
  ),
}

/**
 * A titled wide table. `DataTable` already draws its own bordered surface, so
 * the Card here exists only to carry the header: `padding="none"`, a
 * padding-free `CardContent`, and `bordered={false}` on the table so the two
 * frames don't stack. Leaving the table bordered logs a dev-only warning.
 */
export const InsideACard: Story = {
  name: 'With a card header',
  render: () => (
    <div className="max-w-[560px]">
      <Card padding="none">
        <CardHeader title="台股法人榜" description="最近 5 個交易日累計" />
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={holdings}
            getRowKey={(r) => r.ticker}
            minWidth={840}
            pagination={false}
            compact
            bordered={false}
            className="border-t"
          />
        </CardContent>
      </Card>
    </div>
  ),
}
