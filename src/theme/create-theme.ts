import type { ThemeTokens, ThemePreset } from './presets'
import { defaultTheme } from './presets'
import { pickForeground } from './contrast'

/**
 * Parse a hex color to HSL components.
 * Returns "H S% L%" string for CSS variable usage.
 */
function hexToHsl(hex: string): string {
  hex = hex.replace('#', '')
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return `0 0% ${Math.round(l * 100)}%`
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h: number
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    default:
      h = ((r - g) / d + 4) / 6
      break
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/**
 * Adjust the lightness of an HSL string.
 */
function adjustLightness(hsl: string, delta: number): string {
  const parts = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
  if (!parts) return hsl
  const h = parseInt(parts[1])
  const s = parseInt(parts[2])
  const l = Math.max(0, Math.min(100, parseInt(parts[3]) + delta))
  return `${h} ${s}% ${l}%`
}

export interface CreateThemeOptions {
  /** Theme name */
  name?: string
  /** Primary brand color (hex) */
  primary: string
  /** Accent color (hex). Defaults to a complementary color. */
  accent?: string
  /** Border radius. Defaults to "0.5rem". */
  radius?: string
}

/**
 * Create a complete theme from 1-2 input colors.
 *
 * @example
 * ```ts
 * import { createTheme, applyTheme } from '@arkite-ui/core'
 *
 * const myTheme = createTheme({
 *   primary: '#FF6B00',
 *   accent: '#00B4D8',
 * })
 *
 * applyTheme(myTheme) // applies to :root
 * ```
 */
export function createTheme(options: CreateThemeOptions): ThemePreset {
  const primaryHsl = hexToHsl(options.primary)
  const accentHsl = options.accent ? hexToHsl(options.accent) : adjustLightness(primaryHsl, 10)
  const radius = options.radius ?? '0.5rem'
  const darkPrimaryHsl = adjustLightness(primaryHsl, 8)
  const darkAccentHsl = adjustLightness(accentHsl, 8)

  const light: ThemeTokens = {
    ...defaultTheme.light,
    primary: primaryHsl,
    'primary-foreground': pickForeground(primaryHsl),
    accent: accentHsl,
    'accent-foreground': pickForeground(accentHsl),
    ring: primaryHsl,
    radius,
  }

  const dark: ThemeTokens = {
    ...defaultTheme.dark,
    primary: darkPrimaryHsl,
    'primary-foreground': pickForeground(darkPrimaryHsl),
    accent: darkAccentHsl,
    'accent-foreground': pickForeground(darkAccentHsl),
    ring: darkPrimaryHsl,
    radius,
  }

  return {
    name: options.name ?? 'custom',
    light,
    dark,
  }
}
