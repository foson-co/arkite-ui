---
'@arkite-ui/core': patch
---

Make the public-API snapshot deterministic, and stop it flaking CI.

`api-surface.test.ts` compares a generated report of every export against a committed snapshot, which is what stops a prop rename shipping unnoticed. But TypeScript does not guarantee the order of union constituents — it follows the order the types happened to be created, which varies between machines and runs. The report inherited that: `variant?: "default" | "destructive"` locally, `"destructive" | "default"` on the CI runner, and a red build whose diff reads exactly like a deliberate API change. The dangerous part is the fix it invites — running `-u` to "clear" the noise is also how a real API change gets rubber-stamped.

Union members are now sorted before they enter the report, with `undefined`/`null` kept last so an optional prop still reads the way TypeScript writes it. Declaration order was never part of what the snapshot is for, so nothing is lost.

The normalizer sits between the compiler and the guard, so it has its own tests: separators inside generics, object literals, and string literals must not split, `=>` must not be read as a closing angle bracket, and the result must be a permutation of the input. Normalization is deliberately top-level only — chasing unions nested inside generics means a recursive parser whose bugs would silently weaken the guard, which is worse than the flake.

This reorders union members throughout `api-report.txt` and the API section of `llms-full.txt`; the members themselves are unchanged, verified as a strict permutation.
