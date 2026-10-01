---
'@arkite-ui/core': patch
---

Solid-fill hover now darkens instead of fading, so text contrast never drops below WCAG AA on hover or press (#27).

`Button` (`primary`, `destructive`), `CopyButton` (`primary`, `destructive`), the selected day in `Calendar`, and the `AdminLayout` brand mark used `hover:bg-*/90`. On a white page that lightens the fill: with the default theme, primary went from 5.11:1 at rest to **4.31:1** on hover and destructive to **4.28:1**; with mutant-go's brand `#4263EB`, 4.98 → 4.14:1. Pressed buttons show the hover color, so press was affected too.

Two new theme tokens replace the opacity form: `--color-primary-hover` and `--color-destructive-hover`, both `color-mix(in oklab, <color> 88%, black)`. They follow any `--primary` / `--destructive` override automatically, so branded themes get the fix with no changes (default primary on hover is now 6.74:1, destructive 6.36:1, `#4263EB` 6.58:1). Use them as `hover:bg-primary-hover` / `hover:bg-destructive-hover`; override the two variables to tune the shade. `presets.test.ts` now also guards the hover shade of every preset in light and dark mode.

**Downstream:** projects that patched this locally can drop the workaround after upgrading — mutant-go studio's darkened-hover override (`changes/2026-09-26-studio-editor/03-build.md`, Slice 10); mutant-go `apps/play` gets the fix with no change.
