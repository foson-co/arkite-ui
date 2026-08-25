# Arkite UI

Production-ready React components for SaaS admin panels. Built with Tailwind CSS v4.
An open-source project by **[Foson](https://foson.co)**.

[![npm version](https://img.shields.io/npm/v/%40arkite-ui%2Fcore)](https://www.npmjs.com/package/@arkite-ui/core)
[![bundle size](https://img.shields.io/bundlephobia/minzip/%40arkite-ui%2Fcore)](https://bundlephobia.com/package/@arkite-ui/core)
[![Storybook](https://img.shields.io/badge/Storybook-Live%20Demo-ff4785?logo=storybook)](https://ui.foson.co/storybook/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

**[Website](https://ui.foson.co/)** · **[Storybook](https://ui.foson.co/storybook/)** · **[Getting Started](https://ui.foson.co/storybook/?path=/docs/getting-started--docs)** · **[llms.txt](https://ui.foson.co/llms.txt)** (for AI agents)

Arkite UI is not another generic component library. It focuses on the components you actually need to build multi-tenant SaaS admin panels — tenant switchers, data tables, stat dashboards, filter bars, and more.

> **Design Principle:** Pure UI only. No business logic, no auth, no stores. Domain-specific logic belongs in your project (e.g. `@ark-crm/auth`).

**Links:**

- [Website](https://ui.foson.co/) — Landing page & live demo
- [Storybook (Component Docs)](https://ui.foson.co/storybook/) — Every component, every state
- [GitHub Repository](https://github.com/foson-co/arkite-ui) — Source code
- [Issue Tracker](https://github.com/foson-co/arkite-ui/issues) — Bug reports & feature requests
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Development guide
- [CHANGELOG.md](./CHANGELOG.md) — Release history

> Maintained first for the nine production SaaS products that run on it — issues are welcome and read; PRs are reviewed on a best-effort basis.

## Features

- **SaaS-First** — AdminLayout, TenantSwitcher, FilterBar, BulkActionBar
- **Tailwind CSS v4** — CSS-first configuration with `@theme`, `@custom-variant`, `@utility`
- **TypeScript** — Full type safety with exported types and JSDoc on all components
- **Accessible** — Focus traps, ARIA attributes, keyboard navigation, a11y-tested
- **Framer Motion** — Optional animation system for Modal, Drawer, Toast
- **Theme System** — 4 built-in presets + `createTheme()` utility with CSS Variables
- **Density System** — Consistent `sm/md/lg` sizing across all interactive components
- **Tested** — 1,200+ unit tests with Vitest + Testing Library, plus real-Chromium keyboard specs and a Next.js RSC smoke test in CI
- **Bundle Monitoring** — size-limit budget (< 300 KB)

## AI-Ready

Most component libraries make coding agents guess. Arkite ships its documentation in machine-readable form, following the [llms.txt](https://llmstxt.org/) convention:

| File                                                 | Contents                                                                      | Where                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| [`llms.txt`](https://ui.foson.co/llms.txt)           | Setup, design rules, core patterns, full export inventory                     | Site root + inside the npm package |
| [`llms-full.txt`](https://ui.foson.co/llms-full.txt) | The above + complete design spec + the typed public API of every export       | Site root + inside the npm package |
| `DESIGN.md`                                          | Machine-readable design system spec (tokens, hard rules, component selection) | Inside the npm package             |
| `registry.json`                                      | Index of whole-page recipes: what each is, when to reach for it, when not     | Inside the npm package             |

Point your agent at `node_modules/@arkite-ui/core/llms-full.txt` (or the hosted URL) and it imports the right component with the right props on the first try. Both files are regenerated from the type-checked API snapshot on every build, so they can't drift from the code.

Picking a component was never the hard part — knowing which ones go together is. For whole pages there is a stronger move than generating one: install a tested composition and edit it.

```bash
npx arkite-ui add                 # list the recipes, with when / when not
npx arkite-ui add crud-list-page  # → src/pages/CrudListPage.tsx, yours to edit
```

## CLI

```bash
npx arkite-ui init                    # install deps, write theme CSS + setup helper
npx arkite-ui add                     # list whole-page recipes (with when / when not)
npx arkite-ui add crud-list-page      # copy one into src/pages/ — yours to edit
npx arkite-ui theme apply             # arkite.theme.json → CSS variables
```

A new project usually runs all three in order: `init` to wire the package up, `theme apply` once the brand is decided, `add` per page.

**`arkite.theme.json`** is how a project's brand stays reviewable — four values (`name`, `primary`, `accent`, `radius`) committed to the repo, everything else derived:

```json
{ "name": "acme", "primary": "#6a4dff", "accent": "#00b4d8", "radius": "0.5rem" }
```

Author it interactively in **Foundation → Theme Playground** (live preview, WCAG readouts), then `theme apply` to generate the CSS. Hand-copied CSS variables drift between projects; four values in a file diff.

## Installation

```bash
pnpm add @arkite-ui/core
```

### Peer Dependencies

```bash
pnpm add react react-dom tailwindcss zustand lucide-react
```

### Optional

```bash
pnpm add framer-motion    # For AnimatedModal, AnimatedDrawer, AnimatedToast
```

### Tested React versions

The peer range permits `^18 || ^19`, and both are exercised in CI — not just permitted:

|                                               | React 18    | React 19     |
| --------------------------------------------- | ----------- | ------------ |
| Unit suite (jsdom, ~1400 cases)               | ✅ every MR | ✅ every MR  |
| `tsc --noEmit`                                | ✅ every MR | ✅ every MR  |
| Keyboard/APG specs (real Chromium)            | ✅ every MR | ✅ on `main` |
| Next 15 App Router — RSC boundary + hydration | —           | ✅ every MR  |

### How React's types are resolved

Our `.d.ts` import React's types rather than inlining them (`import { ReactNode } from 'react'`), so **React types resolve against your install tree, not ours**. `@types/react` is declared as an _optional_ peer dependency — optional so JS-only consumers aren't forced to install it — which lets pnpm link the version each consumer actually uses into core's own variant directory.

The practical effect: in a monorepo, different workspaces may sit on different React majors and each still type-checks against core correctly. This is verified in CI, not assumed.

> **On `@arkite-ui/core` ≤ 0.21.1 the optional peer was not declared.** Without it, pnpm left core's variant directory with no `@types/react`, so type resolution walked up to the single hoisted copy in `node_modules/.pnpm/node_modules/` — one version for the whole repo. Any workspace whose React major differed from that hoisted copy failed like this:
>
> ```
> error TS2322: Type 'React.ReactNode' is not assignable to type
>   'import(".../@types+react@18.3.31/...").ReactNode'.
>   Type 'bigint' is not assignable to type 'ReactNode'.
> ```
>
> The `bigint` line is the tell — React 19 added it to `ReactNode`, so seeing it means two different `@types/react` are in play. Upgrading to ≥ 0.22.0 fixes it; on 0.21.1 the workaround is to put every workspace in the repo on the same React major.

## Quick Start

### 1. Import Styles

```tsx
// main.tsx or app.tsx
import '@arkite-ui/core/styles.css'
```

### 2. Tailwind Configuration (v4)

With Tailwind CSS v4, import the preset in your CSS:

```css
/* app.css */
@import 'tailwindcss';
@import '@arkite-ui/core/styles.css';

/* Only needed on @arkite-ui/core <= 0.14.2 — newer versions ship this
   themselves. Tailwind v4 skips node_modules, so point it at the library: */
@source '../node_modules/@arkite-ui/core/dist';
```

Or use the JS preset for Tailwind v4 config:

```ts
import arkitePreset from '@arkite-ui/core/tailwind'
```

### 3. Use Components

```tsx
import { AdminLayout, DataTable, Button, Badge } from '@arkite-ui/core'
```

## Components (70)

### UI Primitives

| Component                                  | Description                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| `Button`                                   | 7 variants (primary, secondary, outline, ghost, destructive, gradient, link), sm/md/lg |
| `Input`                                    | Text input with addons, error state, sm/md/lg                                          |
| `Textarea`                                 | Multi-line input with autoResize, sm/md/lg                                             |
| `Badge`                                    | Status badges with sm/md sizes (default, success, warning, destructive, info)          |
| `Select`                                   | Native select dropdown with icon and error state                                       |
| `Checkbox` / `Radio` / `Toggle` / `Switch` | Selection controls                                                                     |
| `Label`                                    | Form labels with required/optional indicators                                          |
| `Avatar`                                   | Profile images with StatusDot integration and AvatarGroup                              |
| `StatusDot`                                | Presence indicator (online/offline/busy/away) with pulse animation                     |
| `Spinner`                                  | Loading indicator (sm/md/lg)                                                           |
| `Kbd`                                      | Keyboard shortcut display (sm/md)                                                      |
| `ViewToggle`                               | Table/card view mode switcher (sm/md)                                                  |

### Layout

| Component                     | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `AdminLayout`                 | Full admin layout with sidebar, navbar, and content area |
| `Card`                        | Card with header, content, footer sub-components         |
| `Container`                   | Max-width content wrapper (sm/md/lg/xl/2xl/full)         |
| `Stack` / `HStack` / `VStack` | Flexbox layout utilities                                 |
| `Divider`                     | Visual separator with optional label                     |

### Navigation

| Component        | Description                                        |
| ---------------- | -------------------------------------------------- |
| `Sidebar`        | Collapsible sidebar with grouped navigation items  |
| `TenantSwitcher` | Dropdown for switching between tenants with search |
| `Navbar`         | Top navigation bar with brand and content areas    |
| `Breadcrumb`     | Path breadcrumbs with truncation                   |
| `Tabs`           | Tab navigation                                     |

### Data Display

| Component                | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `DataTable`              | Table with sorting, pagination, loading states, custom cells          |
| `Table`                  | Composable table with `stickyHeader` and `stickyAction` columns       |
| `FilterBar`              | Responsive slot-based toolbar (search + filters + actions)            |
| `BulkActionBar`          | Floating overlay bar for bulk selection actions                       |
| `VirtualList`            | Virtualized scrolling for 10,000+ items (@tanstack/react-virtual)     |
| `InfiniteScroll`         | Cursor-based pagination with scroll detection                         |
| `StatCard` / `StatGroup` | Metrics display with trend indicators                                 |
| `EmptyState`             | Pre-configured empty states (no data, no results, error, 404/403/500) |
| `Calendar`               | Month view with date selection and constraints                        |
| `Timeline`               | Vertical timeline for audit logs and activity feeds                   |
| `Steps`                  | Step indicator for wizard flows                                       |

### Form

| Component     | Description                                                            |
| ------------- | ---------------------------------------------------------------------- |
| `Form`        | Context-based form with FormField, FormLabel, FormControl, FormMessage |
| `SearchInput` | Search field with debounce and clear button                            |
| `FileUpload`  | Drag-and-drop file upload with validation                              |
| `DatePicker`  | Date selection with calendar popover (sm/md/lg)                        |
| `Combobox`    | Searchable select with single/multi-select, tags, async (sm/md/lg)     |

### Feedback

| Component                       | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `Modal`                         | Dialog with focus trap, portal rendering, escape to close   |
| `Drawer`                        | Slide-out panel (left, right, top, bottom)                  |
| `Toast`                         | Notification system with Zustand store (`useToast`)         |
| `ConfirmDialog`                 | Confirmation modal (destructive/warning variants)           |
| `DeleteConfirmDialog`           | Pre-configured destructive confirm with `itemName`          |
| `Alert`                         | Inline alert messages (info, success, warning, destructive) |
| `Progress` / `CircularProgress` | Progress bars (determinate, indeterminate, striped)         |
| `Skeleton`                      | Loading placeholders (text, avatar, card, table patterns)   |

### Overlay

| Component                   | Description                                        |
| --------------------------- | -------------------------------------------------- |
| `Popover`                   | Radix-based popover with arrow support             |
| `Tooltip` / `SimpleTooltip` | Radix-based tooltip with convenience wrapper       |
| `DropdownMenu`              | Full Radix dropdown with checkbox, radio, sub-menu |
| `CommandPalette`            | Cmd+K command palette (cmdk-based)                 |

### Actions

| Component       | Description                                     |
| --------------- | ----------------------------------------------- |
| `ActionButtons` | Grouped action buttons for page headers         |
| `Pagination`    | Page navigation with size selector              |
| `PageHeader`    | Page header with title, breadcrumb, and actions |
| `ErrorBoundary` | React error boundary with fallback UI           |

### Motion (Optional)

Requires `framer-motion` peer dependency.

| Component                | Description                             |
| ------------------------ | --------------------------------------- |
| `AnimatedModal`          | Modal with scale and fade animations    |
| `AnimatedDrawer`         | Slide-in drawer with spring transitions |
| `AnimatedToastContainer` | Animated toast notifications            |

## Usage Examples

### Admin Layout

```tsx
import { AdminLayout, type AdminNavGroup } from '@arkite-ui/core'

const navigation: AdminNavGroup[] = [
  {
    label: 'Overview',
    items: [{ path: '/dashboard', label: 'Dashboard' }],
  },
  {
    label: 'Data',
    items: [
      { path: '/sources', label: 'Sources' },
      { path: '/runs', label: 'Runs' },
    ],
  },
]

function App() {
  return (
    <AdminLayout
      currentPath={location.pathname}
      onNavigate={(path) => navigate(path)}
      navigation={navigation}
      brand={{ name: 'My App', shortName: 'M' }}
      user={{ name: 'John', email: 'john@example.com', roleLabel: 'Admin' }}
      onLogout={() => logout()}
    >
      <h1>Dashboard</h1>
    </AdminLayout>
  )
}
```

### Data Table

```tsx
import { DataTable, Badge } from '@arkite-ui/core'

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status', cell: (row) => <Badge>{row.status}</Badge> },
  { key: 'createdAt', header: 'Created', sortable: true },
]

<DataTable columns={columns} data={items} getRowKey={(row) => row.id} />
```

### Filter Bar + Bulk Actions

```tsx
import { FilterBar, FilterBarSearch, FilterBarFilters, FilterBarActions, BulkActionBar, Button } from '@arkite-ui/core'

<FilterBar>
  <FilterBarSearch value={search} onChange={setSearch} placeholder="Search users..." />
  <FilterBarFilters>
    <Select options={roles} value={role} onChange={setRole} />
  </FilterBarFilters>
  <FilterBarActions>
    <Button>Add User</Button>
  </FilterBarActions>
</FilterBar>

<BulkActionBar
  selectedCount={selected.length}
  onClear={() => setSelected([])}
>
  <Button variant="destructive" size="sm">Delete</Button>
</BulkActionBar>
```

### Toast Notifications

```tsx
import { useToast, ToastContainer } from '@arkite-ui/core'

function App() {
  const toast = useToast()

  return (
    <>
      <Button onClick={() => toast.success('Saved successfully')}>Save</Button>
      <ToastContainer position="top-right" />
    </>
  )
}
```

Error toasts in `catch` blocks are one line — register your app's error parser
once at startup, then pass the raw error:

```tsx
// app entry (once)
toast.configure({ formatError: getErrorMessage })

// every call site
try {
  await save()
} catch (err) {
  toast.fromError(err, { prefix: 'Failed to save' }) // title + parsed description
}
```

### Stats Dashboard

```tsx
import { StatGroup, StatCard } from '@arkite-ui/core'
import { Database, Activity } from 'lucide-react'
;<StatGroup columns={4}>
  <StatCard label="Total Sources" value="128" change="+12%" trend="up" icon={<Database />} />
  <StatCard label="Active Runs" value="24" trend="neutral" icon={<Activity />} />
</StatGroup>
```

## Theming

### Built-in Presets

4 theme presets: **Default** (Stripe-inspired), **Neutral** (Zinc), **Ocean** (Blue), **Forest** (Green).

```tsx
import { applyTheme, themePresets } from '@arkite-ui/core'
applyTheme(themePresets.ocean)
```

### Custom Theme

```tsx
import { createTheme, applyTheme } from '@arkite-ui/core'

const myTheme = createTheme({
  primary: '#FF6B00',
  accent: '#00B4D8',
  radius: '0.75rem',
})

applyTheme(myTheme)
```

Foregrounds are picked by actual WCAG contrast (black or white, whichever contrasts more), so every generated pair meets AA (4.5:1) for any brand color — in light and dark mode alike.

## API Stability

The entire public API surface — every export, and every own-declared member of every Props type — is snapshotted in [`api-report.txt`](./api-report.txt) and enforced by a test. Any change to the surface fails CI until the snapshot is deliberately regenerated (`pnpm vitest run src/api-surface.test.ts -u`), which turns the API diff into a reviewable artifact in the merge request. Deprecations warn for at least one minor before removal; v1.0 removals ship with a codemod.

## Localization

All built-in strings — placeholders, empty states, pagination, calendar month/weekday names, and every aria-label — resolve through `LocaleProvider`. Ships with `enUS` (default) and `zhTW`:

```tsx
import { LocaleProvider, zhTW } from '@arkite-ui/core'
;<LocaleProvider locale={zhTW}>
  <App />
</LocaleProvider>
```

Partial locales fall back to English per key, and explicit component props always win over locale values.

### CSS Variables Override

```css
:root {
  --primary: 250 100% 65%;
  --accent: 168 80% 45%;
  --radius: 0.5rem;
  --status-online: 145 65% 42%;
  --status-offline: 220 9% 46%;
  --status-busy: 0 72% 51%;
  --status-away: 38 92% 50%;
}
```

## Project Structure

```
src/
├── components/       # All components (flat directory, 55+ components)
│   ├── button/       # Button.tsx, Button.test.tsx, index.ts
│   ├── sidebar/
│   └── ...
├── theme/            # Theme presets, createTheme, applyTheme, chart colors
├── styles/           # CSS variables, Tailwind layers, status/chart tokens
├── utils/            # cn() utility, breadcrumb helpers
├── stories/          # Storybook stories (by category) + MDX docs
├── tailwind-preset.ts
└── index.ts          # Public API barrel export
```

## Development

```bash
pnpm install             # Install dependencies
pnpm build               # Build the package (tsup)
pnpm dev                 # Watch mode
pnpm storybook           # Launch Storybook (http://localhost:6006)
pnpm test                # Run unit tests
pnpm test:watch          # Tests in watch mode
pnpm test:coverage       # Tests with coverage report
pnpm lint                # Lint source code
pnpm typecheck           # Type check
pnpm size                # Check bundle size budget
pnpm clean               # Clean dist/
```

## CI/CD Pipeline

Every push triggers **lint**, **typecheck**, **test**, **keyboard:browser**, **smoke:next**, and **size** checks, plus the React 19 matrix (**typecheck:react19**, **test:react19**). On merge requests, **changeset:check** verifies a changeset is present. On `main`, **keyboard:browser:react19** re-runs the APG keyboard specs under React 19 in real Chromium, and **types:mixed-major** packs the tarball into a two-app fixture on different React majors to verify consumer-side type resolution.

On git tags:

1. **Builds Storybook** and deploys to GitLab Pages
2. **Publishes** to GitLab Package Registry (automatic)
3. **Publishes** to npm public registry (manual trigger)

### Release Process (Changesets)

```bash
# 1. Add a changeset for your changes
pnpm changeset

# 2. When ready to release, version and update CHANGELOG
pnpm version-packages

# 3. Verify + build + publish (一鍵完成)
pnpm publish-package
```

### 本機發布前置需求

發布到 GitLab Package Registry 需要設定環境變數 `NPM_TOKEN`。

```bash
export NPM_TOKEN=your_gitlab_personal_access_token
```

**Token 來源：**

1. 前往 GitLab → 右上角頭像 → Edit profile → Access Tokens
   或直接開啟：`https://foson.co/-/user_settings/personal_access_tokens`
2. 建立新 token，設定：
   - Name：`arkite-ui-publish`（任意命名）
   - Scopes：勾選 **`api`**
3. 複製產生的 token，設定為環境變數

建議將 `export NPM_TOKEN=...` 加到你的 shell 設定檔（`~/.zshrc` 或 `~/.bashrc`）以永久生效：

```bash
echo 'export NPM_TOKEN=your_token_here' >> ~/.zshrc
source ~/.zshrc
```

> CI/CD 環境不需要此步驟，pipeline 會自動使用 `$CI_JOB_TOKEN`。

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, code style, and PR process.

## About

Arkite UI is built and maintained by **[Foson](https://foson.co)**, a Taiwan-based software company, and powers the admin panels of the Ark product family. Follow the project on [GitHub](https://github.com/foson-co/arkite-ui) or try the [live starter demo](https://starter.foson.co).

> **Disambiguation:** Arkite UI (this project, by Foson) is not affiliated with Arkite NV ([arkite.com](https://arkite.com)), the industrial operator-guidance platform.

## License

[MIT](./LICENSE)
