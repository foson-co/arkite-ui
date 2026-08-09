---
'@arkite-ui/core': patch
---

Make the recipes findable from the components they use.

Six whole-page recipes existed but only in their own Storybook section — nothing pointed at them from a component's page, so the composition guidance was invisible unless you already knew to look for it. Adds a **Recipes / Overview** index (what each recipe shows, plus a reverse component → recipe table covering all 19 components that appear in one), links it from Introduction, and puts an "In context" line on the six components a recipe is built around: `DataTable`, `FilterBar`, `BulkActionBar`, `Drawer`, `Form`, `AdminLayout`.

Those links live in the components' JSDoc rather than story parameters: `docs.description.component` would override the docgen-extracted description, and the JSDoc renders on the Storybook page automatically while also showing up in IDE tooltips and the published types. They use absolute `ui.foson.co` URLs so they resolve outside Storybook too.

Completes the documentation half of the composition work — the rules that fail silently warn at dev time (0.19.0/0.19.1), and the rules that just need showing now have a path from the component to a page that shows them.
