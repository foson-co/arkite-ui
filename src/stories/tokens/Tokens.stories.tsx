import type { Meta, StoryFn } from '@storybook/react-vite'
import {
  colors,
  primitives,
  spacing,
  radius,
  fontSize,
  lineHeight,
  fontWeight,
  type SemanticColors,
  type ColorScheme,
} from '../../tokens'

const meta: Meta = {
  title: 'Foundation/Design Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Visual review surface for `@arkite-ui/core/tokens`. Use this page to validate color choices, contrast ratios, and scale values before approving the token system.',
      },
    },
    a11y: {
      config: {
        // This page IS the contrast audit: it renders every token pair —
        // including failing ones, sorted worst-first — and reports exact
        // WCAG ratios. Letting axe re-flag the exhibits would make the
        // audit surface untestable; regressions are reviewed here visually.
        rules: [{ id: 'color-contrast', enabled: false }],
      },
    },
  },
}

export default meta

// --- Contrast helpers (WCAG 2.1) ---

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

function wcagGrade(ratio: number): { grade: string; color: string } {
  if (ratio >= 7) return { grade: 'AAA', color: '#15803d' }
  if (ratio >= 4.5) return { grade: 'AA', color: '#15803d' }
  if (ratio >= 3) return { grade: 'AA Large', color: '#b45309' }
  return { grade: 'FAIL', color: '#dc2626' }
}

// --- Layout primitives (don't depend on the rest of the library) ---

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4, color: '#111827' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>{subtitle}</p>}
      {children}
    </section>
  )
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 32,
        background: '#fafafa',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {children}
    </div>
  )
}

// --- Semantic color swatch with contrast info ---

interface SemanticPair {
  label: string
  bg: keyof SemanticColors
  fg: keyof SemanticColors
}

const STATUS_PAIRS: SemanticPair[] = [
  { label: 'primary', bg: 'primary', fg: 'primaryForeground' },
  { label: 'secondary', bg: 'secondary', fg: 'secondaryForeground' },
  { label: 'accent', bg: 'accent', fg: 'accentForeground' },
  { label: 'success', bg: 'success', fg: 'successForeground' },
  { label: 'warning', bg: 'warning', fg: 'warningForeground' },
  { label: 'danger', bg: 'danger', fg: 'dangerForeground' },
  { label: 'info', bg: 'info', fg: 'infoForeground' },
]

const SURFACE_PAIRS: SemanticPair[] = [
  { label: 'background / foreground', bg: 'background', fg: 'foreground' },
  { label: 'card / cardForeground', bg: 'card', fg: 'cardForeground' },
  { label: 'muted / mutedForeground', bg: 'muted', fg: 'mutedForeground' },
]

function PairSwatch({ pair, scheme }: { pair: SemanticPair; scheme: ColorScheme }) {
  const palette = colors[scheme]
  const bg = palette[pair.bg]
  const fg = palette[pair.fg]
  const ratio = contrastRatio(fg, bg)
  const grade = wcagGrade(ratio)

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      <div
        style={{
          background: bg,
          color: fg,
          padding: '20px 16px',
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16 }}>{pair.label}</div>
        <div style={{ fontSize: 12 }}>The quick brown fox jumps over the lazy dog</div>
      </div>
      <div
        style={{
          padding: '8px 12px',
          background: '#fff',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          color: '#6b7280',
        }}
      >
        <div>
          <div>bg {bg}</div>
          <div>fg {fg}</div>
        </div>
        <div
          style={{
            background: grade.color,
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontWeight: 600,
            fontSize: 11,
          }}
          title={`${ratio.toFixed(2)}:1 contrast ratio`}
        >
          {grade.grade} · {ratio.toFixed(2)}
        </div>
      </div>
    </div>
  )
}

function SchemeColumn({ scheme, pairs }: { scheme: ColorScheme; pairs: SemanticPair[] }) {
  return (
    <div>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: '#6b7280',
          marginBottom: 12,
        }}
      >
        {scheme}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {pairs.map((pair) => (
          <PairSwatch key={`${scheme}-${pair.label}`} pair={pair} scheme={scheme} />
        ))}
      </div>
    </div>
  )
}

// --- Borders / form / ring tokens ---

