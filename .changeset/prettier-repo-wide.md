---
'@arkite-ui/core': patch
---

Repo-wide Prettier pass plus a CI format gate. No API, prop, or behavior change.

Shipped output changes only in Tailwind utility-class ordering, which `prettier-plugin-tailwindcss` normalizes. Verified: across the whole bundle, every one of the 4408 string literals is identical after `twMerge` normalization with matching counts — the sole remaining difference is the chunk filename hash. No class was added, removed, or altered, so rendering is unaffected; only consumers asserting on exact `className` strings would see a difference.
