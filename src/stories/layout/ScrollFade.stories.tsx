import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollFade } from '../../components/scroll-fade/ScrollFade'
import { Button } from '../../components/button/Button'
import { Badge } from '../../components/badge/Badge'

/**
 * `ScrollFade` marks a horizontally scrollable strip as scrollable. The fade
 * shows only on the side where content is actually hidden, so a row that fits
 * looks untouched.
 */
const meta: Meta<typeof ScrollFade> = {
  title: 'Layout/ScrollFade',
  component: ScrollFade,
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<typeof ScrollFade>

const SECTIONS = [
  '總覽',
  '技術面',
  '籌碼面',
  '財報',
  '月營收',
  '法人動向',
  '融資融券',
  '同業比較',
  '事件與新聞',
  '量化評分',
  '回測',
]

/** Sub-navigation that outgrows narrow viewports — the common case. */
export const PillRow: Story = {
  render: () => (
    <div className="max-w-[420px] rounded-lg border p-2">
      <ScrollFade scrollClassName="pb-1">
        <div className="flex w-max gap-1">
          {SECTIONS.map((s, i) => (
            <Button
              key={s}
              variant={i === 0 ? 'primary' : 'ghost'}
              size="sm"
              className="rounded-full whitespace-nowrap"
            >
              {s}
            </Button>
          ))}
        </div>
      </ScrollFade>
    </div>
  ),
}

/**
 * Bleeding the scroll area past the container padding: the negative margin goes
 * on the outer box (`className`) and the padding on the scrolling element
 * (`scrollClassName`), so the fades stay aligned with the visible edges.
 */
export const FullBleed: Story = {
  render: () => (
    <div className="max-w-[420px] rounded-lg border px-6 py-4">
      <p className="text-muted-foreground mb-3 text-sm">Padded content sits at 24px.</p>
      <ScrollFade className="-mx-6" scrollClassName="px-6">
        <div className="flex w-max gap-2">
          {SECTIONS.map((s) => (
            <Badge key={s} variant="secondary" className="whitespace-nowrap">
              {s}
            </Badge>
          ))}
        </div>
      </ScrollFade>
    </div>
  ),
}

/** Content that fits gets no fade at all. */
export const NoOverflow: Story = {
  render: () => (
    <div className="max-w-[420px] rounded-lg border p-2">
      <ScrollFade>
        <div className="flex gap-1">
          {SECTIONS.slice(0, 3).map((s) => (
            <Button key={s} variant="ghost" size="sm" className="rounded-full">
              {s}
            </Button>
          ))}
        </div>
      </ScrollFade>
    </div>
  ),
}