function FormTokens({ scheme }: { scheme: ColorScheme }) {
  const c = colors[scheme]
  return (
    <div
      style={{
        background: c.background,
        padding: 20,
        borderRadius: 8,
        border: `1px solid ${c.border}`,
      }}
    >
      <div style={{ fontSize: 12, color: c.mutedForeground, marginBottom: 8 }}>
        {scheme} · form surfaces
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div
          style={{
            background: c.background,
            color: c.foreground,
            border: `1px solid ${c.input}`,
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 14,
          }}
        >
          Input field
        </div>
        <div
          style={{
            background: c.background,
            color: c.foreground,
            border: `2px solid ${c.ring}`,
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 14,
          }}
        >
          Focused (ring)
        </div>
        <div
          style={{
            color: c.mutedForeground,
            padding: '8px 12px',
            fontSize: 14,
          }}
        >
          Muted helper text
        </div>
      </div>
    </div>
  )
}

// --- Primitive scale row ---

function PrimitiveRow({ name, scale }: { name: string; scale: Record<string, string> }) {
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#374151' }}>{name}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {shades.map((shade) => {
          const value = scale[shade]
          const ratio = contrastRatio(value, '#ffffff')
          const textColor = ratio >= 3 ? '#fff' : '#111'
          return (
            <div
              key={shade}
              style={{
                background: value,
                color: textColor,
                padding: 8,
                fontSize: 10,
                fontFamily: 'ui-monospace, monospace',
                width: 64,
                textAlign: 'center',
                borderRadius: 4,
              }}
              title={value}
            >
              <div style={{ fontWeight: 600 }}>{shade}</div>
              <div style={{ opacity: 0.85, marginTop: 2 }}>{value.replace('#', '')}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Stories ---

export const SemanticColors_Status: StoryFn = () => (
  <PageFrame>
    <Section
      title="Status colors — light vs dark"
      subtitle="Each swatch shows background + foreground pair with WCAG 2.1 contrast ratio. AA = 4.5 ✓, AA Large = 3.0 (large text only), AAA = 7.0."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <SchemeColumn scheme="light" pairs={STATUS_PAIRS} />
        <SchemeColumn scheme="dark" pairs={STATUS_PAIRS} />
      </div>
    </Section>
  </PageFrame>
)

export const SemanticColors_Surfaces: StoryFn = () => (
  <PageFrame>
    <Section
      title="Surface colors — light vs dark"
      subtitle="Background, card, and muted pairs. Watch out: muted/mutedForeground on small body text needs 4.5:1 ratio."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <SchemeColumn scheme="light" pairs={SURFACE_PAIRS} />
        <SchemeColumn scheme="dark" pairs={SURFACE_PAIRS} />
      </div>
    </Section>

    <Section title="Form & focus tokens" subtitle="Input borders, focus ring, helper text density.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <FormTokens scheme="light" />
        <FormTokens scheme="dark" />
      </div>
    </Section>
  </PageFrame>
)

export const Primitives_AllScales: StoryFn = () => (
  <PageFrame>
    <Section
      title="Primitive color scales"
      subtitle="Reference only — these are the building blocks. Always prefer semantic tokens in product code."
    >
      {(['gray', 'green', 'blue', 'red', 'amber', 'purple', 'teal'] as const).map((name) => (
        <PrimitiveRow key={name} name={name} scale={primitives[name]} />
      ))}
    </Section>
  </PageFrame>
)

// --- Spacing scale ---

export const Scales_Spacing: StoryFn = () => (
  <PageFrame>
    <Section
      title="Spacing scale"
      subtitle="Tailwind 4px base unit. Numeric values work directly in React Native StyleSheet."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.entries(spacing).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
            <div
              style={{
                width: 60,
                fontFamily: 'ui-monospace, monospace',
                color: '#6b7280',
                textAlign: 'right',
              }}
            >
              spacing[{key}]
            </div>
            <div
              style={{
                width: 60,
                fontFamily: 'ui-monospace, monospace',
                color: '#374151',
              }}
            >
              {value}px
            </div>
            <div style={{ background: '#9333ea', height: 16, width: value }} />
          </div>
        ))}
      </div>
    </Section>
  </PageFrame>
)

// --- Radius scale ---

