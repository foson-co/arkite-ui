import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

/**
 * Smoke test for `arkite-ui theme apply`.
 *
 * The CLI generates through the built `dist/theme.js` on purpose — sharing the
 * library's color derivation instead of re-implementing it — so this suite
 * needs a build. The generation logic itself is covered without one in
 * `src/theme/theme-file.test.ts`; what runs here is the wiring the unit tests
 * can't see: argument handling, file IO, and exit codes. CI's `test` job runs
 * before `build`, so it skips loudly rather than silently passing.
 */

const CLI = resolve(__dirname, '../../cli/init.mjs')
const DIST = resolve(__dirname, '../../dist/theme.js')
const built = existsSync(DIST)

function run(dir: string, args: string[]) {
  return execFileSync('node', [CLI, ...args], { cwd: dir, encoding: 'utf-8' })
}

/** Runs the CLI expecting failure; returns stderr + the exit code. */
function runExpectingFailure(dir: string, args: string[]) {
  try {
    execFileSync('node', [CLI, ...args], { cwd: dir, encoding: 'utf-8', stdio: 'pipe' })
    throw new Error('expected the CLI to exit non-zero')
  } catch (err) {
    const e = err as { status?: number; stderr?: string }
    return { status: e.status, stderr: e.stderr ?? '' }
  }
}

describe.skipIf(!built)('theme apply CLI (smoke)', () => {
  let dir: string

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'arkite-theme-'))
    writeFileSync(
      join(dir, 'arkite.theme.json'),
      JSON.stringify({ name: 'acme', primary: '#6a4dff', accent: '#00b4d8', radius: '0.75rem' })
    )
  })

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('writes CSS to the default path, creating the directory', () => {
    const out = run(dir, ['theme', 'apply'])
    const css = readFileSync(join(dir, 'src/styles/arkite-theme.css'), 'utf-8')

    expect(out).toContain('src/styles/arkite-theme.css')
    expect(css).toContain(':root {')
    expect(css).toContain('--radius: 0.75rem;')
    expect(css).not.toContain('NaN')
  })

  it('names its source in the generated header', () => {
    const css = readFileSync(join(dir, 'src/styles/arkite-theme.css'), 'utf-8')
    expect(css).toContain('arkite.theme.json')
    expect(css).toContain('do not edit')
  })

  it('takes an explicit source file and --out', () => {
    writeFileSync(join(dir, 'brand.json'), JSON.stringify({ primary: '#e11d48' }))
    run(dir, ['theme', 'apply', 'brand.json', '--out', 'styles/brand.css'])

    const css = readFileSync(join(dir, 'styles/brand.css'), 'utf-8')
    expect(css).toContain('brand.json')
    expect(css).toMatch(/--primary: \d+ \d+% \d+%;/)
  })

  it('prints to stdout with --print and writes nothing', () => {
    const out = run(dir, ['theme', 'apply', '--print'])
    expect(out).toContain(':root {')
    expect(existsSync(join(dir, 'src/styles/printed.css'))).toBe(false)
  })

  it('scopes tokens with --selector', () => {
    const out = run(dir, ['theme', 'apply', '--print', '--selector', '[data-tenant="acme"]'])
    expect(out).toContain('[data-tenant="acme"] {')
  })

  it('exits 1 with an actionable message when the file is missing', () => {
    const { status, stderr } = runExpectingFailure(dir, ['theme', 'apply', 'nope.json'])
    expect(status).toBe(1)
    expect(stderr).toContain('No theme file at')
  })

  it('exits 1 on a malformed hex rather than emitting NaN tokens', () => {
    writeFileSync(join(dir, 'bad.json'), JSON.stringify({ primary: 'rebeccapurple' }))
    const { status, stderr } = runExpectingFailure(dir, ['theme', 'apply', 'bad.json'])
    expect(status).toBe(1)
    expect(stderr).toContain('must be a hex color')
  })

  it('exits 1 on invalid JSON', () => {
    writeFileSync(join(dir, 'broken.json'), '{ primary: }')
    const { status, stderr } = runExpectingFailure(dir, ['theme', 'apply', 'broken.json'])
    expect(status).toBe(1)
    expect(stderr).toContain('not valid JSON')
  })

  it('lists the theme command in the top-level help', () => {
    const help = run(dir, [])
    expect(help).toContain('theme apply')
    expect(help).toContain('arkite.theme.json')
  })
})
