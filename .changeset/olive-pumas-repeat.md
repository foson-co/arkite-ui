---
'@arkite-ui/core': minor
---

Declare `@types/react` as an optional peer dependency so React types resolve per consumer

Our `.d.ts` import React's types rather than inlining them, so `ReactNode` and friends are resolved in the consumer's install tree. `@types/react` was not declared as a peer, so pnpm left core's variant directory without one and type resolution walked up to the single hoisted copy in `node_modules/.pnpm/node_modules/` — one version for the entire repo.

In a monorepo with workspaces on different React majors, that copy is necessarily wrong for one of them, and every `ReactNode`-typed prop on core fails to accept the consumer's own `ReactNode`:

```
error TS2322: Type 'React.ReactNode' is not assignable to type
  'import(".../@types+react@18.3.31/...").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.
```

(`bigint` is the tell — React 19 added it to `ReactNode`.) Reported by ark-museum while upgrading one of two apps to React 19.

**Retires the workaround**: consumers no longer have to keep every workspace in the repo on the same React major to satisfy core. pnpm now builds a core variant per `@types/react` version and each workspace type-checks against the right one. Upgrading React across a monorepo no longer has to be one atomic commit on core's account.

`peerDependenciesMeta.optional` is set so JS-only consumers are not forced to install type packages. `@types/react-dom` is deliberately **not** declared — nothing in our published `.d.ts` references it, and an unused peer would constrain install trees for no benefit.

Minor rather than patch: no API changed, but this alters the published install shape, so every consumer's lockfile will churn on upgrade. Under `^0.21.1` this is not picked up automatically — the bump is opt-in.

Pinned by a new `types:mixed-major` CI job (`scripts/verify-types-mixed-major.sh`), which packs the tarball into a two-app fixture on React 18 and 19 and requires both to type-check. The existing `typecheck:react19` job could not catch this: it checks core against one React at a time inside our own repo, and stayed green for the whole life of the bug.
