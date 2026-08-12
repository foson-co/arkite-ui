import { describe, it, expect } from 'vitest'
import { parseThemeFile, themeFileToCSS, ThemeFileError } from './theme-file'

/**
 * `arkite.theme.json` is the artifact a consuming repo commits, so the gate
 * that reads it has to be strict: `createTheme` happily turns a malformed hex
 * into `NaN NaN% NaN%` and the failure only surfaces as an unstyled app.
 */

describe('parseThemeFile', () => {
  it('accepts a minimal file', () => {
    expect(parseThemeFile({ primary: '#6a4dff' })).toEqual({ primary: '#6a4dff' })
  })

  it('accepts all four keys, including shorthand hex', () => {
    const file = { name: 'my-brand', primary: '#f60', accent: '#00b4d8', radius: '0.5rem' }
    expect(parseThemeFile(file)).toEqual(file)
  })

  it('accepts every CSS length unit radius takes, plus bare 0', () => {
    for (const radius of ['0', '0.5rem', '4px', '1em', '.25rem']) {
      expect(parseThemeFile({ primary: '#6a4dff', radius }).radius).toBe(radius)
    }
  })

  it.each([
    ['not an object', 'nope'],
    ['null', null],
    ['an array', [{ primary: '#6a4dff' }]],
  ])('rejects %s', (_label, input) => {
    expect(() => parseThemeFile(input)).toThrow(ThemeFileError)
  })

  it('requires primary', () => {
    expect(() => parseThemeFile({ accent: '#00b4d8' })).toThrow(/"primary" is required/)
  })

  it.each(['6a4dff', '#12345', '#gggggg', 'rebeccapurple', ''])(
    'rejects malformed hex %j rather than emitting NaN tokens',
    (primary) => {
      expect(() => parseThemeFile({ primary })).toThrow(ThemeFileError)
    }
  )

  it('rejects a malformed accent and radius', () => {
    expect(() => parseThemeFile({ primary: '#6a4dff', accent: 'teal' })).toThrow(/"accent"/)
    expect(() => parseThemeFile({ primary: '#6a4dff', radius: 'round' })).toThrow(/"radius"/)
    expect(() => parseThemeFile({ primary: '#6a4dff', radius: 8 })).toThrow(/"radius"/)
  })

  it('rejects an empty name', () => {
    expect(() => parseThemeFile({ primary: '#6a4dff', name: '  ' })).toThrow(/"name"/)
  })

  // Silently dropping a typo'd key ships the default brand and looks like the
  // CLI did nothing — the most confusing failure this file can have.
  it('rejects unknown keys and names the valid ones', () => {
    expect(() => parseThemeFile({ primary: '#6a4dff', primaryColor: '#fff' })).toThrow(
      /Unknown key\(s\): primaryColor.*name, primary, accent, radius/s
    )
  })

  it('drops nothing and adds nothing beyond the declared keys', () => {
    const parsed = parseThemeFile({ primary: '#6a4dff', name: 'x' })
    expect(Object.keys(parsed).sort()).toEqual(['name', 'primary'])
  })
})

describe('themeFileToCSS', () => {
  const css = themeFileToCSS({ primary: '#6a4dff', accent: '#00b4d8', radius: '0.75rem' })

  it('emits light tokens on :root and dark tokens on .dark', () => {
    expect(css).toContain(':root {')
    expect(css).toContain('.dark {')
    expect(css).toContain('--primary:')
    expect(css).toContain('--radius: 0.75rem;')
  })

  it('derives real HSL values — never NaN', () => {
    expect(css).not.toContain('NaN')
    expect(css).toMatch(/--primary: \d+ \d+% \d+%;/)
  })

  it('marks itself generated and points back at its source', () => {
    expect(css).toContain('do not edit')
    expect(css).toContain('arkite.theme.json')
    expect(themeFileToCSS({ primary: '#6a4dff' }, { source: 'themes/brand.json' })).toContain(
      'themes/brand.json'
    )
  })

  it('honors a custom selector for scoped theming', () => {
    const scoped = themeFileToCSS({ primary: '#6a4dff' }, { selector: '[data-tenant="acme"]' })
    expect(scoped).toContain('[data-tenant="acme"] {')
    expect(scoped).toContain('.dark {')
  })
})