export const Scales_Radius: StoryFn = () => (
  <PageFrame>
    <Section title="Border radius scale">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {Object.entries(radius).map(([key, value]) => (
          <div key={key} style={{ textAlign: 'center' }}>
            <div
              style={{
                background: '#9333ea',
                width: 96,
                height: 96,
                borderRadius: value,
                marginBottom: 8,
              }}
            />
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#374151' }}>
              radius.{key}
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{value}px</div>
          </div>
        ))}
      </div>
    </Section>
  </PageFrame>
)

// --- Typography scale ---

export const Scales_Typography: StoryFn = () => (
  <PageFrame>
    <Section title="Font sizes">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(fontSize).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div
              style={{
                width: 100,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'right',
              }}
            >
              fontSize.{key}
            </div>
            <div
              style={{
                width: 60,
                fontSize: 12,
                color: '#374151',
                fontFamily: 'ui-monospace, monospace',
              }}
            >
              {value}px
            </div>
            <div style={{ fontSize: value, color: '#111827', lineHeight: 1.2 }}>
              The quick brown fox
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section
      title="Line heights"
      subtitle="Unitless multipliers. Multiply by font size to get pixel value."
    >
      {Object.entries(lineHeight).map(([key, value]) => (
        <div
          key={key}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 6,
            padding: 12,
            marginBottom: 8,
            background: '#fff',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: '#6b7280',
              marginBottom: 4,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            lineHeight.{key} = {value}
          </div>
          <div style={{ fontSize: 14, lineHeight: value, color: '#111827' }}>
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
            How vexingly quick daft zebras jump.
          </div>
        </div>
      ))}
    </Section>

    <Section title="Font weights">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(fontWeight).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div
              style={{
                width: 140,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 12,
                color: '#6b7280',
                textAlign: 'right',
              }}
            >
              fontWeight.{key}
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: value as React.CSSProperties['fontWeight'],
                color: '#111827',
              }}
            >
              The quick brown fox ({value})
            </div>
          </div>
        ))}
      </div>
    </Section>
  </PageFrame>
)

// --- Contrast audit ---

interface ContrastRow {
  scheme: ColorScheme
  label: string
  fg: string
  bg: string
  ratio: number
  grade: ReturnType<typeof wcagGrade>
}

function buildContrastRows(): ContrastRow[] {
  const rows: ContrastRow[] = []
  for (const scheme of ['light', 'dark'] as const) {
    for (const pair of [...STATUS_PAIRS, ...SURFACE_PAIRS]) {
      const fg = colors[scheme][pair.fg]
      const bg = colors[scheme][pair.bg]
      const ratio = contrastRatio(fg, bg)
      rows.push({
        scheme,
        label: pair.label,
        fg,
        bg,
        ratio,
        grade: wcagGrade(ratio),
      })
    }
  }
  return rows.sort((a, b) => a.ratio - b.ratio)
}

export const ContrastAudit: StoryFn = () => {
  const rows = buildContrastRows()
  const fails = rows.filter((r) => r.grade.grade === 'FAIL' || r.grade.grade === 'AA Large')

  return (
    <PageFrame>
      <Section
        title="Contrast audit"
        subtitle={`All semantic foreground/background pairs, sorted by WCAG 2.1 contrast ratio (lowest first). ${fails.length} pair${fails.length === 1 ? '' : 's'} need attention.`}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Scheme</th>
              <th style={{ padding: 8 }}>Pair</th>
              <th style={{ padding: 8 }}>FG</th>
              <th style={{ padding: 8 }}>BG</th>
              <th style={{ padding: 8 }}>Ratio</th>
              <th style={{ padding: 8 }}>Grade</th>
              <th style={{ padding: 8 }}>Sample</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', color: '#6b7280' }}>
                  {row.scheme}
                </td>
                <td style={{ padding: 8 }}>{row.label}</td>
                <td
                  style={{
                    padding: 8,
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 11,
                    color: '#6b7280',
                  }}
                >
                  {row.fg}
                </td>
                <td
                  style={{
                    padding: 8,
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 11,
                    color: '#6b7280',
                  }}
                >
                  {row.bg}
                </td>
                <td style={{ padding: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                  {row.ratio.toFixed(2)}
                </td>
                <td style={{ padding: 8 }}>
                  <span
                    style={{
                      background: row.grade.color,
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {row.grade.grade}
                  </span>
                </td>
                <td style={{ padding: 8 }}>
                  <span
                    style={{
                      background: row.bg,
                      color: row.fg,
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 12,
                    }}
                  >
                    Sample text
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </PageFrame>
  )
}
