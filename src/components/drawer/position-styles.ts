import type { DrawerPosition } from './Drawer'

/**
 * Edge anchoring plus the safe-area insets that edge can collide with.
 *
 * A landscape phone puts the notch on the *side*, so a bottom sheet needs
 * left/right insets just as much as a side drawer needs top/bottom ones —
 * handling only `bottom` leaves a clipped column on every rotated device.
 *
 * `env()` resolves to 0 without `viewport-fit=cover`, so this is a no-op on
 * desktop and on any app that has not opted into edge-to-edge rendering.
 * Insets are padding: the panel keeps its `sizeStyles` footprint (border-box)
 * and only its content moves inward.
 *
 * Internal — shared by Drawer and AnimatedDrawer so the two cannot drift.
 * Not re-exported from the barrel.
 */
export const drawerPositionStyles: Record<DrawerPosition, string> = {
  left: 'inset-y-0 left-0 pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
  right:
    'inset-y-0 right-0 pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
  top: 'inset-x-0 top-0 pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
  bottom:
    'inset-x-0 bottom-0 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
}
