/**
 * WCAG 2.1 relative-luminance contrast math.
 *
 * Used by createTheme() to pick guaranteed-AA foregrounds, and by the
 * token/preset contrast regression tests. Same formula as the Storybook
 * "Foundation / Design Tokens" audit page.
 */

function channelToLinear(v: number): number {
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function luminanceFromRgb([r, g, b]: [number, number, number]): number {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b)
}

/** Luminance of a `#rrggbb` hex color. */
export function hexLuminance(hex: string): number {
  const h = hex.replace('#', '')
  return luminanceFromRgb([
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ])
}

/** Luminance of an `"H S% L%"` HSL triplet (the theme-preset format). */
export function hslLuminance(hsl: string): number {
  const [h, s, l] = hsl.split(' ').map((v, i) => parseFloat(v) / (i ? 100 : 1))
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rgb: [number, number, number]
  if (h < 60) rgb = [c, x, 0]
  else if (h < 120) rgb = [x, c, 0]
  else if (h < 180) rgb = [0, c, x]
  else if (h < 240) rgb = [0, x, c]
  else if (h < 300) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  return luminanceFromRgb([rgb[0] + m, rgb[1] + m, rgb[2] + m])
}

/** WCAG contrast ratio (1..21) between two luminances. */
export function contrastRatio(lum1: number, lum2: number): number {
  const [lighter, darker] = lum1 > lum2 ? [lum1, lum2] : [lum2, lum1]
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG AA threshold for normal-size text. */
export const WCAG_AA = 4.5

/**
 * Pick black or white foreground for an `"H S% L%"` background, whichever
 * contrasts more. Because contrast(white, bg) × contrast(black, bg) ≡ 21,
 * the winning side is always ≥ √21 ≈ 4.58 — WCAG AA holds for any color.
 */
export function pickForeground(hsl: string): string {
  const bg = hslLuminance(hsl)
  return contrastRatio(0, bg) >= contrastRatio(1, bg) ? '0 0% 0%' : '0 0% 100%'
}
