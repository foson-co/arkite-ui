---
'@arkite-ui/core': minor
---

`DateRangePicker` gains `labelPlacement`, and its inputs finally have accessible names.

**Layout.** The field labels were always stacked above the inputs with no way to turn them off, so dropping the picker into a `FilterBar` pushed its inputs ~10px below the search box and select beside it — measured on the starter's Billing page. `labelPlacement="inside"` moves the label into the field as its placeholder (format hint relocates to `title`), keeping the toolbar on one line; `"none"` drops the visible label but keeps the format placeholder. Default stays `"top"`, so existing usage is unchanged.

**Accessibility fix.** The labels rendered without `htmlFor` and the inputs without `id` or `aria-label`, which left both date fields with no accessible name in every placement. Labels are now associated with their inputs, and the non-`"top"` placements carry the label as `aria-label`.
