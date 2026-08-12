# DESIGN.md — Arkite UI Design System

> Machine-readable design spec for `@arkite-ui/core`. Feed this file to AI coding agents (and humans) building admin UIs with this library, so generated pages follow one consistent visual language instead of inventing their own.
>
> Source of truth: `src/styles/index.css` (tokens), `@arkite-ui/core/tokens` (JS values), Storybook (live docs). This file summarizes the rules; when in doubt, the code wins.

## Identity

**Arkite UI** is a component library for **multi-tenant SaaS admin panels**: data-dense, utilitarian, calm. React 18/19 + Tailwind CSS v4 + Radix UI. Light and dark mode are equal citizens — dark mode is automatic via tokens, never hand-tuned per page.

Design philosophy:

- **Clarity over decoration** — restrained color, generous whitespace inside a dense information layout
- **Semantic, not literal** — every color/radius/shadow flows through named tokens; nothing is hardcoded
- **Composable** — compound components (Card + CardHeader…), slots and render-props over configuration flags

## Hard rules (for AI agents)

1. **Import UI from `@arkite-ui/core`** (styles: `@arkite-ui/core/styles.css`). Never rebuild primitives that exist — check the component inventory below first.
2. **Never use raw Tailwind palette classes** (`bg-red-50`, `text-blue-800`, `text-gray-500`…). Use semantic utilities only: `bg-destructive-soft`, `text-muted-foreground`, `border-border`.
3. **Never write `dark:` color overrides.** Tokens already resolve dark mode. `dark:` is acceptable only for non-color adjustments in rare cases.
4. **Never use arbitrary values** (`text-[13px]`, `shadow-[…]`, `rounded-[…]`). Use the token scale; if a size seems missing, use the nearest step.
5. **Domain logic stays out of shared components.** API calls, routes, auth, and business models belong to the app layer; UI components receive data via props and emit events via callbacks.

## Color system

Colors are HSL triplets in CSS variables (`:root` light, `.dark` dark), exposed as Tailwind utilities via `@theme`. Always pair a background token with its `-foreground`.

### Core

| Token | Utility example | Use |
|---|---|---|
| `background` / `foreground` | `bg-background text-foreground` | Page base |
| `card` / `card-foreground` | `bg-card` | Elevated surfaces |
| `muted` / `muted-foreground` | `text-muted-foreground` | Secondary text, subtle fills |
| `primary` / `primary-foreground` | `bg-primary text-primary-foreground` | Brand actions (violet) |
| `secondary` / `secondary-foreground` | `bg-secondary` | Low-emphasis actions |
| `accent` / `accent-foreground` | `bg-accent` | Highlights (teal) |
| `border`, `input`, `ring` | `border-border`, `ring-ring` | Hairlines, form borders, focus |

### Status (solid + soft layer)

Four statuses: `success` (green), `warning` (amber), `destructive` (red), `info` (blue). Each has:

- **Solid**: `bg-{status} text-{status}-foreground` — buttons, badges, dots
- **Soft layer**: `bg-{status}-soft text-{status}-soft-foreground border-{status}-border` — alerts, toasts, tinted panels

Naming rule: the "dangerous/negative" semantic is always **`destructive`** (never `error`) in variant props and tokens.

### Contrast (WCAG AA)

- Every built-in fg/bg pair — tokens, all four presets, light and dark, solid and soft — meets **WCAG AA (4.5:1)**, enforced by regression tests (`tokens.test.ts`, `presets.test.ts`). This is why rule 2 exists: paired tokens are guaranteed readable; hand-picked palette classes are not.
- Foreground follows **background luminance, not semantics**: light backgrounds get dark text, dark backgrounds get light text (e.g. dark-mode `info` is black-on-blue, not white). Never re-pair a `-foreground` onto a different background.
- `createTheme()` picks black/white foregrounds by real contrast ratio — any brand color yields AA-passing pairs automatically.
- Custom palettes (raw CSS variable overrides): validate with the Storybook **Foundation / Design Tokens → Contrast Audit** page.

