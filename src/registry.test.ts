import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Recipe registry integrity.
 *
 * `registry.json` is the machine-readable index of installable compositions:
 * it feeds llms.txt (so AI agents get verified page-level exemplars instead of
 * inventing wiring) and, later, the `arkite-ui add <recipe>` CLI.
 *
 * A stale registry is worse than no registry — a recipe that no longer
 * compiles, or a `uses` list that lies, teaches every consumer the wrong
 * pattern at once. These tests make drift a red CI job:
 *
 *   - every referenced file exists
 *   - every name in `uses` is a real public export
 *   - `uses` matches what the demo actually imports (both directions)
 *   - every demo on disk has a registry entry (no invisible recipes)
 */

const root = resolve(__dirname, '..')
const registry = JSON.parse(readFileSync(resolve(root, 'registry.json'), 'utf8'))
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const RECIPE_DIR = resolve(root, 'src/stories/recipes')

interface Recipe {
  name: string
  title: string
  summary: string
  when: string
  notWhen: string
  docs: string
  uses: string[]
  files: string[]
}

/** Exports the demo pulls from the library, ignoring React and type-only imports. */
function importedNames(source: string): string[] {
  const block = source.match(/import \{([^}]*)\} from '\.\.\/\.\.\/index'/)
  if (!block) return []
  return block[1]
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('type '))
}

describe('registry.json', () => {
  // Pulling the barrel transforms the entire component tree. Left inside an
  // `it`, that one-off cost lands on whichever recipe happens to run first
  // and is billed against that test's timeout — fine locally at ~440ms, but
  // CI runs ~8x slower per operation, which put the first recipe over the
  // old 5s limit (and the second one with it, still awaiting the same
  // in-flight import). Paying it in a hook with its own budget keeps every
  // recipe's reported timing honest.
  let lib: Record<string, unknown>
  beforeAll(async () => {
    lib = (await import('./index')) as Record<string, unknown>
  }, 60_000)

  it('declares the package it belongs to', () => {
    expect(registry.version).toBe(1)
    expect(registry.package).toBe(pkg.name)
  })

  it('ships inside the npm package', () => {
    expect(pkg.files).toContain('registry.json')
    // the recipe sources themselves — an index pointing at files that don't
    // ship would be useless to a consumer (and to `arkite-ui add` later)
    expect(pkg.files).toContain('src/stories/recipes/*.demo.tsx')
  })

  it('has unique kebab-case recipe names', () => {
    const names = registry.recipes.map((r: { name: string }) => r.name)
    expect(new Set(names).size).toBe(names.length)
    for (const name of names) expect(name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('covers every recipe demo on disk', () => {
    const onDisk = readdirSync(RECIPE_DIR)
      .filter((f) => f.endsWith('.demo.tsx'))
      .map((f) => `src/stories/recipes/${f}`)
      .sort()
    const registered = registry.recipes.flatMap((r: { files: string[] }) => r.files).sort()
    expect(registered).toEqual(onDisk)
  })

  for (const recipe of registry.recipes as Recipe[]) {
    describe(recipe.name, () => {
      const { files, uses } = recipe

      it('carries the intent fields an agent selects on', () => {
        for (const field of ['title', 'summary', 'when', 'notWhen', 'docs'] as const) {
          expect(recipe[field].length).toBeGreaterThan(0)
        }
        expect(recipe.docs).toMatch(/^\/\?path=\/docs\//)
      })

      it('references files that exist and use the documented import path', () => {
        expect(files.length).toBeGreaterThan(0)
        for (const file of files) {
          const source = readFileSync(resolve(root, file), 'utf8')
          expect(source).toContain(registry.install.importRewrite.from)
        }
      })

      it('lists exactly what the demo imports from the library', () => {
        const actual = files
          .flatMap((file) => importedNames(readFileSync(resolve(root, file), 'utf8')))
          .sort()

        expect([...uses].sort()).toEqual(actual)
        for (const name of uses) expect(lib).toHaveProperty(name)
      })
    })
  }
})
