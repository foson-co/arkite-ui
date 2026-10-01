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

/** sRGB (0..1) of an `"H S% L%"` HSL triplet. */
function hslToRgb(hsl: string): [number, number, number] {
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
  return [rgb[0] + m, rgb[1] + m, rgb[2] + m]
}

/** Luminance of an `"H S% L%"` HSL triplet (the theme-preset format). */
export function hslLuminance(hsl: string): number {
  return luminanceFromRgb(hslToRgb(hsl))
}

/**
 * Share of the base color kept by the solid-fill hover tokens — must match
 * `--color-primary-hover` / `--color-destructive-hover` in styles/index.css:
 * `color-mix(in oklab, <color> 88%, black)`. Black is the oklab origin, so the
 * mix simply scales L, a and b by this factor.
 */
export const HOVER_MIX = 0.88

/**
 * Luminance of the hover shade of an `"H S% L%"` color, computed exactly like the
 * CSS `color-mix(in oklab, color 88%, black)` (#27: hover must darken, not fade).
 */
export function hoverLuminance(hsl: string, keep: number = HOVER_MIX): number {
  const lin = hslToRgb(hsl).map(channelToLinear)
  const lms = [
    0.4122214708 * lin[0] + 0.5363325363 * lin[1] + 0.0514459929 * lin[2],
    0.2119034982 * lin[0] + 0.6806995451 * lin[1] + 0.1073969566 * lin[2],
    0.0883024619 * lin[0] + 0.2817188376 * lin[1] + 0.6299787005 * lin[2],
  ].map(Math.cbrt)
  const L = (0.2104542553 * lms[0] + 0.793617785 * lms[1] - 0.0040720468 * lms[2]) * keep
  const A = (1.9779984951 * lms[0] - 2.428592205 * lms[1] + 0.4505937099 * lms[2]) * keep
  const B = (0.0259040371 * lms[0] + 0.7827717662 * lms[1] - 0.808675766 * lms[2]) * keep
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  // Back in linear-light sRGB: clamp to gamut and take relative luminance directly.
  const clamp = (v: number) => Math.min(1, Math.max(0, v))
  return 0.2126 * clamp(r) + 0.7152 * clamp(g) + 0.0722 * clamp(b)
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
