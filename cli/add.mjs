/**
 * `arkite-ui add <recipe>` — install a whole-page composition as your source.
 *
 * The recipes were already tested compositions, but reading one in Storybook
 * and hand-copying it is a transcription step where the wiring gets lost. This
 * writes the file, so the starting point is known-good code the project owns
 * and edits — the same reason an agent should reach for `add` instead of
 * assembling a page from prop signatures.
 *
 * Everything it needs comes from registry.json: what exists, where the source
 * lives, and the one import rewrite that turns a repo-relative demo into a
 * package consumer.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const registryPath = join(here, '../registry.json')

const DEFAULT_DIR = 'src/pages'

function success(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

function log(msg) {
  console.log(`\x1b[36m◆\x1b[0m ${msg}`)
}

function fail(msg, hint) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`)
  if (hint) console.error(`  \x1b[2m${hint}\x1b[0m`)
  process.exit(1)
}

export function addHelp() {
  return `
Commands:
  add                  List the available recipes
  add <recipe>         Copy a recipe into your project

Options:
  --out <path>         Destination file (default: ${DEFAULT_DIR}/<Name>.tsx)
  --name <Component>   Rename the exported component (and the default filename)
  --force              Overwrite an existing file

Usage:
  npx @arkite-ui/core add
  npx @arkite-ui/core add crud-list-page
  npx @arkite-ui/core add crud-list-page --name OrdersPage
`
}

function readRegistry() {
  if (!existsSync(registryPath)) {
    fail('registry.json is missing from the package.')
  }
  return JSON.parse(readFileSync(registryPath, 'utf-8'))
}

function listRecipes(registry) {
  console.log('')
  for (const recipe of registry.recipes) {
    console.log(`  \x1b[1m${recipe.name}\x1b[0m  \x1b[2m${recipe.title}\x1b[0m`)
    console.log(`    ${recipe.summary}`)
    console.log(`    \x1b[32m✓\x1b[0m ${recipe.when}`)
    console.log(`    \x1b[31m✗\x1b[0m ${recipe.notWhen}`)
    console.log('')
  }
  console.log(`  \x1b[2mnpx @arkite-ui/core add <recipe>\x1b[0m`)
  console.log('')
}

function flag(args, name) {
  const i = args.indexOf(name)
  if (i === -1) return undefined
  const value = args[i + 1]
  if (!value || value.startsWith('--')) fail(`${name} needs a value.`)
  return value
}

/** The component the demo exports — the thing worth renaming. */
function exportedComponent(source) {
  const match = source.match(/export function (\w+)\(/)
  return match ? match[1] : null
}

/**
 * Top-level SCREAMING_CASE consts, which is how every recipe holds its mock
 * data. Naming them in the header beats a generic "replace the mock data":
 * the reader gets a checklist instead of a hunt.
 */
function mockConstants(source) {
  return [...source.matchAll(/^const ([A-Z][A-Z0-9_]+)(?::|\s*=)/gm)].map((m) => m[1])
}

function transform(source, recipe, registry, componentName) {
  const { from, to } = registry.install.importRewrite
  let out = source.split(`from '${from}'`).join(`from '${to}'`)

  const original = exportedComponent(source)
  if (componentName && original && componentName !== original) {
    out = out.replace(new RegExp(`\\b${original}\\b`, 'g'), componentName)
  }

  const mocks = mockConstants(source)
  const todo = mocks.length
    ? ` * TODO: replace the sample data (${mocks.join(', ')}) with your API.\n`
    : ''

  const header = `/*
 * Adapted from the "${recipe.title}" recipe in ${registry.package}.
 * ${registry.docsBase}${recipe.docs}
 *
 * This file is yours now — edit it freely; the package will never update it.
${todo} */
`
  return `${header}${out}`
}

/**
 * @param {string[]} args argv after the `add` command
 * @param {string}   cwd  directory the user ran the command in
 */
export async function runAdd(args, cwd = process.cwd()) {
  const registry = readRegistry()
  const name = args.find((a) => !a.startsWith('--') && !isFlagValue(args, a))

  if (name === undefined) {
    listRecipes(registry)
    return
  }

  const recipe = registry.recipes.find((r) => r.name === name)
  if (!recipe) {
    fail(`Unknown recipe: ${name}`, `Available: ${registry.recipes.map((r) => r.name).join(', ')}`)
  }

  if (recipe.files.length !== 1) {
    fail(
      `Recipe "${name}" has ${recipe.files.length} files; only single-file recipes are supported.`
    )
  }

  const sourcePath = join(here, '..', recipe.files[0])
  if (!existsSync(sourcePath)) {
    fail(`Recipe source is missing from the package: ${recipe.files[0]}`)
  }
  const source = readFileSync(sourcePath, 'utf-8')

  const componentName = flag(args, '--name') ?? exportedComponent(source)
  if (!componentName) {
    fail(`Could not find an exported component in ${recipe.files[0]}.`)
  }

  const outPath = resolve(cwd, flag(args, '--out') ?? join(DEFAULT_DIR, `${componentName}.tsx`))
  if (existsSync(outPath) && !args.includes('--force')) {
    fail(
      `${relative(cwd, outPath)} already exists.`,
      'Pass --force to overwrite, or --out to write somewhere else.'
    )
  }

  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, transform(source, recipe, registry, componentName), 'utf-8')

  success(`Wrote ${relative(cwd, outPath)}`)
  log(`Composes: ${recipe.uses.join(', ')}`)
  const mocks = mockConstants(source)
  if (mocks.length) {
    log(`Replace the sample data with your API: ${mocks.join(', ')}`)
  }
}

/** True when `value` is consumed as the argument of a --flag. */
function isFlagValue(args, value) {
  const i = args.indexOf(value)
  return i > 0 && ['--out', '--name'].includes(args[i - 1])
}
