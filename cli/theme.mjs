/**
 * `arkite-ui theme apply` — turn a committed arkite.theme.json into CSS.
 *
 * The playground produces the JSON; this closes the loop so a project's brand
 * lives in one reviewable file instead of CSS variables copied between repos.
 * Generation goes through `@arkite-ui/core/theme` (the server-safe entry), so
 * the CLI shares the library's derivation rather than re-deriving colors here
 * — a second implementation would drift the moment a token is added.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const DEFAULT_SOURCE = 'arkite.theme.json'
const DEFAULT_OUT = 'src/styles/arkite-theme.css'

function log(msg) {
  console.log(`\x1b[36m◆\x1b[0m ${msg}`)
}

function success(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

function fail(msg, hint) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`)
  if (hint) console.error(`  \x1b[2m${hint}\x1b[0m`)
  process.exit(1)
}

export function themeHelp() {
  return `
Commands:
  theme apply [file]   Generate CSS variables from a theme file
                       (default: ${DEFAULT_SOURCE})

Options:
  --out <path>         Where to write the CSS (default: ${DEFAULT_OUT})
  --selector <sel>     Selector for the light tokens (default: :root)
  --print              Write to stdout instead of a file

Usage:
  npx @arkite-ui/core theme apply
  npx @arkite-ui/core theme apply themes/brand.json --out src/brand.css
  npx @arkite-ui/core theme apply --print > src/styles/arkite-theme.css
`
}

function flag(args, name, fallback) {
  const i = args.indexOf(name)
  if (i === -1) return fallback
  const value = args[i + 1]
  if (!value || value.startsWith('--')) fail(`${name} needs a value.`)
  return value
}

/**
 * @param {string[]} args argv after the `theme` command
 * @param {string}   cwd  directory the user ran the command in
 */
export async function runTheme(args, cwd = process.cwd()) {
  const sub = args[0]

  if (sub !== 'apply') {
    console.log(themeHelp())
    process.exit(sub === undefined || sub === '--help' ? 0 : 1)
  }

  const positional = args.slice(1).filter((a) => !a.startsWith('--'))
  const consumedByFlags = new Set(
    ['--out', '--selector'].map((name) => args[args.indexOf(name) + 1]).filter(Boolean)
  )
  const sourceArg = positional.find((a) => !consumedByFlags.has(a)) ?? DEFAULT_SOURCE

  const sourcePath = resolve(cwd, sourceArg)
  if (!existsSync(sourcePath)) {
    fail(
      `No theme file at ${relative(cwd, sourcePath) || sourceArg}`,
      `Create one in the Theme Playground (Foundation → Theme Playground) and save it as ${DEFAULT_SOURCE}.`
    )
  }

  // The generator lives in the package's own dist, imported relative to this
  // file so it resolves the same whether the CLI runs from node_modules or
  // from a checkout — and without needing react on the resolution path.
  const entry = join(here, '../dist/theme.js')
  if (!existsSync(entry)) {
    fail('The package build is missing (dist/theme.js).', 'Run `pnpm build` first if you are working in the repo.')
  }
  const { parseThemeFile, themeFileToCSS, ThemeFileError } = await import(entry)

  let parsed
  try {
    parsed = JSON.parse(readFileSync(sourcePath, 'utf-8'))
  } catch (err) {
    fail(`${sourceArg} is not valid JSON.`, err.message)
  }

  let css
  try {
    css = themeFileToCSS(parseThemeFile(parsed), {
      source: relative(cwd, sourcePath) || sourceArg,
      selector: flag(args, '--selector', ':root'),
    })
  } catch (err) {
    if (err instanceof ThemeFileError) {
      fail(`${sourceArg}: ${err.message}`, 'Keys: name, primary (required), accent, radius.')
    }
    throw err
  }

  if (args.includes('--print')) {
    process.stdout.write(css)
    return
  }

  const outPath = resolve(cwd, flag(args, '--out', DEFAULT_OUT))
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, css, 'utf-8')

  const rel = relative(cwd, outPath) || outPath
  success(`Wrote ${rel}`)
  log(`Import it after the library styles:`)
  console.log(`  \x1b[2m@import "@arkite-ui/core/styles.css";\x1b[0m`)
  console.log(`  \x1b[2m@import "./${rel.split('/').pop()}";\x1b[0m`)
}
