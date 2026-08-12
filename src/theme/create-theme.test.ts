import { describe, it, expect } from 'vitest'
import { createTheme } from './create-theme'
import { contrastRatio, hslLuminance, WCAG_AA } from './contrast'

describe('createTheme', () => {
  it('creates a theme from a primary color', () => {
    const theme = createTheme({ primary: '#FF6B00' })
    expect(theme.name).toBe('custom')
    expect(theme.light.primary).toMatch(/\d+ \d+% \d+%/)
    expect(theme.dark.primary).toMatch(/\d+ \d+% \d+%/)
  })

  it('uses custom name', () => {
    const theme = createTheme({ name: 'brand', primary: '#635BFF' })
    expect(theme.name).toBe('brand')
  })

  it('uses accent color when provided', () => {
    const theme = createTheme({ primary: '#FF6B00', accent: '#00B4D8' })
    expect(theme.light.accent).not.toBe(theme.light.primary)
    // Accent should be derived from the provided hex
    expect(theme.light.accent).toMatch(/\d+ \d+% \d+%/)
  })

  it('sets appropriate foreground for light primary', () => {
    // White-ish primary => dark foreground
    const theme = createTheme({ primary: '#FFFFFF' })
    expect(theme.light['primary-foreground']).toBe('0 0% 0%')
  })

  it('sets appropriate foreground for dark primary', () => {
    // Dark primary => light foreground
    const theme = createTheme({ primary: '#1a1a2e' })
    expect(theme.light['primary-foreground']).toBe('0 0% 100%')
  })

  it('sets custom radius', () => {
    const theme = createTheme({ primary: '#FF6B00', radius: '0.75rem' })
    expect(theme.light.radius).toBe('0.75rem')
    expect(theme.dark.radius).toBe('0.75rem')
  })

  it('dark mode has lighter primary than light mode', () => {
    const theme = createTheme({ primary: '#3B82F6' })
    const lightL = parseInt(theme.light.primary.split(' ')[2])
    const darkL = parseInt(theme.dark.primary.split(' ')[2])
    expect(darkL).toBeGreaterThanOrEqual(lightL)
  })

  it('picks foreground by actual contrast, not lightness threshold', () => {
    // hsl(210 100% 50%): the old L>55% heuristic paired this blue with
    // white at 3.81:1 — the exact pair fixed in the ocean preset. Real
    // contrast math picks black (5.51:1).
    const theme = createTheme({ primary: '#0080ff' })
    expect(theme.light['primary-foreground']).toBe('0 0% 0%')
  })

  it('computes dark-mode foregrounds instead of hardcoding white', () => {
    // Dark primary is the brand color lightened by 8 points, so a bright
    // brand needs a black foreground there too.
    const theme = createTheme({ primary: '#16a34a' })
    expect(theme.dark['primary-foreground']).toBe('0 0% 0%')
  })

  it('every generated brand pair meets WCAG AA for any input color', () => {
    // Sweep light/mid/dark hues across every channel mix, including the
    // mid-luminance colors where the old heuristic failed.
    const brands = [
      '#0080ff',
      '#16a34a',
      '#ef4444',
      '#f59e0b',
      '#a855f7',
      '#14b8a6',
      '#808080',
      '#FF6B00',
      '#1a1a2e',
      '#e2e8f0',
      '#635BFF',
      '#00B4D8',
    ]
    for (const hex of brands) {
      const theme = createTheme({ primary: hex })
      for (const mode of ['light', 'dark'] as const) {
        for (const [bg, fg] of [
          ['primary', 'primary-foreground'],
          ['accent', 'accent-foreground'],
        ] as const) {
          const ratio = contrastRatio(hslLuminance(theme[mode][fg]), hslLuminance(theme[mode][bg]))
          expect(
            ratio,
            `createTheme(${hex}) ${mode}.${fg} (${theme[mode][fg]}) on ${mode}.${bg} (${theme[mode][bg]}) = ${ratio.toFixed(2)}:1`
          ).toBeGreaterThanOrEqual(WCAG_AA)
        }
      }
    }
  })

  it('computes saturation for dark colors instead of forcing 100%', () => {
    // d / (max - min) is d / d === 1, so every color with L <= 50% used to
    // come back fully saturated. #1a1a2e is a muted navy: 28%, not 100%.
    const theme = createTheme({ primary: '#1a1a2e' })
    expect(theme.light.primary).toBe('240 28% 14%')
  })

  it('round-trips known hex colors to HSL', () => {
    // Anchors both branches of the saturation formula: L <= 50% (dark, muted),
    // L > 50% (light, muted), and the L === 50% boundary that falls to `else`.
    const cases: Array<[string, string]> = [
      ['#1a1a2e', '240 28% 14%'], // dark + muted  -> else branch
      ['#0080ff', '210 100% 50%'], // exactly L 50% -> else branch
      ['#3B82F6', '217 91% 60%'], // light + saturated -> if branch
      ['#e2e8f0', '214 32% 91%'], // light + muted     -> if branch
      ['#808080', '0 0% 50%'], // achromatic
    ]
    for (const [hex, expected] of cases) {
      expect(createTheme({ primary: hex }).light.primary, hex).toBe(expected)
    }
  })

  it('preserves non-brand tokens from default theme', () => {
    const theme = createTheme({ primary: '#FF6B00' })
    // Success, warning, destructive should come from default
    expect(theme.light.success).toMatch(/145/)
    expect(theme.light.warning).toMatch(/38/)
    expect(theme.light.destructive).toMatch(/0 72%/)
  })
})
