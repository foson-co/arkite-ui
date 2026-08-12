---
'@arkite-ui/core': minor
---

`arkite-ui add <recipe>` — install a whole-page composition instead of retyping it.

The six recipes were already tested compositions, but the only way to use one was to read it in Storybook and copy it by hand, and the wiring is exactly what gets lost in a transcription step. The registry shipped the index; this makes it actionable:

```bash
npx arkite-ui add                                  # list them, with when / when not
npx arkite-ui add crud-list-page                   # → src/pages/CrudListPage.tsx
npx arkite-ui add crud-list-page --name OrdersPage # rename the component throughout
```

`--out` picks the destination, `--force` overwrites; without it an existing file is refused rather than clobbered. The written file has its repo-relative import rewritten to the package and a header naming the sample constants to replace, so it runs before it is edited — a starting point that already works is one people actually adapt.

The sample data stays rather than being stripped: a recipe with its mock arrays removed doesn't render, and a page that doesn't render teaches nothing.

The bigger reason is agents. `llms.txt` now says to install a recipe rather than generate one, which is the difference between competing with everything the model saw in training and sidestepping it: when the wiring arrives as known-good source, there is no wiring left to hallucinate — only sample data and API calls to swap. `DESIGN.md`, the recipes overview, and the README carry the same instruction.

Tests cover the transform end to end, including that every recipe still parses as TSX after rewriting and renaming. They need no build (registry.json and the recipe sources are plain files), so they run in the normal test job.
