---
'@arkite-ui/core': patch
---

fix(checkbox, radio): make the visual box/circle clickable

`Checkbox` and `Radio` rendered their visible indicator as a bare `<div>` next to
an `sr-only` input, with no `htmlFor` association. Clicking the box or circle —
the part users actually aim at — did nothing; only the label text toggled the
control. `CheckboxCard` and `Toggle` already got this right.

The indicator is now a `<label htmlFor>` sibling of the input (same approach as
`Toggle`), so clicking it toggles the control and it carries `cursor-pointer`.
The check icon is `aria-hidden`, so the accessible name still comes from the
label text only. No API change.
