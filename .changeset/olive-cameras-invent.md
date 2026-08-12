---
'@arkite-ui/core': minor
---

Ship the recipes as a machine-readable registry, and make the Theme Playground produce a committable artifact.

**`registry.json`** — the six whole-page recipes now have an index that ships in the package. Each entry carries what a *selector* needs: `when` to reach for it, `notWhen` it is the wrong shape, the exports it composes, and the path to its source (the demo files now ship too). The recipes were already tested compositions, but they were only visible to someone browsing Storybook — nothing could enumerate them.

That index feeds `llms.txt`, which gains a **Recipes** section and a rule telling agents to match a page against it before assembling one from scratch. The failure mode this targets isn't "the model doesn't know `DataTable`'s props" — types already cover that — it's the model reinventing the *wiring* (filters + selection + bulk bar + confirm + toast) and reaching for the pattern it saw most in training instead of ours. A page-level exemplar is the only thing that competes with that. It also lays the groundwork for `arkite-ui add <recipe>`, where the model installs known-good source rather than generating any of it: `install.importRewrite` records the one transform that needs.

`src/registry.test.ts` fails CI when a recipe's `uses` list drifts from what its demo actually imports, when a referenced file is missing, or when a demo exists with no entry. A stale registry is worse than none — it teaches a wrong pattern to every consumer at once, and with authority.

**Theme Playground** gains the export half it was missing. It could already create a theme from two hex values and preview it, but the only way out was hand-copying generated CSS, so each consuming project's brand ended up as CSS pasted between repos with no source of truth. It now emits `arkite.theme.json` — the four values everything else derives from — with a copy button, alongside the CSS. Commit that file, feed it to `createTheme()` at startup, and a brand change becomes a reviewable four-line diff. A live WCAG readout scores primary/accent against their auto-picked foregrounds in both light and dark, so a brand hue that can't pass AA is caught while choosing it rather than after it ships.

`DESIGN.md` gains a pointer to the registry from the component-inventory section, so the "check for a whole-page recipe first" step is in the file agents read before writing UI.
