import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import ts from 'typescript'

/**
 * `arkite-ui add <recipe>` — the install path for whole-page recipes.
 *
 * Unlike `theme apply`, this needs no build: it reads registry.json and the
 * recipe sources as plain text, so the full suite runs in CI's `test` job.
 *
 * What's worth testing is the transform. Recipe sources are already covered
 * (registry.test.ts pins the import list, `pnpm typecheck` compiles them), so
 * these assert that copying them out doesn't break them: the repo-relative
 * import is gone, a rename is complete rather than partial, and the result
 * still parses as TSX.
 */

const CLI = resolve(__dirname, '../../cli/init.mjs')
const REGISTRY = JSON.parse(readFileSync(resolve(__dirname, '../../registry.json'), 'utf-8'))

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'arkite-add-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

function run(args: string[]) {
  return execFileSync('node', [CLI, ...args], { cwd: dir, encoding: 'utf-8' })
}

function runExpectingFailure(args: string[]) {
  try {
    execFileSync('node', [CLI, ...args], { cwd: dir, encoding: 'utf-8', stdio: 'pipe' })
    throw new Error('expected the CLI to exit non-zero')
  } catch (err) {
    const e = err as { status?: number; stderr?: string }
    return { status: e.status, stderr: e.stderr ?? '' }
  }
}

/** Syntax-only check: does the emitted file still parse as TSX? */
function parseDiagnostics(source: string) {
  return ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ESNext },
    fileName: 'Recipe.tsx',
  }).diagnostics
}

describe('add CLI — listing', () => {
  it('lists every recipe with the fields you choose on', () => {
    const out = run(['add'])
    for (const recipe of REGISTRY.recipes) {
      expect(out).toContain(recipe.name)
      expect(out).toContain(recipe.when)
      expect(out).toContain(recipe.notWhen)
    }
  })

  it('is reachable from the top-level help', () => {
    expect(run([])).toContain('add <recipe>')
  })
})

describe('add CLI — writing', () => {
  it('writes to src/pages/<Component>.tsx by default', () => {
    const out = run(['add', 'crud-list-page'])
    expect(out).toContain('src/pages/CrudListPage.tsx')
    expect(existsSync(join(dir, 'src/pages/CrudListPage.tsx'))).toBe(true)
  })

  it('rewrites the repo-relative import to the package', () => {
    run(['add', 'crud-list-page'])
    const source = readFileSync(join(dir, 'src/pages/CrudListPage.tsx'), 'utf-8')

    expect(source).toContain(`from '${REGISTRY.install.importRewrite.to}'`)
    expect(source).not.toContain(REGISTRY.install.importRewrite.from)
  })

  it('marks the file as owned by the project and names the sample data', () => {
    const out = run(['add', 'crud-list-page'])
    const source = readFileSync(join(dir, 'src/pages/CrudListPage.tsx'), 'utf-8')

    expect(source).toContain('CRUD List Page')
    expect(source).toContain('the package will never update it')
    expect(source).toContain('INITIAL_ORDERS')
    expect(out).toContain('INITIAL_ORDERS')
  })

  it('renames the component everywhere, leaving no trace of the original', () => {
    run(['add', 'crud-list-page', '--name', 'OrdersPage'])
    const source = readFileSync(join(dir, 'src/pages/OrdersPage.tsx'), 'utf-8')

    expect(source).toContain('export function OrdersPage()')
    expect(source).not.toMatch(/\bCrudListPage\b/)
  })

  it('honors --out', () => {
    run(['add', 'form-page', '--out', 'app/routes/new.tsx'])
    expect(existsSync(join(dir, 'app/routes/new.tsx'))).toBe(true)
  })

  for (const { name } of REGISTRY.recipes as Array<{ name: string }>) {
    it(`${name} still parses as TSX after the transform`, () => {
      run(['add', name, '--out', 'out.tsx'])
      const diagnostics = parseDiagnostics(readFileSync(join(dir, 'out.tsx'), 'utf-8'))
      expect(diagnostics ?? []).toEqual([])
    })
  }
})

describe('add CLI — guards', () => {
  it('refuses to clobber an existing file, and says how to proceed', () => {
    writeFileSync(join(dir, 'mine.tsx'), 'export const mine = 1\n')
    const { status, stderr } = runExpectingFailure(['add', 'crud-list-page', '--out', 'mine.tsx'])

    expect(status).toBe(1)
    expect(stderr).toContain('already exists')
    expect(stderr).toContain('--force')
    expect(readFileSync(join(dir, 'mine.tsx'), 'utf-8')).toBe('export const mine = 1\n')
  })

  it('overwrites with --force', () => {
    writeFileSync(join(dir, 'mine.tsx'), 'export const mine = 1\n')
    run(['add', 'crud-list-page', '--out', 'mine.tsx', '--force'])
    expect(readFileSync(join(dir, 'mine.tsx'), 'utf-8')).toContain('export function CrudListPage')
  })

  it('names the valid recipes when given an unknown one', () => {
    const { status, stderr } = runExpectingFailure(['add', 'crud-page'])
    expect(status).toBe(1)
    expect(stderr).toContain('Unknown recipe')
    expect(stderr).toContain('crud-list-page')
  })
})