### Charts & presence

`chart-1`…`chart-5` for data series (use in order). `status-online/offline/busy/away` for presence dots (use `StatusDot`).

## Typography

- Sans: Inter (system fallback). Mono: JetBrains Mono — code, IDs, `InlineCode`, `Kbd`.
- Scale: `text-2xs` (10px, micro labels) → `text-xs` (12px, captions/badges) → `text-sm` (14px, **default body in admin UIs**) → `text-base` (16px) → `text-xl`/`text-2xl`/`text-3xl` (headings via `PageHeader size`).
- Numbers in tables/counters: `tabular-nums` (Badge `count` variant has it built in).

## Spacing, radius, elevation

- **Spacing**: 4px grid (Tailwind scale). Cards: compound children pad `p-4`; the root's `padding` prop defaults to `none` (`padding="lg"` = `p-6`). `density="compact"` for dashboard widgets. Forms stack on `gap-4`; sections on `gap-6`.
- **Radius**: everything derives from one `--radius` (0.5rem): `rounded-lg` = var, `md` = −2px, `sm` = −4px. Pills/avatars use `rounded-full`. Changing `--radius` rethemes the whole library.
- **Elevation**: soft low-alpha shadow scale `shadow-xs` → `shadow-2xl`. Cards sit at `xs/sm`; popovers `md/lg`; modals `xl`. Special: `shadow-sticky-left`, `shadow-sticky-right`, `shadow-sticky-header` for sticky table edges.
- **Motion**: durations `fast` 100ms / `normal` 150ms / `slow` 300ms; easing tokens incl. `bounce`. Optional framer-motion components live in `@arkite-ui/core/motion`.

## Component inventory — what to reach for

