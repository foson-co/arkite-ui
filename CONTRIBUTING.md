# Contributing to Arkite UI

Thanks for your interest in contributing! Here's how to get started.

## Design Principle

Arkite UI is a **pure UI component library**. We do not include business logic, auth stores, permission hooks, or domain-specific behavior. Every component must be reusable across multiple projects without modification.

## Development Setup

```bash
git clone git@gitlab.com:foson.co/arkite-ui.git
cd arkite-ui
pnpm install
pnpm storybook       # Preview components at http://localhost:6006
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Watch mode (rebuild on change) |
| `pnpm build` | Production build (tsup) |
| `pnpm storybook` | Launch Storybook |
| `pnpm test` | Run unit tests (412 tests) |
| `pnpm test:watch` | Tests in watch mode |
| `pnpm test:coverage` | Tests with coverage report |
| `pnpm lint` | Lint source code (ESLint 9) |
| `pnpm typecheck` | TypeScript type check |
| `pnpm size` | Check bundle size budget |
| `pnpm changeset` | Add a changeset for your MR |

## Adding a New Component

1. Create a directory under `src/components/<component-name>/`
2. Create the component file (e.g., `MyComponent.tsx`) and an `index.ts` barrel export
3. Add JSDoc comment on the exported component function
4. Export from `src/index.ts`
5. Add a Storybook story under `src/stories/<category>/`
6. Add unit tests (`MyComponent.test.tsx`)
7. Add a changeset: `pnpm changeset`

### Component Checklist

- [ ] Uses `forwardRef` for DOM element forwarding
- [ ] Accepts `className` prop merged via `cn()` helper
- [ ] Spreads `...props` for HTML attribute passthrough
- [ ] Follows density system for interactive components (sm=h-8, md=h-10, lg=h-12)
- [ ] Has JSDoc on the exported component
- [ ] Has unit tests
- [ ] Has Storybook story with controls

## Adding a Recipe

Recipes are whole-page compositions under `src/stories/recipes/`. Unlike a component, one is **shipped as source you install** (`npx arkite-ui add <name>`), so it carries an extra obligation: an entry in `registry.json`.

1. `MyPage.demo.tsx` — the page itself, importing from `'../../index'` (the `add` CLI rewrites that to the package name; `registry.json → install.importRewrite` is the only transform, so don't invent other repo-relative imports)
2. `MyPage.stories.tsx` + `MyPage.mdx` — same as any story, plus the "Key decisions" prose that explains *why* the pieces fit
3. Add it to `src/stories/recipes/Overview.mdx` (both tables)
4. **Add an entry to `registry.json`** — `name`, `title`, `summary`, `when`, `notWhen`, `uses`, `files`, `docs`

`when` / `notWhen` are the fields that matter most: they are what an agent selects on, and `notWhen` should name the recipe or component to use instead. `uses` must list exactly what the demo imports from the library.

`src/registry.test.ts` enforces all of it — a drifted `uses` list, a missing file, or a demo with no registry entry fails CI. That is deliberate: the registry feeds `llms.txt`, so a stale entry teaches a wrong pattern to every consumer at once, with authority.

## CLI

`cli/init.mjs` is the bin entry and dispatches subcommands (`init`, `add`, `theme`), each in its own module. Two rules:

- **Never re-implement library logic in the CLI.** `theme apply` imports `dist/theme.js` rather than deriving colors itself; a second implementation drifts the first time a token changes.
- **Anything reading `dist/` needs a build**, and CI's `test` job runs before `build`. `src/cli/theme.test.ts` therefore skips loudly (`describe.skipIf`) rather than silently passing, with the real logic covered build-free in `src/theme/theme-file.test.ts`. `src/cli/add.test.ts` needs no build (plain files), so it always runs.

## Code Style

- TypeScript strict mode
- ESLint 9 flat config with `react-hooks` and `jsx-a11y`
- Tailwind CSS v4 utility classes via `cn()` helper
- HSL CSS Variables for theming (see `src/styles/index.css`)
- `forwardRef` for all primitive components
- Export types alongside components

## Density System

All interactive components follow a consistent sizing pattern:

| Size | Height | Usage |
|------|--------|-------|
| `sm` | `h-8` (32px) | Compact UIs, table cells |
| `md` | `h-10` (40px) | Default |
| `lg` | `h-12` (48px) | Touch targets, hero forms |

Components using density: Button, Input, Select, SearchInput, Combobox, DatePicker, Textarea.

## Testing

We use **Vitest + @testing-library/react**. Tests live next to their component files:

```
src/components/button/
├── Button.tsx
├── Button.test.tsx
└── index.ts
```

Run tests: `pnpm test`

### What to Test

- Rendering with default props
- All variants/sizes render correctly
- User interactions (click, type, toggle)
- Accessibility (roles, aria attributes, keyboard)
- Edge cases (empty state, error state, disabled)

## Changesets

We use [changesets](https://github.com/changesets/changesets) for versioning. **Every MR that changes the public API must include a changeset.**

```bash
# Add a changeset (interactive prompt)
pnpm changeset

