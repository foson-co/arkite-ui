---
'@arkite-ui/core': patch
---

Back the React 19 half of the peer range with CI evidence.

`peerDependencies` has permitted `^18 || ^19` for a while, but every depth check
ran on the single React 18 install pinned in `devDependencies`. The one place 19
was exercised was `smoke:next` — a Next 15 fixture covering the RSC boundary,
hydration, and one interaction. That is breadth. A consumer reading the peer
range reasonably assumed the ~1400-case unit suite, `tsc --noEmit`, and the APG
keyboard specs had run against 19 too, and they had not.

They do now. `typecheck:react19` and `test:react19` run on every merge request;
`keyboard:browser:react19` runs on `main` (a second playwright-image job per MR
costs more queue time on the self-hosted runner than it buys, since jsdom
re-runs the same specs under 19 anyway). All three install via `pnpm.overrides`,
so transitive peers — Radix, `cmdk`, `framer-motion`, `@tanstack/react-virtual` —
resolve to 19 as well rather than leaving an 18 underneath.

The matrix went green on the first pass: 1394 unit cases, 74 keyboard specs, and
a clean typecheck, with no peer warnings from the optional Radix/motion set. Two
things had to be fixed to get there, both in test code, neither reaching
consumers:

- The public-API snapshot is now printed without the `React.` qualifier.
  `@types/react` 18 declares its types inside `declare namespace React` and 19
  exports them as a module, so the checker printed `React.ReactNode` on one and
  `ReactNode` on the other — 174 lines of diff on identical types, which reads
  exactly like a deliberate API change. The report is normalized before the
  union sort, so both versions produce the same committed snapshot and the
  guard means the same thing on either.
- `Alert`'s ref-forwarding test built a `{ current: null } as RefObject<T>`,
  which stopped compiling once 19 narrowed `RefObject<T>.current` to `T`. It
  uses `createRef` now.

`README` states which versions are *tested* rather than merely permitted, so the
peer range and the evidence can be checked against each other.

Closes #3.