| Need | Use | Not |
|---|---|---|
| Page title + actions | `PageHeader` (`size`, `badge`, `onBack`) | Hand-rolled flex headers |
| Section on a page | `Card` (+`CardHeader actions`, `density="compact"` for widgets) | Bare bordered divs |
| **Any tabular data — including plain read-only lists** | `Table` family (`Table`/`TableHeader`/`TableRow`/`TableHead`/`TableBody`/`TableCell` + `TableEmpty`/`TableLoading` auto-colSpan rows) — styled `<table>` with tokens, dark mode, `compact` density, `variant="striped"`, `hoverable`, cell `align`/`numeric` (tabular figures), `stickyHeader`, `stickyLead`/`stickyAction` frozen columns built in | Raw `<table><td className="px-3 py-2 text-slate-600">` (hardcodes palette + dark mode by hand); hand-written `colSpan` empty rows; `text-right` repeated per cell |
| Data list w/ sorting/filters/selection/pagination | `DataTable` (column-config driven; `compact` density, `rowClassName` for conditional rows, `Column.pinned: 'left'⎮'right'` frozen columns; `minWidth` for wide tables; server-side via `totalRows` + `useServerTable`) | Rebuilding sort/pagination around a raw table |
| A row of pills/tabs/chips that outgrows narrow viewports | `ScrollFade` (edge fades driven by real scroll state, shown only where content is hidden) | Bare `overflow-x-auto` with no affordance; hand-rolled gradient CSS |
| Huge lists (1000+ rows) | `VirtualList` | Rendering everything |
| KPI numbers | `Stat` / `StatCard` / `StatGroup` + `Sparkline` | Custom stat blocks |
| Filters above a table | `FilterBar` (+`FilterBarSearch/Filters/Actions`, `FilterSelect`) | Ad-hoc toolbars |
| A **labelled** filter cluster ("Period: 1D 7D 30D") | `FilterBarGroup label="Period"` wrapping a `SegmentedControl` (2–5 mutually exclusive presets). `FilterSelect`'s `label` only prefixes its "all" option, so it cannot show a visible group label | A hand-rolled label `<span>` + flex row (ships without `flex-wrap`, so one group's width pushes the page sideways on mobile); hand-styled active/inactive pills with raw palette classes |
| Date range **inside a filter bar** | `DateRangePicker labelPlacement="inside"` — a stacked label adds a line above the inputs, so the default `"top"` leaves them sitting ~10px below the single-line controls next to them | Leaving `labelPlacement` at `"top"` in a toolbar and nudging it back into line with margins |
| Forms | `Form` family (`FormField label errorMessage`) + `Input`/`Select`/`Textarea`/`NumberInput`/`DatePicker`/`Combobox`/`TagInput`/`ColorPicker`/`FileUpload`/`ImageUpload` | Uncontrolled raw inputs |
| OTP / verification code | `PinInput` (`length`, `type`, `onComplete`; SMS autofill built in) | Hand-styled single inputs with tracking CSS |
| File pick from a custom trigger (thumbnail, icon, menu item) | `FileTrigger` (headless — makes any element open the picker) | Hand-rolled hidden `<input type="file">` |
| Action styled as a text link (e.g. in a table cell) | `Button variant="link"` | `eslint-disable` + raw `<button>` with underline classes |
| Whole card/row clickable | `Card interactive onClick` (button semantics, keyboard included); table rows: `DataTable onRowClick` | Wrapping cards in raw `<button>` or clickable `<div>`s |
| Mobile select | `SheetSelect` (bottom sheet) | Desktop `Select` on touch UIs |
| Binary toggle **in forms / settings pages** | `Switch` (canonical; `Toggle` is deprecated) | Checkbox-as-toggle |
| Toggleable status **inside a data table** | `Badge` wrapped in `Button variant="ghost" size="sm"` with `aria-pressed` — a clickable status pill. N switches down a column out-shout the data; a pill keeps density and stays scannable. Exception: `Switch` is fine when toggling IS the page's primary task (e.g. a feature-flag admin list) and there's at most one toggle column | `Switch` repeated per row in dense tables; "making everything else heavier to compensate" |
| Confirmation | `ConfirmDialog` / `DeleteConfirmDialog` | window.confirm, custom modals |
| Overlay panels | `Modal` (centered; height-capped with scrolling body) / `Drawer` (side/bottom) / `Popover` (anchored) | Fixed-position divs; hand-rolled backdrop + focus trap |
| Form dialog (fields in body, submit in footer) | `Modal onSubmit` — wraps the dialog in a real `<form>`, footer `type="submit"` button just works | `form="<id>"` attribute plumbing; re-implementing the dialog to get a form inside |
| Notifications | `toast.success/error/…` + `ImperativeToastContainer` (or `useToast` + `ToastContainer`) | Custom snackbars |
| Error in a `catch` block | `toast.fromError(err, { prefix: '儲存失敗' })` — wire the app's parser ONCE at startup: `toast.configure({ formatError: getErrorMessage })` | ``toast.error(`失敗：${getErrorMessage(err)}`)`` boilerplate at every call site |
| Inline callout | `Alert` (`variant`, `dismissible onClose`) | Colored divs |
| Empty / error / loading | `EmptyState` / `ErrorState` / `Skeleton` family / `Spinner` / `LoadingOverlay` (`fullscreen`) | Blank screens |
| Status chips | `Badge` (7 variants + `count`, `max`) / `StatusDot` | Colored spans |
| App frame | `AdminLayout` (`sidebarVariant="classic|rail"`, `subNav`, `classNames`, mobile: `hideSidebar="mobile"` + `bottomNav`) + `Sidebar`/`Navbar`/`Breadcrumb`/`TenantSwitcher` | Custom shells; global CSS targeting AdminLayout internals |
| Steps / history | `Steps`, `Timeline`, `Calendar`, `Tree`, `Pagination` | Custom widgets |
| Tab strip down the side (landscape phones, scarce vertical space) | `Tabs orientation="vertical"` — also moves the `underline` active rule to the inline edge, sets `aria-orientation`, and switches arrow-key navigation to the up/down axis | `className="flex-col"` on `TabsList` alone: the layout flips but the indicator, ARIA axis, and keyboard axis do not |

