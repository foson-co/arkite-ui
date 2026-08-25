---
'@arkite-ui/core': patch
---

`Card`: correct the `interactive` JSDoc and cover the `onClick`-without-`interactive` combination with tests. Documentation and tests only — no behavior change.

The JSDoc said button semantics apply "with `onClick` present", but the actual condition is `interactive && onClick != null`. Following the documented usage produced a card that fires on click yet has no `role`, no `tabIndex`, and no keyboard activation. The corrected text states the requirement and flags the gap.
