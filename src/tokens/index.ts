/**
 * `@arkite-ui/core/tokens` — framework-agnostic design tokens.
 *
 * This entry point exports pure JavaScript values (no React, no DOM, no CSS)
 * so it can be consumed from any environment: web, React Native, Node scripts,
 * design tooling, etc.
 *
 * **Layered structure**
 *   - `primitives`: raw color scales (gray.500, blue.600, …) — internal building blocks
 *   - `colors.{light,dark}`: semantic tokens (success, danger, primary, …) — public API
 *   - `spacing` / `radius` / `fontSize` / `lineHeight` / `fontWeight`: numeric scales
 *
 * Prefer the semantic layer in product code. Reach for primitives only when
 * you genuinely need a specific shade that has no semantic name.
 *
 * @example Web (TypeScript)
 * ```ts
 * import { colors, spacing } from '@arkite-ui/core/tokens'
 *
 * const buttonStyle = {
 *   backgroundColor: colors.light.primary,
 *   padding: spacing[3],
 * }
 * ```
 *
 * @example React Native
 * ```tsx
 * import { colors, spacing, radius } from '@arkite-ui/core/tokens'
 * import { StyleSheet, useColorScheme } from 'react-native'
 *
 * function useThemedStyles() {
 *   const scheme = useColorScheme() ?? 'light'
 *   return StyleSheet.create({
 *     card: {
 *       backgroundColor: colors[scheme].card,
 *       padding: spacing[4],
 *       borderRadius: radius.lg,
 *     },
 *   })
 * }
 * ```
 */

export { primitives } from './primitives'
export type { Primitives, PrimitiveColorName, PrimitiveShade } from './primitives'

export { colors } from './colors'
export type { SemanticColors, ColorScheme, SemanticColorName } from './colors'

export { spacing } from './spacing'
export type { SpacingKey } from './spacing'

export { radius } from './radius'
export type { RadiusKey } from './radius'

export { fontSize, lineHeight, fontWeight } from './typography'
export type { FontSizeKey, LineHeightKey, FontWeightKey } from './typography'