**Table vs DataTable — the decision rule (field-tested across a 47-file consumer migration):**

1. **Data list with header semantics → `DataTable`.** This includes **runtime-determined dynamic columns** — one column per data source / schema field / period is fine: build the `Column<T>[]` array from the data itself. `cell(row, index)` receives the row index, so cross-row computation (compare with the previous row) works too. Don't fall back to a raw `<table>` just because columns aren't static.
2. **Headerless compact list / key-value display → `Table` family** — *less* code than a column config, still inherits tokens, dark mode, `compact`, `stickyHeader`, frozen columns. It also maps 1:1 onto markdown/HTML renderer overrides (`td`/`th` → `TableCell`/`TableHead`; `align` tolerates HTML's deprecated values).
3. **Visual matrices** (cells are colored blocks, per-cell dynamic styling) → discrete/binary grades: `Column.cellClassName` (class string per row). **Continuous values** (heatmap alpha computed at runtime): `Column.cellStyle` — class strings can't express continuous values and Tailwind can't compile runtime-generated classes. Vertical headers: `Column.headerStyle` (`writingMode`).
4. **Wide tables → `minWidth`.** Declare the width the table needs (`minWidth={960}`) and it scrolls instead of squashing; edge fades turn on automatically. See Composition rules below for why, and why `pinned` is inert without it.

Never hand-roll a raw `<table>`: hardcoded `text-slate-*`/manual `dark:` styling always follows.

**Whole pages** — six tested compositions (CRUD list, server-side table, dashboard, detail + drawer edit, form page, tenant admin shell) ship with the package: machine-readable index in `registry.json`, source under `src/stories/recipes/`. Match the page you are building against each entry's `when` / `notWhen` **before** assembling one from scratch, then install it rather than retyping it — `npx arkite-ui add <recipe>` writes it into the project, already satisfying the composition rules below; what's left to change is the sample data and the API calls.

## Composition rules

Picking the right component is the easy half. Every one of these was found in consumer code where each component was correct on its own and the *pair* was wrong — and all of them fail **silently**, which is why the library now says so at dev time.

| Rule | Why | Dev warning |
|---|---|---|
| **Wide tables need `minWidth`, and `pinned` is inert without it** | `width: 100%` + auto layout squeezes columns to min-content *before* overflowing. With CJK headers (min-content = one glyph) a dense table collapses to ~30px columns and 4-line headers instead of scrolling, so frozen columns never engage. `Column.width` is a hint to the layout algorithm, not a floor | ✅ `pinned` without `minWidth` |
| **`stickyHeader` sticks to whatever scrolls — let the table own it** | Sticky resolves against the nearest scrollport. Pass `maxHeight` (or `fillHeight` in a determinate-height flex chain) to `Table`/`DataTable`. Wrapping the table in your own `overflow-auto` box kills it: the header sticks to an inner box that never scrolls vertically and rides out of view. A11y attributes for the scroll region go through `wrapperProps` (`tabIndex`, `role`, `aria-label`) | ✅ `stickyHeader` without a height limit |
| **Don't wrap `DataTable` in a `Card`** | It already renders a bordered, rounded surface, so a Card around it stacks two frames. For a title: `<Card padding="none">` + `CardHeader` + `<CardContent className="p-0">` + `bordered={false}` on the table | ✅ bordered table inside a Card |
| **Date range in a toolbar needs `labelPlacement="inside"`** | A stacked label makes the control two lines tall, leaving its inputs ~10px below the single-line controls beside it | ✅ `labelPlacement="top"` inside a `FilterBar` |
| **Labelled filter clusters go through `FilterBarGroup`** | Hand-rolled label + flex row ships without `flex-wrap`/`min-w-0`, so one group's width pushes the whole page sideways on mobile | — |
| **Vertical tabs go through `orientation`, not `className`** | className flips the layout only; the `underline` indicator, `aria-orientation`, and the keyboard axis all stay horizontal | — |

Warnings are dev-only (stripped in production), fire once per rule, and read React context rather than inspecting parent DOM — so they survive wrappers and portals. They are tuned to stay silent on code that is already correct by other means: the Card rule, for instance, accepts a `className` that neutralises the frame.

## API conventions (follow when composing or wrapping)

- Change handlers on value components: **`onChange(value)`** (raw value, not event) — native-input wrappers keep React's event `onChange`
- Error display on form controls: **`error?: boolean` + `errorMessage?: string`**
- Open/close: **`open` + `onClose`** for dialogs/drawers/overlays; `defaultX` for uncontrolled counterparts. Exceptions: Radix passthrough components (Popover/Tooltip/DropdownMenu) and trigger-anchored pickers (Combobox/DatePicker/SheetSelect) expose Radix-style **`open` + `onOpenChange` + `defaultOpen`** — intentional, do not "fix"
- Non-overlay expand/collapse state uses the **`x` / `onXChange` / `defaultX`** triple (CollapsibleSection `open`, Sidebar `collapsed`)
- Sizes: **`sm | md | lg` as the baseline** (`md` default) — components may extend both ends (`xs`, `xl`, `icon`, `full`) when the domain calls for it; variants: `primary | secondary | outline | ghost | destructive` (Button additionally ships `gradient`)
- Semantic status values are `success | warning | destructive | info` — never `error`/`danger` in props. `EmptyState`'s `error` variant is a *scenario* (error page), not a color, and `StatusDot`'s `online/offline/busy/away` is a presence axis — both are separate value domains
- Booleans are bare (`disabled`, `loading`, `open`) — never `isDisabled`
- Collection props: tabular/hierarchical data is **`data`** (DataTable/Tree/Sparkline), flat renderable lists are **`items`** (Timeline/VirtualList/Breadcrumb); `Steps.steps` is grandfathered. Key extraction is **`get{Noun}Key(x, index)`** (`getRowKey`, `getItemKey`)
- Selection callbacks: **`onSelect(value, object?)`** — first arg is the selected value/key, optional second is the full object. Multi-select checkbox trees/tables use **`onSelectionChange`**
- Navigation: data-layer props are **`path`** (router semantics), render-layer receives **`href`** (DOM semantics); custom link rendering is **`renderLink({ href, children, className, active })`** across all nav components
- Definition objects (table columns, nav items) may use short render-prop names (`cell`, `icon`) — the `renderX` rule applies to component props, not def-object fields
- Escape hatches: `className` everywhere (merged via `cn`), `renderX` props for custom item rendering

## Theming

Brand retheme = override CSS variables (or `createTheme()` from a hex, `applyTheme()` at runtime). Four built-in presets: Default, Neutral, Ocean, Forest.

Prefer committing the brand as **`arkite.theme.json`** (`name`, `primary`, `accent`, `radius`) and generating from it — `npx arkite-ui theme apply`, or `themeFileToCSS(parseThemeFile(json))` from `@arkite-ui/core/theme` (server-safe, no components). Hand-copied CSS variables drift silently across projects; four values in a file diff. Because components consume only tokens, a future `[data-style="…"]` preset can restyle the entire library (radius, shadows, palette, density) with zero component changes.

## Localization

Every built-in string (placeholders, empty states, pagination, calendar month/weekday names, and all aria-labels) resolves through `LocaleProvider`. Rules:

1. **Chinese apps must mount `<LocaleProvider locale={zhTW}>` at the root** — without it, screen readers announce English aria-labels inside a Chinese UI.
2. Per-instance text still goes through props (`placeholder`, `emptyMessage`, …) — props always win over the locale.
3. Never hardcode UI strings that a component already provides via locale; partial locales (`{ spinner: { loading: '…' } }`) fall back to English per key.
