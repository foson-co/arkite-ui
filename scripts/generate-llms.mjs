#!/usr/bin/env node
/**
 * Generates llms.txt / llms-full.txt for AI coding agents.
 *
 * - llms.txt      — compact: identity, setup, core patterns, export inventory
 * - llms-full.txt — the above + full DESIGN.md + the typed public API surface
 *
 * Sources (already maintained elsewhere, nothing here is hand-duplicated):
 * - DESIGN.md      — design rules for AI agents (shipped in the npm package)
 * - api-report.txt — public API snapshot (kept fresh by src/api-surface.test.ts)
 *
 * Run: pnpm run generate:llms   (also part of `pnpm build`)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (f) => readFileSync(join(root, f), 'utf8')

const apiReport = read('api-report.txt')
const design = read('DESIGN.md')
const pkg = JSON.parse(read('package.json'))
const registry = JSON.parse(read('registry.json'))

// ─── Export inventory from the API snapshot ───

const values = [...apiReport.matchAll(/^value (\w+):/gm)].map((m) => m[1])
const components = values.filter((n) => /^[A-Z]/.test(n))
const hooks = values.filter((n) => n.startsWith('use'))
const utilities = values.filter((n) => /^[a-z]/.test(n) && !n.startsWith('use'))

const list = (names) => names.sort().join(', ')

// ─── Recipes from the registry (registry.json is the single source of truth) ───

const recipes = registry.recipes
  .map(
    (r) => `### ${r.name} — ${r.title}

${r.summary}
- Use when: ${r.when}
- Not when: ${r.notWhen}
- Composes: ${r.uses.join(', ')}
- Source (ships in the package, copy it): ${r.files.join(', ')} — docs: ${registry.docsBase}${r.docs}`
  )
  .join('\n\n')

// ─── Curated header ───

const header = `# ${pkg.name} v${pkg.version}

> React components for multi-tenant SaaS admin panels. Tailwind CSS v4 +
> Radix UI + TypeScript. Pure UI only: no business logic, auth, stores, or
> routing — data comes in via props, events go out via callbacks.
>
> Arkite UI is an open-source project by Foson (https://foson.co), a Taiwan-based
> software company. Docs: https://ui.foson.co · Repo: https://github.com/foson-co/arkite-ui
> Not affiliated with Arkite NV (arkite.com, industrial operator guidance).

## Setup

\`\`\`bash
pnpm add ${pkg.name}
# peer deps: react react-dom tailwindcss zustand lucide-react
# optional:  framer-motion (Animated* variants)
\`\`\`

\`\`\`css
/* app.css — Tailwind v4, tokens included */
@import "tailwindcss";
@import "${pkg.name}/styles.css";
\`\`\`

## Rules for generated code

1. Import UI from \`${pkg.name}\` — never rebuild primitives that exist (see inventory below).
2. Use semantic token utilities only (\`bg-card\`, \`text-muted-foreground\`, \`border-border\`) — never raw palette classes (\`bg-red-50\`), never \`dark:\` color overrides (tokens handle dark mode), never arbitrary values (\`text-[13px]\`).
3. Components follow the controlled/uncontrolled React convention: \`value\`+\`onChange\` controls, \`defaultValue\` doesn't.
4. Keep API calls, routes, and business models in the app layer.
5. Building a whole page? Match it against the recipes below **before** assembling one
   from scratch — each is a tested composition. Copy the recipe source, rewrite
   \`${registry.install.importRewrite.from}\` to \`${registry.install.importRewrite.to}\`, then adapt.

Full design rules (color/spacing/typography/layout recipes): DESIGN.md, shipped
inside this package — also embedded in llms-full.txt.

## Core patterns

### Server-paginated table

\`useServerTable\` owns the six controlled props server mode needs; you supply
\`data\` + \`totalRows\` and fetch on \`queryKey\`:

\`\`\`tsx
import { DataTable, useServerTable, type Column } from '${pkg.name}'

const table = useServerTable({ initialPageSize: 20 })
const [page, setPage] = useState({ items: [], total: 0 })
useEffect(() => {
  fetchUsers(table.query).then(setPage) // query = { page, pageSize, sort, filters }
}, [table.queryKey])

<DataTable columns={columns} data={page.items} totalRows={page.total}
  getRowKey={(r) => r.id} {...table.props} />
\`\`\`

Client-side tables need none of that: pass \`data\` and the table filters,
sorts, and paginates itself.

### Toasts

\`\`\`tsx
import { useToast, ToastContainer } from '${pkg.name}'

// once, near the app root:
<ToastContainer position="bottom-right" />

const toast = useToast()
toast.success('Saved', { description: 'Changes are live.' })

// error handling in catch blocks — wire the app's parser once at startup:
toast.configure({ formatError: getErrorMessage })
// then every call site is one line (title = prefix, description = parsed message):
catch (err) { toast.fromError(err, { prefix: 'Failed to save' }) }
\`\`\`

### Theming

\`\`\`tsx
import { createTheme, applyTheme } from '${pkg.name}'
applyTheme(createTheme({ primary: '#7c3aed' })) // HSL tokens from one hex
\`\`\`

## Recipes — page-level compositions

Whole pages assembled from the library, each one rendered and tested in CI.
Machine-readable index: registry.json (ships in the package).

${recipes}

## Export inventory

Components: ${list(components)}

Hooks: ${list(hooks)}

Utilities: ${list(utilities)}

Full typed signatures for every export: llms-full.txt (or api-report.txt in the repo).
`

const full = `${header}
---

${design}

---

# Full public API (typed)

${apiReport}`

writeFileSync(join(root, 'llms.txt'), header)
writeFileSync(join(root, 'llms-full.txt'), full)
console.log(
  `llms.txt (${(header.length / 1024).toFixed(1)} KB) + llms-full.txt (${(full.length / 1024).toFixed(1)} KB) generated — ${components.length} components, ${hooks.length} hooks`
)
