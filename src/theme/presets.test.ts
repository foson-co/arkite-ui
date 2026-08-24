import { describe, it, expect } from 'vitest'
import { themePresets } from './presets'
import { contrastRatio, hslLuminance, WCAG_AA } from './contrast'

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

  it('ring always equals primary (focus ring matches brand color)', () => {
    for (const [name, preset] of Object.entries(themePresets)) {
      for (const mode of ['light', 'dark'] as const) {
        expect(preset[mode].ring, `${name}.${mode}.ring`).toBe(preset[mode].primary)
      }
    }
  })
})
