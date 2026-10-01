import { describe, it, expect } from 'vitest'
import { themePresets } from './presets'
import { contrastRatio, hoverLuminance, hslLuminance, WCAG_AA } from './contrast'

describe('theme presets contrast (WCAG AA regression guard)', () => {
  // Every background/foreground pair the presets promise. If a palette
  // tweak drops any pair below 4.5:1, this fails instead of waiting for
  // someone to eyeball the Storybook contrast audit page.
  const pairs = [
    ['primary', 'primary-foreground'],
    ['secondary', 'secondary-foreground'],
    ['accent', 'accent-foreground'],
    ['success', 'success-foreground'],
    ['warning', 'warning-foreground'],
    ['destructive', 'destructive-foreground'],
    ['info', 'info-foreground'],
    ['background', 'foreground'],
    ['card', 'card-foreground'],
    ['muted', 'muted-foreground'],
    ['success-soft', 'success-soft-foreground'],
    ['warning-soft', 'warning-soft-foreground'],
    ['destructive-soft', 'destructive-soft-foreground'],
    ['info-soft', 'info-soft-foreground'],
  ] as const

  for (const [name, preset] of Object.entries(themePresets)) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${name}.${mode}: every pair meets 4.5:1`, () => {
        const tokens = preset[mode]
        for (const [bgKey, fgKey] of pairs) {
          const ratio = contrastRatio(hslLuminance(tokens[fgKey]), hslLuminance(tokens[bgKey]))
          expect(
            ratio,
            `${name}.${mode}.${fgKey} (${tokens[fgKey]}) on ${name}.${mode}.${bgKey} (${tokens[bgKey]}) = ${ratio.toFixed(2)}:1`
          ).toBeGreaterThanOrEqual(WCAG_AA)
        }
      })
    }
  }

  // #27: solid-fill buttons darken on hover (styles/index.css --color-*-hover). The old
  // `hover:bg-*/90` faded the fill and dropped white text below AA even on the default
  // theme (primary 5.11 → 4.31:1). Guard the hover shade, not just the resting one.
  for (const [name, preset] of Object.entries(themePresets)) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${name}.${mode}: hover shades of primary/destructive keep 4.5:1`, () => {
        const tokens = preset[mode]
        for (const [bgKey, fgKey] of [
          ['primary', 'primary-foreground'],
          ['destructive', 'destructive-foreground'],
        ] as const) {
          const ratio = contrastRatio(hslLuminance(tokens[fgKey]), hoverLuminance(tokens[bgKey]))
          expect(
            ratio,
            `${name}.${mode}.${fgKey} on hover(${bgKey} ${tokens[bgKey]}) = ${ratio.toFixed(2)}:1`
          ).toBeGreaterThanOrEqual(WCAG_AA)
        }
      })
    }
  }

  it('hover math matches the issue #27 measurement and only raises white-text contrast', () => {
    // Default light primary: resting 5.11:1, old /90 on white 4.31:1 (below AA).
    const white = hslLuminance('0 0% 100%')
    const rest = contrastRatio(white, hslLuminance('250 100% 65%'))
    const hover = contrastRatio(white, hoverLuminance('250 100% 65%'))
    expect(rest).toBeCloseTo(5.11, 1)
    expect(hover).toBeGreaterThan(rest)
    expect(hover).toBeGreaterThanOrEqual(WCAG_AA)
  })

  it('ring always equals primary (focus ring matches brand color)', () => {
    for (const [name, preset] of Object.entries(themePresets)) {
      for (const mode of ['light', 'dark'] as const) {
        expect(preset[mode].ring, `${name}.${mode}.ring`).toBe(preset[mode].primary)
      }
    }
  })
})