# This creates a file in .changeset/ describing the change
# Commit it with your MR
```

CI will warn if a merge request is missing a changeset.

### Changeset Types

- `major` — Breaking changes (removed exports, renamed props)
- `minor` — New features (new components, new props)
- `patch` — Bug fixes, internal refactors

## Release & Sync Process

This is the agreed team process — every release follows it, in this order.

### 1. Sync happens *before* release, not after

A library change is not "done" when the code merges. Each change ships **in the same MR** with:

- Tests covering the new behavior
- A Storybook story demonstrating it (real-scenario stories, not prop dumps)
- `DESIGN.md` updated when the change affects component-selection rules
- A changeset (see above)

`llms.txt` / `llms-full.txt` and the API snapshot regenerate automatically during build/release — never edit them by hand.

The bar: when someone asks "does Storybook/starter need updating for this release?", the correct answer is "already done".

### 2. Changes are consumer-evidence-driven

New props/components come from observed consumer pain (grep audits, lint-exemption clusters, feedback docs from consuming projects) — not speculation. Fix the library upstream instead of documenting workarounds downstream. Each release's CHANGELOG notes **which consumer workarounds it retires**, so consumers know what to delete.

### 3. Cutting a release

```bash
pnpm release:cut
```

This runs: `changeset version` → regenerate llms docs → commit → tag → push. The GitLab **tag pipeline** publishes to npm + GitLab registry; the script then syncs the GitHub mirror (`foson-co/arkite-ui`), which redeploys ui.foson.co (landing + Storybook). Never publish to npm manually.

### 4. Starter canary (mandatory post-release step)

After **every** release, `arkite-admin-starter` immediately bumps to the new version, builds, and redeploys starter.foson.co. The starter is our first consumer — it surfaces upgrade regressions before real consumers hit them (this is how the 0.14.1 bare-`Table` hover regression was caught). A release is not complete until the canary is green.

### 5. Public-facing links

Anything public (README, docs, npm metadata, articles) links to **github.com/foson-co/arkite-ui** and **ui.foson.co** — never to GitLab. GitLab is the private source of truth and CI; GitHub is the public front door.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `refactor:` code refactoring
- `docs:` documentation
- `test:` test changes
- `chore:` maintenance

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with tests
3. Add a changeset: `pnpm changeset`
4. Ensure `pnpm lint && pnpm typecheck && pnpm test` pass
5. Open a merge request on GitLab
6. CI runs lint, typecheck, test, size check, changeset check, and Chromatic

## Bundle Size Budget

We enforce bundle size budgets via [size-limit](https://github.com/ai/size-limit):

- `dist/index.js` < 300 KB
- `dist/tailwind-preset.js` < 10 KB

If your changes cause the bundle to exceed the budget, consider:
- Tree-shaking unused dependencies
- Lazy-loading heavy components
- Moving optional features behind peer dependencies

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
