---
'@arkite-ui/core': minor
---

Pad overlays away from every screen cutout, not just the bottom one

`Drawer` and `AnimatedDrawer` anchored to a viewport edge without any safe-area
inset, and the two components carried byte-identical copies of the same position
table. On a notched phone held in **landscape** the cutout moves to the *side*,
so a `position="bottom"` sheet lost a column of text off its leading edge —
reported from a Capacitor stock-count app whose operators work rotated.

Each position now pads the edges its own edge cannot cover: `bottom`/`top` gain
left/right insets, `left`/`right` gain top/bottom. The two position tables are
now one shared internal constant, so they cannot drift apart again.
`AdminLayout`'s mobile `bottomNav` gained the matching left/right insets.

Insets are padding, so panels keep their `size` footprint, and `env()` resolves
to 0 without `viewport-fit=cover` — no visual change on desktop or on apps that
have not opted into edge-to-edge. A `className` you pass still wins.

**Retires a consumer workaround:** apps hand-adding
`pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]` to every Drawer
(five copies of one string is five places to miss it) can drop that shared
constant. `SheetSelect` could not be worked around at all — its sheet classes
were hardcoded and `className` goes to the trigger — which is the second half of
this release.

`SheetSelect` gains `classNames` (`trigger`, `sheet`) so the bottom sheet is
reachable from outside without out-specifying the component from global CSS.
Additive; `className` keeps its current meaning.

Closes #2.
