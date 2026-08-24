---
'@arkite-ui/core': patch
---

Internal lint hygiene: clear the 9 standing ESLint warnings and gate on `--max-warnings 0`. No API, prop, or behavior change.

Shipped output does change in one respect, so this is a patch rather than an empty changeset: six source files were brought up to the repo's current Prettier config, and `prettier-plugin-tailwindcss` reordered utility classes inside 30 `className` strings. Verified equivalent — every reordered string produces an identical result through `twMerge`, and no class was added, removed, or altered. Rendering is unaffected; only consumers asserting on exact `className` strings would see a difference.
