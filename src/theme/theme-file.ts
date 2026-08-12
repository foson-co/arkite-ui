import { createTheme, type CreateThemeOptions } from './create-theme'
import { themeToCSS } from './apply-theme'

/**
 * The contents of an `arkite.theme.json` — a project's brand as a committed
 * artifact rather than CSS variables copied between repos.
 *
 * Four values are the whole source of truth; every token in the generated
 * theme is derived from them, so a rebrand is a reviewable four-line diff.
 */
export type ThemeFile = CreateThemeOptions

/** Thrown when a theme file is malformed. The message is written for a terminal. */
export class ThemeFileError extends Error {
  override name = 'ThemeFileError'
}

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const LENGTH = /^(?:0|\d*\.?\d+(?:rem|em|px))$/
const KNOWN_KEYS = ['name', 'primary', 'accent', 'radius'] as const

function fail(message: string): never {
  throw new ThemeFileError(message)
}

/**
 * Validate parsed JSON as a theme file.
 *
 * `createTheme` itself is permissive — an unparseable hex flows through
 * `parseInt` and lands in the CSS as `NaN NaN% NaN%`, which fails at render
 * time in the consuming app rather than here. This is the gate that turns
 * that into a message at the point of authorship.
 *
 * Unknown keys are rejected rather than ignored: the file has four keys, so
 * an extra one is a typo (`primaryColor`) or a wrong mental model, and
 * silently dropping it would ship the default brand instead.
 */
export function parseThemeFile(input: unknown): ThemeFile {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    fail('Theme file must be a JSON object.')
  }

  const raw = input as Record<string, unknown>

  const unknown = Object.keys(raw).filter((key) => !(KNOWN_KEYS as readonly string[]).includes(key))
  if (unknown.length > 0) {
    fail(`Unknown key(s): ${unknown.join(', ')}. Valid keys: ${KNOWN_KEYS.join(', ')}.`)
  }

  if (typeof raw.primary !== 'string') {
    fail('"primary" is required and must be a hex string, e.g. "#6a4dff".')
  }
  if (!HEX.test(raw.primary)) {
    fail(`"primary" must be a hex color like "#6a4dff" — got ${JSON.stringify(raw.primary)}.`)
  }

  if (raw.accent !== undefined) {
    if (typeof raw.accent !== 'string' || !HEX.test(raw.accent)) {
      fail(`"accent" must be a hex color like "#00b4d8" — got ${JSON.stringify(raw.accent)}.`)
    }
  }

  if (raw.radius !== undefined) {
    if (typeof raw.radius !== 'string' || !LENGTH.test(raw.radius)) {
      fail(`"radius" must be a CSS length like "0.5rem" — got ${JSON.stringify(raw.radius)}.`)
    }
  }

  if (raw.name !== undefined && (typeof raw.name !== 'string' || raw.name.trim() === '')) {
    fail(`"name" must be a non-empty string — got ${JSON.stringify(raw.name)}.`)
  }

  const theme: ThemeFile = { primary: raw.primary }
  if (typeof raw.name === 'string') theme.name = raw.name
  if (typeof raw.accent === 'string') theme.accent = raw.accent
  if (typeof raw.radius === 'string') theme.radius = raw.radius
  return theme
}

export interface ThemeFileToCSSOptions {
  /** Path shown in the generated header, so the CSS points back at its source. */
  source?: string
  /** Selector the light tokens land on. Defaults to `:root`. */
  selector?: string
}

/**
 * Render a theme file as CSS variables, with a header marking it generated.
 *
 * Server-safe: this module touches no DOM, so a build script or a Server
 * Component can emit theme CSS without pulling in the component library.
 */
export function themeFileToCSS(file: ThemeFile, options: ThemeFileToCSSOptions = {}): string {
  const { source = 'arkite.theme.json', selector = ':root' } = options
  const css = themeToCSS(createTheme(file), selector)
  return `/* Generated from ${source} by \`arkite-ui theme apply\` — do not edit.\n   Change the source file and re-run instead. */\n\n${css}\n`
}
