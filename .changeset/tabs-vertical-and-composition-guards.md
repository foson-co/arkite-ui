---
'@arkite-ui/core': minor
---

Vertical `Tabs` (with the keyboard navigation the tablist never had), and the first two composition guards.

**`Tabs` gains `orientation`.** A side strip is the standard shape when vertical space is scarce, but `className` could only flip the layout: the `underline` variant's active rule stayed a bottom border, and the tablist never declared `aria-orientation`. `orientation="vertical"` moves the rule to the inline edge, sets the ARIA axis, and stacks the panel beside the strip. Default `'horizontal'`, so existing usage is unchanged.

**`Tabs` now implements the ARIA tabs keyboard pattern.** It previously had none at all — no arrow-key handling in either axis, and every trigger was its own tab stop. Arrow keys now move along the strip's axis (left/right when horizontal, up/down when vertical) with wrap-around, `Home`/`End` jump to the ends, disabled tabs are skipped, activation follows focus, and roving `tabindex` makes the whole tablist a single tab stop.

**Composition guards (dev-only, stripped in production).** Wrong compositions used to fail silently. Two now say so:

- `DataTable` inside a `Card` while still drawing its own frame — the two borders stack. It also gains `bordered` so dropping the frame is a prop rather than a `className` override.
- `DateRangePicker` with `labelPlacement="top"` inside a `FilterBar` — the stacked label leaves its inputs out of alignment with the single-line controls beside them.

Both detect their context through React context rather than inspecting parent DOM nodes, so they survive wrappers and portals and cost nothing at runtime in production.
