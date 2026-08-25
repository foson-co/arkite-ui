---
'@arkite-ui/core': minor
---

`Card`: `onClick` alone now grants button semantics. `interactive` is deprecated and ignored.

Previously the condition was `interactive && onClick != null`, so a card given only `onClick` fired on click but had no `role`, no `tabIndex`, and no keyboard activation — reachable with a mouse, unreachable with a keyboard (WCAG 2.1.1). The prop's own JSDoc described that broken combination as the supported usage, so following the documentation produced the defect. A scan of 11 fleet projects (631 `<Card>`, 27 with `onClick`) found 11 sites in that state; the 15 sites that already pass `interactive` are unaffected, since the condition was only relaxed.

**Action needed for cards that contain their own control.** Granting the card button semantics means a card wrapping its own button or link now yields **two tab stops**. Enter on the inner control still does not double-activate the card, but the extra stop is real. Five sites have this shape and should move the card-level navigation onto an explicit link or button inside the card:

- `ark-shield` — `app/AssessmentListPage.tsx`, `admin/TenantListPage.tsx`, `admin/TemplateManagerPage.tsx`, `admin/EventTypeManagerPage.tsx`
- `ark-crm` — `apps/platform-admin/src/pages/CompanyListPage.tsx`

`interactive` still type-checks and can stay in existing call sites; it will be removed in the next major.
