---
'@arkite-ui/core': patch
---

Two more dev-only composition guards, both pure prop checks with no false positives:

- **`DataTable` with `pinned` columns but no `minWidth`.** Frozen columns only engage once the table is wider than its container, and without `minWidth` it never is — auto layout squeezes the columns to min-content instead, so `pinned` silently does nothing. Found across 8 files in one consumer audit; this is the highest-evidence rule of the set.
- **`Table` with `stickyHeader` but neither `maxHeight` nor `fillHeight`.** Sticky resolves against the nearest scrollport; with no height limit nothing scrolls vertically and the header rides away with the rows. Covers `DataTable` too, which forwards both props.

Also tightens the `DataTable`-inside-a-`Card` guard shipped in 0.19.0: it no longer fires when `className` already neutralises the frame (`border-0`). Reviewing a consumer that had fixed the double border the pre-`bordered` way turned up 5 call sites that were visually correct but would have been warned at — a guard that cries wolf gets ignored.

Not built: an equivalent guard for the `Table` family's per-cell `stickyLead`/`stickyAction`. It would need context plumbing through `TableHead`/`TableCell`, and a downstream audit found zero usages — no evidence, so no machinery.
