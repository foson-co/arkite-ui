import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import {
  themePresets,
  applyTheme,
  applyDarkTheme,
  createTheme,
  type ThemePresetName,
  type ThemePreset,
} from '../../theme'
import { Button } from '../../components/button'
import { Badge } from '../../components/badge'
import { Card, CardHeader, CardContent } from '../../components/card'
import { Input } from '../../components/input'
import { Alert } from '../../components/alert'

const meta: Meta = {
  title: 'Foundation/Theme Presets',
  parameters: { layout: 'padded' },
}

export default meta

function ColorSwatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md border ${className}`} />
      <span className="text-muted-foreground text-sm">{label}</span>
    </div>
  )
}

function ThemeDemo({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{name}</h3>

      <div className="grid grid-cols-4 gap-4">
        <ColorSwatch label="Primary" className="bg-primary" />
        <ColorSwatch label="Secondary" className="bg-secondary" />
        <ColorSwatch label="Accent" className="bg-accent" />
        <ColorSwatch label="Destructive" className="bg-destructive" />
        <ColorSwatch label="Success" className="bg-success" />
        <ColorSwatch label="Warning" className="bg-warning" />
        <ColorSwatch label="Muted" className="bg-muted" />
        <ColorSwatch label="Card" className="bg-card" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Error</Badge>
        <Badge variant="info">Info</Badge>
      </div>

      <div className="max-w-sm">
        <Input placeholder="Input field..." />
      </div>

      <Card className="max-w-sm">
        <CardHeader>
          <h4 className="font-semibold">Card Title</h4>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Card content with muted text.</p>
        </CardContent>
      </Card>

      <Alert variant="info">This is an informational alert.</Alert>
    </div>
  )
}

const PresetsDemo = () => {
  const [current, setCurrent] = useState<ThemePresetName>('default')
  const [isDark, setIsDark] = useState(false)

  const handleThemeChange = (name: ThemePresetName) => {
    setCurrent(name)
    const preset = themePresets[name]
    if (isDark) {
      applyDarkTheme(preset)
    } else {
      applyTheme(preset)
    }
  }

  const handleDarkToggle = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    const preset = themePresets[current]
    if (newDark) {
      applyDarkTheme(preset)
    } else {
      applyTheme(preset)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {(Object.keys(themePresets) as ThemePresetName[]).map((name) => (
            <Button
              key={name}
              variant={current === name ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleThemeChange(name)}
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={handleDarkToggle}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>

      <ThemeDemo name={current.charAt(0).toUpperCase() + current.slice(1)} />
    </div>
  )
}

export const Presets: StoryFn = () => <PresetsDemo />

const CreateThemeDemo = () => {
  const [primary, setPrimary] = useState('#FF6B00')
  const [accent, setAccent] = useState('#00B4D8')
  const [customTheme, setCustomTheme] = useState<ThemePreset | null>(null)

  const handleApply = () => {
    const theme = createTheme({ name: 'custom', primary, accent })
    setCustomTheme(theme)
    applyTheme(theme)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div>
          <label htmlFor="primary-color" className="text-sm font-medium">
            Primary Color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="primary-color"
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border"
            />
            <Input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="w-28"
              aria-label="Primary hex"
            />
          </div>
        </div>
        <div>
          <label htmlFor="accent-color" className="text-sm font-medium">
            Accent Color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="accent-color"
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border"
            />
            <Input
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-28"
              aria-label="Accent hex"
            />
          </div>
        </div>
        <Button onClick={handleApply}>Apply Theme</Button>
      </div>

      {customTheme && <ThemeDemo name="Custom Theme" />}
    </div>
  )
}

export const CreateCustomTheme: StoryFn = () => <CreateThemeDemo />
