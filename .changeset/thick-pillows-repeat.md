---
'@arkite-ui/core': patch
---

Fix the saturation formula in `createTheme()`'s hex parsing. The dark branch
divided by `max - min` (which is the delta itself, always 1), so every input
color with lightness at or below 50% came back fully saturated — a muted navy
like `#1a1a2e` became `240 100% 14%` instead of `240 28% 14%`. Brand colors in
that range now keep their real saturation; light colors were unaffected.
