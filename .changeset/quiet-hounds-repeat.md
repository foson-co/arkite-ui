---
'@arkite-ui/core': minor
---

Close the theme-artifact loop: `arkite-ui theme apply`, plus a server-safe `/theme` entry point.

The playground could already emit `arkite.theme.json`, but nothing consumed it — so a project's brand still ended up as CSS variables hand-copied between repos, drifting with no way to measure how far. The CLI reads the file and writes the CSS:

```bash
npx arkite-ui theme apply                                    # → src/styles/arkite-theme.css
npx arkite-ui theme apply brand.json --out src/brand.css
npx arkite-ui theme apply --print                            # stdout, for a build pipeline
npx arkite-ui theme apply --selector '[data-tenant="acme"]'  # scoped per tenant
```

Generation goes through the library's own `createTheme`, not a second implementation in the CLI — a copy would drift the first time a token is added. Reaching it from plain Node needed an entry point that loads no components, so **`@arkite-ui/core/theme`** now exports the theme system on its own (2.85 kB brotlied, no React on the resolution path). That entry is useful beyond the CLI: a build script or Server Component can emit theme CSS without pulling the component library.

New public API on it (also on the main entry): **`parseThemeFile`** and **`themeFileToCSS`**. `parseThemeFile` is deliberately strict — `createTheme` turns a malformed hex into `NaN NaN% NaN%` and the failure only surfaces as an unstyled app, so a bad value is now rejected where it is written, with a message naming the key. Unknown keys are errors too: a typo'd `primaryColor` would otherwise be dropped silently and ship the default brand.

The playground's contrast panel was also corrected. It claimed a failing row meant the brand hue was unusable, but those rows can't fail — foregrounds are picked as black or white, and `contrast(white, bg) × contrast(black, bg) ≡ 21` puts the winning side at ≥ 4.58:1 for any color. It now measures what genuinely can fail: the brand color used *as text* on a page background, which is how `Navbar`/`Sidebar` active items, link buttons, and `TenantSwitcher` render it. A pale hue passes as a button fill and fails as text, often in one color mode only.
