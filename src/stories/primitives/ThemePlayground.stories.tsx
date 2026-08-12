import { useState, useCallback, useMemo } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import {
  themePresets,
  applyTheme,
  applyDarkTheme,
  createTheme,
  themeToCSS,
  type ThemePresetName,
  type ThemePreset,
} from '../../theme'
import { contrastRatio, hslLuminance, WCAG_AA } from '../../theme/contrast'
import { Button } from '../../components/button'
import { CopyButton } from '../../components/copy-button'
import { Badge } from '../../components/badge'
import { Card, CardHeader, CardContent } from '../../components/card'
import { Input } from '../../components/input'
import { Alert } from '../../components/alert'
import { Switch } from '../../components/switch'
import { Checkbox } from '../../components/checkbox'
import { Progress } from '../../components/progress'
import { Spinner } from '../../components/spinner'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/tabs'
import { StatusDot } from '../../components/status-dot'
import { Kbd } from '../../components/kbd'
import { InlineCode } from '../../components/inline-code'
import { Skeleton } from '../../components/skeleton'
import { Divider } from '../../components/divider'

const meta: Meta = {
  title: 'Foundation/Theme Playground',
  parameters: { layout: 'fullscreen' },
}

export default meta

/* ─── Section wrapper ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

/* ─── Color token swatch ─── */
function TokenSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 shrink-0 rounded-md border"
        style={{ backgroundColor: `hsl(var(--${cssVar}))` }}
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{name}</p>
        <p className="text-muted-foreground truncate text-xs">--{cssVar}</p>
      </div>
    </div>
  )
}

/* ─── WCAG readout for one token pair ─── */
function ContrastRow({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  const ratio = contrastRatio(hslLuminance(bg), hslLuminance(fg))
  const passes = ratio >= WCAG_AA
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="font-mono tabular-nums">{ratio.toFixed(2)}:1</span>
        <Badge variant={passes ? 'success' : 'destructive'} size="sm">
          {passes ? 'AA' : 'fails AA'}
        </Badge>
      </span>
    </div>
  )
}

/* ─── Main Playground ─── */
function Playground() {
  const [preset, setPreset] = useState<ThemePresetName>('default')
  const [isDark, setIsDark] = useState(false)
  const [customName, setCustomName] = useState('my-brand')
  const [customPrimary, setCustomPrimary] = useState('#FF6B00')
  const [customAccent, setCustomAccent] = useState('#00B4D8')
  const [customRadius, setCustomRadius] = useState('0.5rem')
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(themePresets.default)
  const [showCSS, setShowCSS] = useState(false)

  const apply = useCallback((theme: ThemePreset, dark: boolean) => {
    setActiveTheme(theme)
    document.documentElement.classList.toggle('dark', dark)
    if (dark) {
      applyDarkTheme(theme)
    } else {
      applyTheme(theme)
    }
  }, [])

  const handlePreset = (name: ThemePresetName) => {
    setPreset(name)
    apply(themePresets[name], isDark)
  }

  const handleDark = (dark: boolean) => {
    setIsDark(dark)
    apply(activeTheme, dark)
  }

  /** The four values a consuming repo commits — everything else is derived from them. */
  const themeSource = useMemo(
    () => ({
      name: customName,
      primary: customPrimary,
      accent: customAccent,
      radius: customRadius,
    }),
    [customName, customPrimary, customAccent, customRadius]
  )
  const customTheme = useMemo(() => createTheme(themeSource), [themeSource])
  const themeJson = useMemo(() => `${JSON.stringify(themeSource, null, 2)}\n`, [themeSource])

  const handleCustomApply = () => {
    setPreset('default') // deselect preset buttons
    apply(customTheme, isDark)
  }

  const cssOutput = themeToCSS(activeTheme)

  return (
    <div className="bg-background text-foreground min-h-screen transition-colors">
      {/* ─── Toolbar ─── */}
      <div className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-3">
          <span className="text-sm font-semibold">Theme Playground</span>
          <Divider orientation="vertical" className="h-6" />

          {/* Preset buttons */}
          <div className="flex gap-1.5">
            {(Object.keys(themePresets) as ThemePresetName[]).map((name) => (
              <Button
                key={name}
                variant={preset === name ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePreset(name)}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Button>
            ))}
          </div>

          <Divider orientation="vertical" className="h-6" />

          {/* Dark mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">Dark</span>
            <Switch
              checked={isDark}
              onChange={(e) => handleDark(e.target.checked)}
              aria-label="Dark mode"
            />
          </div>

          <Divider orientation="vertical" className="h-6" />

          {/* Show CSS toggle */}
          <Button
            variant={showCSS ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowCSS(!showCSS)}
          >
            {showCSS ? 'Hide CSS' : 'Show CSS'}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        {/* ─── Custom Theme Creator ─── */}
        <Section title="Create Custom Theme">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label
                htmlFor="theme-name"
                className="text-foreground mb-1 block text-xs font-medium"
              >
                Name
              </label>
              <Input
                id="theme-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-36"
              />
            </div>
            <div>
              <label
                htmlFor="theme-primary-color"
                className="text-foreground mb-1 block text-xs font-medium"
              >
                Primary
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="theme-primary-color"
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border"
                  aria-label="Primary color picker"
                />
                <Input
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-24"
                  aria-label="Primary hex"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="theme-accent-color"
                className="text-foreground mb-1 block text-xs font-medium"
              >
                Accent
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="theme-accent-color"
                  type="color"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border"
                  aria-label="Accent color picker"
                />
                <Input
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  className="w-24"
                  aria-label="Accent hex"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="theme-radius"
                className="text-foreground mb-1 block text-xs font-medium"
              >
                Radius
              </label>
              <select
                id="theme-radius"
                value={customRadius}
                onChange={(e) => setCustomRadius(e.target.value)}
                className="border-input bg-background h-9 rounded-md border px-2 text-sm"
                aria-label="Border radius"
              >
                <option value="0">0</option>
                <option value="0.25rem">0.25rem</option>
                <option value="0.375rem">0.375rem</option>
                <option value="0.5rem">0.5rem</option>
                <option value="0.75rem">0.75rem</option>
                <option value="1rem">1rem</option>
              </select>
            </div>
            <Button onClick={handleCustomApply}>Apply</Button>
          </div>
        </Section>

        {/* ─── Theme artifact ─── */}
        <Section title="Theme Artifact">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  <InlineCode>arkite.theme.json</InlineCode>
                </p>
                <CopyButton value={themeJson} size="sm" variant="outline" />
              </div>
              <pre className="bg-muted overflow-auto rounded-md border p-4 text-xs">
                {themeJson}
              </pre>
              <p className="text-muted-foreground text-xs">
                Commit this file in the consuming repo and feed it to{' '}
                <InlineCode>createTheme()</InlineCode> at startup. Four values, reviewable in a diff
                — a brand change stops being CSS copied between projects.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Contrast check (WCAG AA ≥ {WCAG_AA}:1)</p>
              <div className="space-y-2 rounded-md border p-4">
                <ContrastRow
                  label="Light · primary / on-primary"
                  bg={customTheme.light.primary}
                  fg={customTheme.light['primary-foreground']}
                />
                <ContrastRow
                  label="Light · accent / on-accent"
                  bg={customTheme.light.accent}
                  fg={customTheme.light['accent-foreground']}
                />
                <ContrastRow
                  label="Dark · primary / on-primary"
                  bg={customTheme.dark.primary}
                  fg={customTheme.dark['primary-foreground']}
                />
                <ContrastRow
                  label="Dark · accent / on-accent"
                  bg={customTheme.dark.accent}
                  fg={customTheme.dark['accent-foreground']}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Foregrounds are picked automatically, so a failing row means the brand hue itself
                sits in the danger zone — adjust lightness until light and dark both pass, before
                the theme ships.
              </p>
            </div>
          </div>
        </Section>

        {/* ─── CSS Output ─── */}
        {showCSS && (
          <Section title="Generated CSS">
            <div className="flex justify-end">
              <CopyButton value={cssOutput} size="sm" variant="outline" />
            </div>
            <pre className="bg-muted max-h-64 overflow-auto rounded-md border p-4 text-xs">
              {cssOutput}
            </pre>
          </Section>
        )}

        {/* ─── Color Tokens ─── */}
        <Section title="Color Tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <TokenSwatch name="Primary" cssVar="primary" />
            <TokenSwatch name="Primary FG" cssVar="primary-foreground" />
            <TokenSwatch name="Secondary" cssVar="secondary" />
            <TokenSwatch name="Accent" cssVar="accent" />
            <TokenSwatch name="Destructive" cssVar="destructive" />
            <TokenSwatch name="Success" cssVar="success" />
            <TokenSwatch name="Warning" cssVar="warning" />
            <TokenSwatch name="Background" cssVar="background" />
            <TokenSwatch name="Foreground" cssVar="foreground" />
            <TokenSwatch name="Muted" cssVar="muted" />
            <TokenSwatch name="Muted FG" cssVar="muted-foreground" />
            <TokenSwatch name="Card" cssVar="card" />
            <TokenSwatch name="Border" cssVar="border" />
            <TokenSwatch name="Input" cssVar="input" />
            <TokenSwatch name="Ring" cssVar="ring" />
          </div>
        </Section>

        {/* ─── Buttons ─── */}
        <Section title="Buttons">
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* ─── Badges ─── */}
        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        {/* ─── Form Controls ─── */}
        <Section title="Form Controls">
          <div className="flex flex-wrap items-center gap-6">
            <Input placeholder="Text input..." className="w-48" aria-label="Sample text input" />
            <div className="flex items-center gap-2">
              <Checkbox id="playground-cb" defaultChecked />
              <label htmlFor="playground-cb" className="text-sm">
                Checkbox
              </label>
            </div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked aria-label="Sample switch" />
              <span className="text-sm">Switch</span>
            </div>
          </div>
        </Section>

        {/* ─── Feedback ─── */}
        <Section title="Feedback">
          <div className="grid gap-3 sm:grid-cols-2">
            <Alert variant="info">Informational message</Alert>
            <Alert variant="success">Success message</Alert>
            <Alert variant="warning">Warning message</Alert>
            <Alert variant="destructive">Error message</Alert>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-48">
              <Progress value={65} aria-label="Sample progress" />
            </div>
            <div className="flex items-center gap-3">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </div>
        </Section>

        {/* ─── Status & Indicators ─── */}
        <Section title="Status & Indicators">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <StatusDot status="online" />
              <span className="text-sm">Online</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot status="busy" />
              <span className="text-sm">Busy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot status="away" />
              <span className="text-sm">Away</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusDot status="offline" />
              <span className="text-sm">Offline</span>
            </div>
            <Kbd>Ctrl+K</Kbd>
            <InlineCode>npm install @arkite-ui/core</InlineCode>
          </div>
        </Section>

        {/* ─── Tabs ─── */}
        <Section title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-muted-foreground text-sm">
                Overview tab content with theme-aware styling.
              </p>
            </TabsContent>
            <TabsContent value="analytics">
              <p className="text-muted-foreground text-sm">Analytics content goes here.</p>
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-muted-foreground text-sm">Settings content goes here.</p>
            </TabsContent>
          </Tabs>
        </Section>

        {/* ─── Cards ─── */}
        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <h4 className="font-semibold">Default Card</h4>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Card content with muted text and themed border.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h4 className="font-semibold">With Badge</h4>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="text-muted-foreground text-sm">Status indicator</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h4 className="font-semibold">Loading State</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  )
}

export const Default: StoryFn = () => <Playground />
